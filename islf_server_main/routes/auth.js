const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const pool = require("../db");

// SECURITY: JWT_SECRET is validated at startup in middleware/auth.js.
// By the time this module loads, the process would have exited if it were missing.
const JWT_SECRET = process.env.JWT_SECRET;

// Phase F — Rate limiting (D12 closure)
const { loginLimiter } = require('../middleware/rateLimiters');

// Phase K1: centralized role constants (replaces hardcoded 'admin' checks)
const { ADMIN_BYPASS_ROLES } = require('../constants/roles');

// POST /register — Phase F: requires authenticated admin.
// Public registration is disabled (D8 closure). Use POST /api/user for user creation.
router.post("/register", async (req, res) => {
  // Defence-in-depth: even if whitelist is misconfigured, only admin-tier roles may call this.
  // Phase K1: uses ADMIN_BYPASS_ROLES set instead of hardcoded 'admin' string.
  if (!req.user || !ADMIN_BYPASS_ROLES.has(req.user.role)) {
    return res.status(403).json({
      message: "Access denied: user registration is not publicly available. Contact your administrator."
    });
  }

  const { username, email, phone, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    // Check security settings
    const minPasswordLengthResult = await pool.query("SELECT value FROM settings WHERE key = 'min_password_length'");
    const minPasswordLength = minPasswordLengthResult.rows.length > 0 ? parseInt(minPasswordLengthResult.rows[0].value, 10) : 8;

    if (password.length < minPasswordLength) {
      return res.status(400).json({ message: `Password must be at least ${minPasswordLength} characters long.` });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id, username, email, phone",
      [username, email, phone, hashedPassword]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      res
        .status(409)
        .json({ message: "Username, email, or phone already exists" });
    } else {
      res.status(500).json({ message: "Database error", error: err });
    }
  }
});

// POST /login — Phase F: rate limited (10 req / 15 min per IP).
router.post("/login", loginLimiter, async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Identifier and password required" });
  }
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1 OR phone = $1",
      [identifier]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    // Fetch session timeout from settings
    const timeoutResult = await pool.query("SELECT value FROM settings WHERE key = 'session_timeout'");
    const sessionTimeout = timeoutResult.rows.length > 0 ? timeoutResult.rows[0].value : "30";
    const expiresIn = `${sessionTimeout}m`;

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        name: user.full_name || user.username,
        // Phase E: role embedded in JWT — eliminates per-request DB lookup in rbacEnforcer.
        // Old tokens without this field continue to work via the DB fallback.
        role: user.role || null,
        // Phase M1: Context embedded in JWT
        branch: user.branch || null,
        department: user.department || null,
        company_code: user.company_code || null,
      },
      JWT_SECRET,
      { expiresIn: expiresIn }
    );

    // Fetch permissions based on user role
    let permissions = [];
    if (user.role) {
      const permResult = await pool.query(
        "SELECT module_name, sub_module_name, can_read, can_write, can_delete FROM role_module_permissions WHERE role_name = $1",
        [user.role]
      );
      permissions = permResult.rows;
    }

    res.json({ token, name: user.username, role: user.role, permissions });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Verify password for lockscreen
router.post("/verify-password", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  try {
    // Accept username as identifier (username, email, or phone)
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1 OR phone = $1",
      [username]
    );
    const user = result.rows[0];
    let logUsername = "unknown";
    if (user && user.username) {
      logUsername = user.username;
    } else if (username) {
      logUsername = username;
    }
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Fetch session timeout from settings
    const timeoutResult = await pool.query("SELECT value FROM settings WHERE key = 'session_timeout'");
    const sessionTimeout = timeoutResult.rows.length > 0 ? timeoutResult.rows[0].value : "30";
    const expiresIn = `${sessionTimeout}m`;

    // Generate new JWT token for re-authentication
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        name: user.full_name || user.username,
        // Phase E: role embedded — keeps lockscreen token consistent with login token.
        role: user.role || null,
        // Phase M1: Context embedded in JWT
        branch: user.branch || null,
        department: user.department || null,
        company_code: user.company_code || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: expiresIn }
    );

    // Fetch permissions
    let permissions = [];
    if (user.role) {
      const permResult = await pool.query(
        "SELECT module_name, sub_module_name, can_read, can_write, can_delete FROM role_module_permissions WHERE role_name = $1",
        [user.role]
      );
      permissions = permResult.rows;
    }

    res.json({
      success: true,
      token: token,
      name: user.name || user.username,
      role: user.role,
      permissions
    });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Phase J — Token revocation on logout
const { revokeToken, evictTokenCache } = require('../utils/tokenRevocation');

// POST /logout — Phase J: revoke the current token.
// The token is hashed and stored in revoked_tokens. Raw token is NEVER persisted.
// Also whitelisted in middleware/auth.js so expired tokens can be revoked.
router.post("/logout", async (req, res) => {
  const rawToken = req.rawToken; // populated by authenticateToken even for whitelisted paths
  if (!rawToken) {
    // Already logged out or no token sent — treat as success
    return res.json({ message: "Logged out successfully." });
  }

  try {
    // Extract exp claim (may be undefined for tokens without expiry)
    let expiresAt = null;
    try {
      const decoded = jwt.decode(rawToken);
      if (decoded && decoded.exp) {
        expiresAt = new Date(decoded.exp * 1000);
      }
    } catch { /* leave expiresAt null */ }

    const userId = req.user?.userId || null;

    // Evict from in-memory cache before DB update to ensure next check hits DB
    evictTokenCache(rawToken);

    await revokeToken(rawToken, userId, expiresAt, pool);
    console.log(`🔒 [Logout] Token revoked for user_id=${userId} expires=${expiresAt}`);
    return res.json({ message: "Logged out successfully. Session revoked." });
  } catch (err) {
    if (err.code === '42P01') {
      // Table doesn't exist — still allow the logout response so client clears its token
      console.warn('[Logout] revoked_tokens table missing — logout acknowledged without server-side revocation.');
      return res.json({ message: "Logged out (server-side revocation unavailable — table not ready)." });
    }
    console.error('[Logout] Error revoking token:', err.message);
    // Return 200 anyway — client should still discard its local token
    return res.json({ message: "Logged out. Token revocation encountered an error." });
  }
});

module.exports = router;

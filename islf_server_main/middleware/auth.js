const jwt = require("jsonwebtoken");
const pool = require("../db");

// SECURITY: Fail fast if JWT_SECRET is not configured.
// A missing secret would fall back to a known default, allowing token forgery.
if (!process.env.JWT_SECRET) {
    console.error('[FATAL] JWT_SECRET environment variable is not set. Server startup aborted.');
    process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// Phase J — Token revocation utility (SHA-256 blacklist)
let _revokeUtils = null;
function getRevokeUtils() {
    if (!_revokeUtils) {
        try {
            _revokeUtils = require('../utils/tokenRevocation');
        } catch (e) {
            console.warn('[Auth] tokenRevocation utility not found — blacklist check disabled.');
        }
    }
    return _revokeUtils;
}

// Phase F: /api/auth/register removed from public whitelist (D8 closure).
// User creation now requires a valid JWT + admin permission.
const PUBLIC_ENDPOINTS = new Set([
    "/api/auth/login",
    "/api/auth/verify-password",
    "/api/auth/logout",       // Phase J: logout must be public so the token can be revoked even if expired
    "/api/password/forgot",
    "/api/password/reset",
    "/api/public/bootstrap-config"
]);

async function authenticateToken(req, res, next) {
    // Normalize path to ignore query parameters
    const path = (req.originalUrl || req.path || req.url || "").split('?')[0];

    // 1. Strict Explicit Whitelist Check
    if (PUBLIC_ENDPOINTS.has(path)) {
        console.log(`🔓 Public route bypass: [${req.method}] ${path}`);
        // Still attempt to populate req.user for logout so it can read userId/username
        const authHeader = req.headers["authorization"];
        const rawToken = authHeader && authHeader.split(" ")[1];
        if (rawToken) {
            try {
                // ignoreExpiration=true: allow expired tokens to be revoked on logout
                req.user = jwt.verify(rawToken, JWT_SECRET, { ignoreExpiration: true });
            } catch { /* token malformed — req.user stays undefined */ }
            req.rawToken = rawToken;
        }
        return next();
    }

    const authHeader = req.headers["authorization"];
    const rawToken = authHeader && authHeader.split(" ")[1];

    if (!rawToken) {
        console.warn(`⚠️ Access Denied: Missing token for ${path}`);
        return res.status(401).json({ message: "Authentication required" });
    }

    // 2. Verify JWT signature + expiry
    let user;
    try {
        user = jwt.verify(rawToken, JWT_SECRET);
    } catch (err) {
        console.warn(`⚠️ Access Denied: Invalid/Expired token for ${path}`);
        return res.status(401).json({ message: "Session expired or invalid token" });
    }

    // 3. Phase J — Token blacklist check (SHA-256 hash lookup)
    // Fail open in development if table doesn't exist; never crash production startup.
    const utils = getRevokeUtils();
    if (utils) {
        try {
            const revoked = await utils.isTokenRevoked(rawToken, pool);
            if (revoked) {
                console.warn(`⚠️ Access Denied: Revoked token used by user=${user.username} for ${path}`);
                return res.status(401).json({ message: "Session has been revoked. Please log in again." });
            }
        } catch (err) {
            if (err.code === '42P01') {
                // Table doesn't exist yet — fail open, log warning
                console.warn('[Auth] revoked_tokens table missing — blacklist check skipped (fail-open). Run server to create it.');
            } else {
                // Unexpected DB error — fail open (do NOT block valid users due to infra issues)
                console.error('[Auth] Blacklist check error (fail-open):', err.message);
            }
        }
    }

    req.user = user;
    req.rawToken = rawToken;   // expose for logout route
    next();
}

module.exports = { authenticateToken };

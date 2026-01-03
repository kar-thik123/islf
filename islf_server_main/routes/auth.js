const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const pool = require("../db");
const { logAuthEvent } = require("../log");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Debug: log the JWT secret being used
console.log("Auth JWT_SECRET loaded:", JWT_SECRET);

// Register user
router.post("/register", async (req, res) => {
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

// Login user
router.post("/login", async (req, res) => {
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

    // Debug: log user data
    console.log("User data from database:", user);
    console.log("Full name:", user.full_name);
    console.log("Username:", user.username);

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        name: user.full_name || user.username,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Debug: log token payload
    console.log("JWT token payload:", {
      userId: user.id,
      username: user.username,
      email: user.email,
      name: user.full_name || user.username,
    });
    await logAuthEvent({
      username: user.username,
      action: "LOGIN_SUCCESS",
      details: "User logged in successfully",
    });
    res.json({ token, name: user.username });
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

    // Generate new JWT token for re-authentication
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        name: user.full_name || user.username,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "24h" }
    );

    await logAuthEvent({
      username: logUsername,
      action: "UNLOCK_SUCCESS",
      details: "Screen unlocked successfully",
    });
    res.json({
      success: true,
      token: token,
      name: user.name || user.username,
    });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
});


module.exports = router;

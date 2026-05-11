const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const router = express.Router();

// SECURITY: JWT_SECRET is validated at startup in middleware/auth.js.
// By the time this module is called, process.env.JWT_SECRET is guaranteed to be set.
const JWT_SECRET = process.env.JWT_SECRET;
const pool = require('../db');
const { sendEmail } = require('../email');

// Phase F — Rate limiting (D12 closure)
const { forgotPasswordLimiter } = require('../middleware/rateLimiters');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// POST /forgot — Phase F: rate limited (5 req / hour per IP).
router.post('/forgot', forgotPasswordLimiter, async (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
        return res.status(400).json({ message: 'Email or phone required' });
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1 OR phone = $1', [identifier]);
        const user = result.rows[0];
        const username = user ? user.username : identifier;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.email) {
            return res.status(400).json({ message: 'No email associated with this account' });
        }
        // Phase F: FRONTEND_URL from env — no hardcoded localhost (D14 closure).
        // Set FRONTEND_URL in .env for production. Falls back to localhost for dev.
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
        const resetToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
        const resetUrl = `${frontendUrl}/auth/newpassword?token=${resetToken}`;
        const subject = 'Password Reset';
        const text = `Click the following link to reset your password: ${resetUrl}`;
        await sendEmail(user.email, subject, text);
        res.json({ message: 'Password reset link sent to email' });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err });
    }
});

// New password: verify token and update password (hashed)
router.post('/reset', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password required' });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);

        // Get current password to validate it's different
        const userResult = await pool.query('SELECT password, username FROM users WHERE id = $1', [payload.id]);
        if (!userResult.rows[0]) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentHashedPassword = userResult.rows[0].password;
        const username = userResult.rows[0].username || payload.email || 'unknown';

        // Check if new password is the same as current password
        const isSamePassword = await bcrypt.compare(newPassword, currentHashedPassword);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password must be different from current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, payload.id]);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Invalid or expired token', error: err });
    }
});

module.exports = router;
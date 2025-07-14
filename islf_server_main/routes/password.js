const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const pool = require('../db');
const { sendEmail } = require('../email');
const { logAuthEvent } = require('../log');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Forgot password: send reset token via email
router.post('/forgot', async (req, res) => {
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
        const resetToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
        const resetUrl = `http://localhost:4200/auth/newpassword?token=${resetToken}`;
        const subject = 'Password Reset';
        const text = `Click the following link to reset your password: ${resetUrl}`;
        await logAuthEvent({ username, action: 'FORGOT_PASSWORD_EMAIL_SENT', details: 'Password reset link sent' });
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
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, payload.id]);
        // Fetch username from users table, fallback to email or 'unknown'
        const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [payload.id]);
        let username = 'unknown';
        if (userResult.rows[0] && userResult.rows[0].username) {
          username = userResult.rows[0].username;
        } else if (payload.email) {
          username = payload.email;
        }
        await logAuthEvent({ username, action: 'RESET_PASSWORD_SUCCESS', details: 'Password updated successfully' });
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Invalid or expired token', error: err });
    }
});

module.exports = router;
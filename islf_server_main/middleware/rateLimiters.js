/**
 * Phase F — Shared Rate Limiters
 * Centralised so both routes/auth.js and routes/password.js import the same instances.
 * This ensures the counter is shared across all app instances (in-memory for single process).
 *
 * Rollback: remove the router.use() lines in routes/auth.js and routes/password.js.
 * This file can be left in place safely.
 */
'use strict';

const rateLimit = require('express-rate-limit');

/** Login limiter: 10 attempts per 15 minutes per IP */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
    },
    skipSuccessfulRequests: false,
});

/** Forgot-password limiter: 5 requests per hour per IP */
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many password reset requests from this IP. Please try again after 1 hour.',
    },
});

module.exports = { loginLimiter, forgotPasswordLimiter };

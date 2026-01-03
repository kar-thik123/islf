const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
console.log("JWT_SECRET loaded:", JWT_SECRET);

const PUBLIC_ENDPOINTS = new Set([
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/verify-password",
    "/api/password/forgot",
    "/api/password/reset",
    "/api/public/bootstrap-config"
]);

function authenticateToken(req, res, next) {
    // Normalize path to ignore query parameters
    const path = (req.originalUrl || req.path || req.url || "").split('?')[0];

    // 1. Strict Explicit Whitelist Check
    if (PUBLIC_ENDPOINTS.has(path)) {
        console.log(`🔓 Public route bypass: [${req.method}] ${path}`);
        return next();
    }

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        console.warn(`⚠️ Access Denied: Missing token for ${path}`);
        return res.status(401).json({ message: "Authentication required" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.warn(`⚠️ Access Denied: Invalid/Expired token for ${path}`);
            return res.status(401).json({ message: "Session expired or invalid token" });
        }

        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };

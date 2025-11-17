const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
console.log("JWT_SECRET loaded:", JWT_SECRET);

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        // No token → treat as system user
        req.user = { username: "system" };
        console.log("⚠️ No token → req.user = system");
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Invalid token → treat as system user
            req.user = { username: "system" };
            console.log("⚠️ Invalid token → req.user = system");
            return next();
        }

        req.user = user;
        console.log("✅ Valid JWT user:", user);
        next();
    });
}

module.exports = { authenticateToken };

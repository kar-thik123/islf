const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// JWT authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        // If no token, continue but set user as 'system'
        req.user = { username: 'system' };
        return next();
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // If token is invalid, continue but set user as 'system'
            req.user = { username: 'system' };
            return next();
        }
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken }; 
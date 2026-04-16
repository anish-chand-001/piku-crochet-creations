const jwt = require('jsonwebtoken');

/**
 * Middleware for protecting USER-facing routes.
 * Uses 'userToken' cookie — completely separate from admin 'token'.
 */
const userAuthMiddleware = (req, res, next) => {
    const token = req.cookies?.userToken;

    if (!token) {
        return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired session. Please log in again.' });
    }
};

module.exports = userAuthMiddleware;

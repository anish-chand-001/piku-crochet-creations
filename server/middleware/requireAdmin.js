const authMiddleware = require('./authMiddleware');

const requireAdmin = (req, res, next) => {
    authMiddleware(req, res, () => {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    });
};

module.exports = requireAdmin;

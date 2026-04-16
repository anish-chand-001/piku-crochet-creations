const requireCsrfHeader = (req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const requestedWith = req.headers['x-requested-with'];
        if (requestedWith !== 'XMLHttpRequest') {
            return res.status(403).json({ message: 'Invalid CSRF header' });
        }
    }
    next();
};

module.exports = requireCsrfHeader;

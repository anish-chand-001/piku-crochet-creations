const rateLimit = require('express-rate-limit');

const createLimiter = (options) => rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: options.message },
    skipFailedRequests: false,
    skipSuccessfulRequests: false
});

const loginLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts. Please wait 15 minutes and try again.'
});

const signupLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many new accounts created from this IP. Please try again in an hour.'
});

const cartLimiter = createLimiter({
    windowMs: 60 * 1000,
    max: 40,
    message: 'Too many cart updates. Please slow down and try again shortly.'
});

const orderLimiter = createLimiter({
    windowMs: 60 * 1000,
    max: 20,
    message: 'Too many order operations. Please wait a moment and try again.'
});

const adminLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: 'Too many requests from this IP. Please wait and try again.'
});

module.exports = {
    loginLimiter,
    signupLimiter,
    cartLimiter,
    orderLimiter,
    adminLimiter
};

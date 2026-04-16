const express = require('express');
const router = express.Router();
const userAuthController = require('../controllers/userAuthController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');
const requireCsrfHeader = require('../middleware/csrfHeader');
const { passport } = require('../config/passport');
const { loginLimiter, signupLimiter } = require('../middleware/rateLimiter');

router.post('/register', requireCsrfHeader, signupLimiter, userAuthController.register);
router.post('/login', requireCsrfHeader, loginLimiter, userAuthController.login);
router.post('/logout', requireCsrfHeader, userAuthController.logout);
router.get('/check', userAuthMiddleware, userAuthController.checkAuth);

// ── Google OAuth 2.0 ──────────────────────────────────────────────────────────
// Step 1: Redirect user to Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account' // Always show account picker
}));

// Step 2: Google redirects back here after user grants access
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err || !user) {
            console.error('Google OAuth error:', err || info);
            const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
            return res.redirect(`${clientUrl}/login?error=auth_failed`);
        }
        req.user = user;
        next();
    })(req, res, next);
}, userAuthController.googleCallback);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const requireAdmin = require('../middleware/requireAdmin');
const requireCsrfHeader = require('../middleware/csrfHeader');
const { loginLimiter, adminLimiter } = require('../middleware/rateLimiter');

router.post('/login', requireCsrfHeader, loginLimiter, authController.login);
router.post('/logout', requireCsrfHeader, authController.logout);
router.get('/check', requireAdmin, authController.checkAuth);
router.post('/register', requireAdmin, adminLimiter, authController.register);
router.post('/forgot-password', requireCsrfHeader, adminLimiter, authController.forgotPassword);
router.post('/reset-password/:token', requireCsrfHeader, adminLimiter, authController.resetPassword);

module.exports = router;

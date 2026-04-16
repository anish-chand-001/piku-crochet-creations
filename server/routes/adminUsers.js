const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');
const { adminLimiter } = require('../middleware/rateLimiter');
const adminUserController = require('../controllers/adminUserController');

router.get('/users', requireAdmin, adminLimiter, adminUserController.getUsers);

module.exports = router;

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const requireAdmin = require('../middleware/requireAdmin');
const { adminLimiter } = require('../middleware/rateLimiter');

// Get overall site statistics for the admin dashboard
router.get('/', requireAdmin, adminLimiter, statsController.getStats);

module.exports = router;

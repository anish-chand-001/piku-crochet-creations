const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');

// Get overall site statistics for the admin dashboard
router.get('/', authMiddleware, statsController.getStats);

module.exports = router;

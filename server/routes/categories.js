const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const requireAdmin = require('../middleware/requireAdmin');
const requireCsrfHeader = require('../middleware/csrfHeader');
const { adminLimiter } = require('../middleware/rateLimiter');

router.get('/', categoryController.getCategories); // Public or protected depending on needs, made public since frontend might use it
router.post('/', requireAdmin, requireCsrfHeader, adminLimiter, categoryController.createCategory);
router.delete('/:id', requireAdmin, requireCsrfHeader, adminLimiter, categoryController.deleteCategory);

module.exports = router;

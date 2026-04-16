const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const requireAdmin = require('../middleware/requireAdmin');
const upload = require('../middleware/uploadMiddleware');
const requireCsrfHeader = require('../middleware/csrfHeader');
const { adminLimiter } = require('../middleware/rateLimiter');

router.get('/', productController.getProducts); // Publicly accessible for frontend
router.post('/', requireAdmin, requireCsrfHeader, adminLimiter, upload.array('images', 10), productController.createProduct);
router.put('/:id', requireAdmin, requireCsrfHeader, adminLimiter, upload.array('images', 10), productController.updateProduct);
router.delete('/:id', requireAdmin, requireCsrfHeader, adminLimiter, productController.deleteProduct);

module.exports = router;

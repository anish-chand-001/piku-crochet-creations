const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const requireCsrfHeader = require('../middleware/csrfHeader');
const { orderLimiter, adminLimiter } = require('../middleware/rateLimiter');

// User routes
router.post('/', userAuthMiddleware, requireCsrfHeader, orderLimiter, orderController.createOrder);
router.get('/me', userAuthMiddleware, orderController.getUserOrders);

// Admin routes (protected by existing admin auth)
router.get('/', requireAdmin, adminLimiter, orderController.getAllOrders);
router.put('/:id/status', requireAdmin, requireCsrfHeader, adminLimiter, orderLimiter, orderController.updateOrderStatus);

module.exports = router;

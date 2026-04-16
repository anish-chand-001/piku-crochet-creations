const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');
const requireCsrfHeader = require('../middleware/csrfHeader');
const { cartLimiter } = require('../middleware/rateLimiter');

router.use(userAuthMiddleware);
router.use(requireCsrfHeader);
router.use(cartLimiter);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:productId', cartController.updateQuantity);
router.delete('/:productId', cartController.removeItem);

module.exports = router;

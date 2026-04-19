const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');

// Protect all wishlist routes using existing auth middleware
router.use(userAuthMiddleware);

router.get('/', wishlistController.getWishlist);
router.post('/:productId', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;

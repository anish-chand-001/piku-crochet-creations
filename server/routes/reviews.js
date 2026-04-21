const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');

// Public route to get reviews
router.get('/:productId', reviewController.getReviews);

// Protected routes
router.get('/eligibility/:productId', userAuthMiddleware, reviewController.checkEligibility);
router.post('/:productId', userAuthMiddleware, reviewController.addReview);

module.exports = router;

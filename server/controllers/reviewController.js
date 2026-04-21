const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { validateObjectId } = require('../utils/validators');

exports.getReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!validateObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const reviews = await Review.find({ productId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
};

exports.checkEligibility = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        if (!validateObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        // Check if user has purchased this product and order is not cancelled
        const hasPurchased = await Order.exists({
            userId,
            'items.productId': productId,
            orderStatus: { $ne: 'cancelled' }
        });

        const hasReviewed = await Review.exists({
            userId,
            productId
        });

        res.json({
            eligible: !!hasPurchased && !hasReviewed,
            hasPurchased: !!hasPurchased,
            hasReviewed: !!hasReviewed
        });
    } catch (error) {
        console.error('Check eligibility error:', error);
        res.status(500).json({ message: 'Error checking review eligibility' });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;
        let { rating, comment } = req.body;

        if (!validateObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        rating = Number(rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
        }

        // Validate eligibility
        const hasPurchased = await Order.exists({
            userId,
            'items.productId': productId,
            orderStatus: { $ne: 'cancelled' }
        });

        if (!hasPurchased) {
            return res.status(403).json({ message: 'You can only review products you have purchased.' });
        }

        const existingReview = await Review.findOne({ userId, productId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product.' });
        }

        const newReview = await Review.create({
            userId,
            productId,
            rating,
            comment: comment ? String(comment).trim().substring(0, 1000) : ''
        });

        // Calculate new average
        const allReviews = await Review.find({ productId });
        const reviewCount = allReviews.length;
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / reviewCount;

        await Product.findByIdAndUpdate(productId, {
            averageRating: Number(averageRating.toFixed(1)),
            reviewCount
        });

        // Send back populated review
        await newReview.populate('userId', 'name');

        res.status(201).json({
            message: 'Review added successfully',
            review: newReview
        });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ message: 'Error adding review' });
    }
};

exports.editReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.userId;
        let { rating, comment } = req.body;

        if (!validateObjectId(reviewId)) {
            return res.status(400).json({ message: 'Invalid review id' });
        }

        rating = Number(rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to edit this review' });
        }

        review.rating = rating;
        review.comment = comment ? String(comment).trim().substring(0, 1000) : '';
        await review.save();

        // Calculate new average
        const allReviews = await Review.find({ productId: review.productId });
        const reviewCount = allReviews.length;
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / reviewCount;

        await Product.findByIdAndUpdate(review.productId, {
            averageRating: Number(averageRating.toFixed(1))
        });

        // Send back populated review
        await review.populate('userId', 'name');

        res.json({
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        console.error('Edit review error:', error);
        res.status(500).json({ message: 'Error editing review' });
    }
};

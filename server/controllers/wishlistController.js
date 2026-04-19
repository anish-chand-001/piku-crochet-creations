const User = require('../models/User');

exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.wishlist) {
            user.wishlist = [];
        }

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }

        res.status(200).json({ message: 'Added to wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ message: 'Server error adding to wishlist' });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.wishlist) {
            user.wishlist = [];
        }

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        res.status(200).json({ message: 'Removed from wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ message: 'Server error removing from wishlist' });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Populate to optionally return full product details if needed by frontend
        const user = await User.findById(userId).populate('wishlist', 'name price imageUrl images category');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ wishlist: user.wishlist || [] });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ message: 'Server error fetching wishlist' });
    }
};

const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const MAX_QUANTITY = 10;
const normalizeQuantity = (value) => Math.max(1, Math.min(Number(value) || 1, MAX_QUANTITY));

/**
 * Clears all items from a user's cart.
 * Exported for use by orderController after order creation.
 */
const clearCart = async (userId) => {
    await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [], checkoutLockedUntil: null } },
        { returnDocument: 'after' }
    );
};

exports.clearCart = clearCart;

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.userId }).populate({
            path: 'items.productId',
            select: 'name price images imageUrl'
        });

        if (!cart || cart.items.length === 0) {
            return res.json({ items: [], total: 0 });
        }

        const items = cart.items
            .map((item) => {
                const product = item.productId;
                if (!product) return null;
                const image = product.images?.[0] || product.imageUrl || '';
                return {
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    image,
                    quantity: item.quantity,
                    subtotal: product.price * item.quantity
                };
            })
            .filter(Boolean);

        const total = items.reduce((sum, i) => sum + i.subtotal, 0);
        res.json({ items, total });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Error fetching cart' });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Validate ObjectId format before hitting DB — prevents cryptic 500 errors
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const product = await Product.findById(productId).select('_id');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const normalizedQuantity = normalizeQuantity(quantity);
        const objectId = new mongoose.Types.ObjectId(productId);

        // Simple, reliable read-modify-write — works on all MongoDB versions
        let cart = await Cart.findOne({ userId: req.user.userId });

        if (!cart) {
            // First cart item for this user — create the cart
            cart = new Cart({
                userId: req.user.userId,
                items: [{ productId: objectId, quantity: normalizedQuantity }]
            });
        } else {
            const existingItem = cart.items.find(
                (item) => item.productId.toString() === objectId.toString()
            );

            if (existingItem) {
                // Product already in cart — increment, capped at MAX_QUANTITY
                existingItem.quantity = Math.min(
                    existingItem.quantity + normalizedQuantity,
                    MAX_QUANTITY
                );
            } else {
                // New product — push to cart
                cart.items.push({ productId: objectId, quantity: normalizedQuantity });
            }
        }

        await cart.save();
        res.json({ message: 'Item added to cart', itemCount: cart.items.length });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Error adding to cart' });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const quantity = normalizeQuantity(req.body.quantity);

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        const objectId = new mongoose.Types.ObjectId(productId);

        const cart = await Cart.findOneAndUpdate(
            { userId: req.user.userId, 'items.productId': objectId },
            { $set: { 'items.$[item].quantity': quantity } },
            {
                arrayFilters: [{ 'item.productId': objectId }],
                returnDocument: 'after'
            }
        );

        if (!cart) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        res.json({ message: 'Quantity updated' });
    } catch (error) {
        console.error('Update quantity error:', error);
        res.status(500).json({ message: 'Error updating quantity' });
    }
};

exports.removeItem = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        const objectId = new mongoose.Types.ObjectId(productId);

        const cart = await Cart.findOneAndUpdate(
            { userId: req.user.userId },
            { $pull: { items: { productId: objectId } } },
            { returnDocument: 'after' }
        );

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove item error:', error);
        res.status(500).json({ message: 'Error removing item' });
    }
};

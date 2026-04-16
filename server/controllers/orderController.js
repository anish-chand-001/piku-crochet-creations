const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { clearCart } = require('./cartController');
const { validateMobile, validateAddress, sanitizeString, validateObjectId } = require('../utils/validators');
const { logAdminAction } = require('../utils/adminLogger');

const PAYMENT_WINDOW_MINUTES = 30;

const expirePendingOrders = async () => {
    const cutoff = new Date(Date.now() - PAYMENT_WINDOW_MINUTES * 60 * 1000);
    await Order.updateMany(
        {
            paymentStatus: 'pending_payment',
            createdAt: { $lt: cutoff }
        },
        {
            $set: {
                paymentStatus: 'failed',
                orderStatus: 'cancelled',
                'paymentLog.note': 'Payment window expired'
            }
        }
    );
};

exports.createOrder = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        const name = sanitizeString(req.body.name) || (user ? user.name : '');
        let mobile = sanitizeString(req.body.mobile);
        let address = sanitizeString(req.body.address);

        // Fallback to storing values if they exist and request was empty
        if (user) {
            mobile = mobile || user.mobile;
            address = address || user.address;
        }

        if (!name || !mobile || !address) {
            return res.status(400).json({ message: 'Name, mobile number, and delivery address are required' });
        }

        if (!validateMobile(mobile)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit Indian mobile number' });
        }

        if (!validateAddress(address)) {
            return res.status(400).json({ message: 'Please enter a complete delivery address with at least 10 characters' });
        }

        await expirePendingOrders();

        const lockExpiration = new Date(Date.now() + 5 * 60 * 1000);
        const lockedCart = await Cart.findOneAndUpdate(
            {
                userId: req.user.userId,
                $or: [
                    { checkoutLockedUntil: null },
                    { checkoutLockedUntil: { $lt: new Date() } }
                ]
            },
            { $set: { checkoutLockedUntil: lockExpiration } },
            { returnDocument: 'after' }
        );

        if (!lockedCart) {
            return res.status(429).json({ message: 'Checkout already in progress. Please wait a moment and try again.' });
        }

        const cart = await Cart.findOne({ userId: req.user.userId }).populate({
            path: 'items.productId',
            select: 'name price images imageUrl'
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty. Add products before placing an order.' });
        }

        const items = [];
        let totalAmount = 0;

        for (const cartItem of cart.items) {
            const product = cartItem.productId;
            if (!product) continue;
            const image = product.images?.[0] || product.imageUrl || '';
            const itemTotal = product.price * cartItem.quantity;
            totalAmount += itemTotal;
            items.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image
            });
        }

        if (items.length === 0) {
            return res.status(400).json({ message: 'No valid products in cart' });
        }



        const order = await Order.create({
            userId: req.user.userId,
            name,
            email: user?.email || req.user.email,
            mobile,
            address,
            items,
            totalAmount,
            paymentStatus: 'pending_payment',
            paymentLog: {
                amount: totalAmount,
                timestamp: new Date(),
                items,
                note: 'Order created and awaiting payment verification'
            },
            orderStatus: 'pending'
        });

        if (user) {
            let profileUpdated = false;
            // Only save if missing from profile, so future orders auto-fill
            if (!user.mobile || user.mobile === '') {
                user.mobile = mobile;
                profileUpdated = true;
            }
            if (!user.address || user.address === '') {
                user.address = address;
                profileUpdated = true;
            }
            if (profileUpdated) {
                await user.save();
            }
        }

        await clearCart(req.user.userId);

        res.status(201).json({
            message: 'Order placed successfully',
            orderId: order._id,
            order
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Error placing order. Please try again.' });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        await expirePendingOrders();
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ message: 'Error fetching your orders' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        await expirePendingOrders();
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        const status = req.query.status ? sanitizeString(req.query.status) : null;
        const query = status ? { orderStatus: status } : {};
        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalOrders: total
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const orderStatus = sanitizeString(req.body.orderStatus);

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid order id' });
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ message: 'Invalid order status' });
        }

        const order = await Order.findByIdAndUpdate(id, { orderStatus }, { returnDocument: 'after' });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        logAdminAction(req, 'updated order status', `${id} -> ${orderStatus}`);
        res.json(order);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

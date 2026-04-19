const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    // Snapshot at time of order (price/name may change later)
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: '' }
});

const paymentLogSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    items: { type: [orderItemSchema], required: true },
    note: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Delivery details snapshot
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    // Structured delivery details snapshot
    pincode: { type: String },
    city: { type: String },
    state: { type: String },
    apartment: { type: String },
    houseNumber: { type: String },
    addressLine: { type: String },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    paymentStatus: {
        type: String,
        enum: ['pending_payment', 'confirmed', 'failed'],
        default: 'pending_payment'
    },
    paymentLog: paymentLogSchema,
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true });

orderSchema.index({ userId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);

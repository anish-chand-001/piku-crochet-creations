const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    // Null for Google-only accounts
    password: {
        type: String,
        default: null
    },
    // Set for Google OAuth accounts
    googleId: {
        type: String,
        default: null
    },
    mobile: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    savedAddress: {
        fullName: { type: String, default: '' },
        mobile: { type: String, default: '' },
        addressLine: { type: String, default: '' },
        pincode: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        apartment: { type: String, default: '' },
        houseNumber: { type: String, default: '' }
    },
    role: {
        type: String,
        enum: ['user'],
        default: 'user'
    },
    // Optional wishlist linked to Product references
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

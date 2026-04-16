const mongoose = require('mongoose');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^[6-9]\d{9}$/;

const sanitizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const validateEmail = (email) => emailRegex.test(sanitizeString(email));
const validateMobile = (mobile) => mobileRegex.test(sanitizeString(mobile));
const validateObjectId = (value) => mongoose.isValidObjectId(value);
const validateProductInput = ({ name, price, description, category, requireImage = false, imageCount = 0 }) => {
    const sanitizedName = sanitizeString(name);
    const sanitizedDescription = sanitizeString(description);
    const sanitizedCategory = sanitizeString(category);
    const numericPrice = Number(price);

    if (sanitizedName.length < 3 || sanitizedName.length > 120) {
        return 'Product name must be between 3 and 120 characters';
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        return 'Price must be a valid number greater than 0';
    }

    if (sanitizedDescription.length < 10 || sanitizedDescription.length > 2000) {
        return 'Description must be between 10 and 2000 characters';
    }

    if (!sanitizedCategory) {
        return 'Category is required';
    }

    if (requireImage && imageCount === 0) {
        return 'At least one product image is required';
    }

    return null;
};
const validateAddress = (address) => {
    const sanitized = sanitizeString(address);
    return sanitized.length >= 10 && sanitized.length <= 300;
};

module.exports = {
    sanitizeString,
    validateEmail,
    validateMobile,
    validateObjectId,
    validateProductInput,
    validateAddress
};

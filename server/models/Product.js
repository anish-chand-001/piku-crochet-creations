const mongoose = require('mongoose');

const MAX_IMAGES = 10; // Configurable max images per product

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    // Legacy single-image field — kept for backward compatibility
    imageUrl: {
        type: String,
    },
    // New multi-image field
    images: {
        type: [String],
        default: [],
        validate: {
            validator: function (arr) {
                return arr.length <= MAX_IMAGES;
            },
            message: `A product can have at most ${MAX_IMAGES} images.`
        }
    },
    averageRating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ name: 'text' });

/**
 * Returns the resolved images array for a product.
 * If images[] is empty but legacy imageUrl exists, falls back to [imageUrl].
 * Used in controller normalization — does NOT mutate the DB document.
 */
productSchema.methods.getImages = function () {
    if (this.images && this.images.length > 0) {
        return this.images;
    }
    if (this.imageUrl) {
        return [this.imageUrl];
    }
    return [];
};

module.exports = mongoose.model('Product', productSchema);
module.exports.MAX_IMAGES = MAX_IMAGES;

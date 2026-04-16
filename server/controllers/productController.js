const Product = require('../models/Product');
const { MAX_IMAGES } = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const { getCache, setCache, clearCache } = require('../utils/cache');
const { sanitizeString, validateObjectId, validateProductInput } = require('../utils/validators');
const { logAdminAction } = require('../utils/adminLogger');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts the Cloudinary public_id from a secure_url.
 * Accounts for the 'crochet_products/' folder prefix.
 */
const extractPublicId = (url) => {
    try {
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        const filename = lastPart.split('.')[0];
        return `crochet_products/${filename}`;
    } catch {
        return null;
    }
};

/**
 * Uploads a single multer file buffer to Cloudinary.
 * Returns the secure_url on success.
 */
const uploadToCloudinary = async (file) => {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'crochet_products',
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
        width: 1200,
        crop: 'fill',
        gravity: 'auto'
    });
    return result.secure_url;
};

/**
 * Safely deletes a Cloudinary image by URL. Swallows errors.
 */
const deleteFromCloudinary = async (url) => {
    try {
        const publicId = extractPublicId(url);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (err) {
        console.error('Cloudinary delete error for', url, err.message);
    }
};

/**
 * Normalizes a product document for API responses.
 * Ensures images[] is always populated (falls back to [imageUrl] for old docs).
 */
const normalizeProduct = (product) => {
    const obj = product.toObject ? product.toObject() : { ...product };
    if (!obj.images || obj.images.length === 0) {
        obj.images = obj.imageUrl ? [obj.imageUrl] : [];
    }
    return obj;
};

const clearProductCache = () => {
    clearCache('categories');
    clearCache('products:1:10');
    clearCache('products:1:20');
};

// ─── Controllers ──────────────────────────────────────────────────────────────

exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one product image is required' });
        }

        if (req.files.length > MAX_IMAGES) {
            return res.status(400).json({ message: `Maximum ${MAX_IMAGES} images allowed` });
        }

        const validationError = validateProductInput({
            name,
            price,
            description,
            category,
            requireImage: true,
            imageCount: req.files.length
        });

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const uploadResults = await Promise.allSettled(
            req.files.map((file) => uploadToCloudinary(file))
        );

        const uploadedUrls = uploadResults
            .filter((r) => r.status === 'fulfilled')
            .map((r) => r.value);

        if (uploadedUrls.length === 0) {
            return res.status(500).json({ message: 'All image uploads failed. Please try again.' });
        }

        const failedCount = uploadResults.filter((r) => r.status === 'rejected').length;
        if (failedCount > 0) {
            console.warn(`${failedCount} image(s) failed to upload during product creation.`);
        }

        const product = new Product({
            name: sanitizeString(name),
            price: Number(price),
            description: sanitizeString(description),
            category: sanitizeString(category),
            imageUrl: uploadedUrls[0],
            images: uploadedUrls
        });

        await product.save();
        clearProductCache();
        logAdminAction(req, 'added product', product._id.toString());
        res.status(201).json(normalizeProduct(product));
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const search = sanitizeString(req.query.search || '');
        const category = sanitizeString(req.query.category || '');

        const query = {};
        let sort = { createdAt: -1 };
        const projection = { name: 1, price: 1, description: 1, category: 1, imageUrl: 1, images: 1, createdAt: 1 };

        if (search) {
            query.$text = { $search: search };
            sort = { score: { $meta: 'textScore' } };
            projection.score = { $meta: 'textScore' };
        }
        if (category) {
            query.category = category;
        }

        const cacheKey = !search && !category ? `products:${page}:${limit}` : null;
        if (cacheKey) {
            const cached = getCache(cacheKey);
            if (cached) {
                return res.json(cached);
            }
        }

        const products = await Product.find(query, projection)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Product.countDocuments(query);
        const normalizedProducts = products.map(normalizeProduct);

        const response = {
            products: normalizedProducts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalProducts: total
        };

        if (cacheKey) {
            setCache(cacheKey, response, 45);
        }

        res.json(response);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, category } = req.body;

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        let existingImages = [];
        try {
            existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
        } catch {
            existingImages = [];
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const previousImages = product.images && product.images.length > 0
            ? product.images
            : (product.imageUrl ? [product.imageUrl] : []);

        const removedImages = previousImages.filter((url) => !existingImages.includes(url));
        await Promise.allSettled(removedImages.map(deleteFromCloudinary));

        let newlyUploadedUrls = [];
        if (req.files && req.files.length > 0) {
            const totalImages = existingImages.length + req.files.length;
            if (totalImages > MAX_IMAGES) {
                return res.status(400).json({
                    message: `Maximum ${MAX_IMAGES} images allowed. You have ${existingImages.length} existing and are trying to add ${req.files.length} more.`
                });
            }

            const uploadResults = await Promise.allSettled(
                req.files.map((file) => uploadToCloudinary(file))
            );

            newlyUploadedUrls = uploadResults
                .filter((r) => r.status === 'fulfilled')
                .map((r) => r.value);

            const failedCount = uploadResults.filter((r) => r.status === 'rejected').length;
            if (failedCount > 0) {
                console.warn(`${failedCount} image(s) failed to upload during product update.`);
            }
        }

        const finalImages = [...existingImages, ...newlyUploadedUrls];
        if (finalImages.length === 0) {
            return res.status(400).json({ message: 'Product must have at least one image' });
        }

        const validationError = validateProductInput({
            name: name || product.name,
            price: price ?? product.price,
            description: description || product.description,
            category: category || product.category,
            requireImage: true,
            imageCount: finalImages.length
        });

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        product.name = sanitizeString(name) || product.name;
        if (price !== undefined && price !== null && price !== '') product.price = Number(price);
        product.description = sanitizeString(description) || product.description;
        product.category = sanitizeString(category) || product.category;
        product.images = finalImages;
        product.imageUrl = finalImages[0];

        await product.save();
        clearProductCache();
        logAdminAction(req, 'updated product', product._id.toString());
        res.json(normalizeProduct(product));
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const imagesToDelete = product.images && product.images.length > 0
            ? product.images
            : (product.imageUrl ? [product.imageUrl] : []);

        await Promise.allSettled(imagesToDelete.map(deleteFromCloudinary));
        await Product.findByIdAndDelete(id);
        clearProductCache();
        logAdminAction(req, 'deleted product', id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

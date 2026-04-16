const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

const extractPublicId = (url) => {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.split('.')[0];
};

exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Product image is required' });
        }

        // Upload image to Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            folder: 'crochet_products',
            resource_type: 'auto'
        });

        const product = new Product({
            name,
            price: Number(price),
            description,
            category,
            imageUrl: uploadResponse.secure_url
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error creating product' });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category } = req.query;

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Product.countDocuments(query);

        res.json({
            products,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            totalProducts: total
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, category } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let imageUrl = product.imageUrl;

        if (req.file) {
            // Remove old image from Cloudinary
            if (product.imageUrl) {
                const publicId = `crochet_products/${extractPublicId(product.imageUrl)}`;
                await cloudinary.uploader.destroy(publicId).catch(err => console.error('Cloudinary destroy error:', err));
            }

            // Upload new image
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
            const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                folder: 'crochet_products',
                resource_type: 'auto'
            });
            imageUrl = uploadResponse.secure_url;
        }

        product.name = name || product.name;
        if (price) product.price = Number(price);
        product.description = description || product.description;
        product.category = category || product.category;
        product.imageUrl = imageUrl;

        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error updating product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Remove image from Cloudinary
        if (product.imageUrl) {
            const publicId = `crochet_products/${extractPublicId(product.imageUrl)}`;
            await cloudinary.uploader.destroy(publicId).catch(err => console.error('Cloudinary destroy error:', err));
        }

        await Product.findByIdAndDelete(id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error deleting product' });
    }
};

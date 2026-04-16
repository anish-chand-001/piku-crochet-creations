const Category = require('../models/Category');
const Product = require('../models/Product');
const { getCache, setCache, clearCache } = require('../utils/cache');
const { sanitizeString, validateObjectId } = require('../utils/validators');
const { logAdminAction } = require('../utils/adminLogger');

const clearCategoryCache = () => {
    clearCache('categories');
    clearCache('products:1:10');
    clearCache('products:1:20');
};

exports.createCategory = async (req, res) => {
    try {
        const name = sanitizeString(req.body.name);
        if (!name) return res.status(400).json({ message: 'Category name is required' });

        const existingCategory = await Category.findOne({ name: new RegExp('^' + name + '$', 'i') });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = new Category({ name });
        await category.save();
        clearCategoryCache();
        logAdminAction(req, 'created category', category.name);
        res.status(201).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const cached = getCache('categories');
        if (cached) {
            return res.json(cached);
        }

        const categories = await Category.find().sort({ name: 1 }).select('name createdAt');
        setCache('categories', categories, 60);
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid category id' });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const productCount = await Product.countDocuments({ category: category.name });
        if (productCount > 0) {
            return res.status(400).json({ message: `Cannot delete category. ${productCount} product(s) still use it.` });
        }

        await Category.findByIdAndDelete(id);
        clearCategoryCache();
        logAdminAction(req, 'deleted category', category.name);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

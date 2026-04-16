const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
        const skip = (page - 1) * limit;

        const [users, totalUsers] = await Promise.all([
            User.find({})
                .select('name email createdAt')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip),
            User.countDocuments()
        ]);

        res.json({
            totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit) || 1,
            users
        });
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
};

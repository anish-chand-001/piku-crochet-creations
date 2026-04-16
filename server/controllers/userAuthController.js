const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const signToken = (user) => {
    return jwt.sign(
        { userId: user._id.toString(), email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
    );
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        const token = signToken(user);
        res.cookie('userToken', token, COOKIE_OPTIONS);
        res.status(201).json({
            message: 'Account created successfully',
            user: { name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('User register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.password) {
            return res.status(401).json({
                message: 'This account uses Google Sign-In. Please use the "Continue with Google" button.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = signToken(user);
        res.cookie('userToken', token, COOKIE_OPTIONS);
        res.json({
            message: 'Logged in successfully',
            user: { name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('userToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ message: 'Logged out successfully' });
};

exports.checkAuth = async (req, res) => {
    try {
        // Fetch fresh profile from DB — JWT doesn't carry mobile/address
        const user = await User.findById(req.user.userId).select('name email role mobile address');
        if (!user) return res.status(401).json({ message: 'User not found' });

        res.json({
            isAuthenticated: true,
            user: {
                userId: req.user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                mobile: user.mobile || '',
                address: user.address || ''
            }
        });
    } catch (error) {
        console.error('Check auth error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Called after Passport Google OAuth succeeds.
 * Signs JWT, sets userToken cookie, redirects to frontend callback page.
 */
exports.googleCallback = (req, res) => {
    if (!req.user) {
        const clientUrl = (process.env.CLIENT_URL || 'http://localhost:8080').replace(/\/$/, '');
        return res.redirect(`${clientUrl}/login?error=google_failed`);
    }

    const token = signToken(req.user);
    res.cookie('userToken', token, COOKIE_OPTIONS);

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:8080').replace(/\/$/, '');
    res.redirect(`${clientUrl}/auth/callback`);
};

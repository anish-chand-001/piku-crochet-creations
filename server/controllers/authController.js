const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendResetEmail = require('../utils/sendEmail');
const { sanitizeString, validateEmail } = require('../utils/validators');
const { logAdminAction } = require('../utils/adminLogger');

exports.login = async (req, res) => {
    try {
        const email = sanitizeString(req.body.email).toLowerCase();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is locked out
        if (admin.locked_until && admin.locked_until > Date.now()) {
            const minutesLeft = Math.ceil((admin.locked_until - Date.now()) / 60000);
            return res.status(429).json({ message: `Too many failed attempts. Try again in ${minutesLeft} minutes.` });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            // Increment failed attempts
            admin.failed_attempts += 1;
            if (admin.failed_attempts >= 5) {
                admin.locked_until = Date.now() + 15 * 60 * 1000; // Lock for 15 mins
            }
            await admin.save();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Reset failed attempts on success
        admin.failed_attempts = 0;
        admin.locked_until = null;
        admin.last_login = Date.now();
        await admin.save();

        const payload = { adminId: admin._id, email: admin.email, role: 'admin' };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
            expiresIn: '1d'
        });

        // Set HTTP Only Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        logAdminAction({ user: payload }, 'logged in');
        res.json({ message: 'Logged in successfully', admin: { email: admin.email, role: 'admin' } });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

// Route to check auth status and return current admin
exports.checkAuth = (req, res) => {
    if (req.admin) {
        res.json({ isAuthenticated: true, admin: req.admin });
    } else {
        res.status(401).json({ isAuthenticated: false });
    }
};

exports.register = async (req, res) => {
    try {
        const email = sanitizeString(req.body.email).toLowerCase();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ message: 'Admin account with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newAdmin = new Admin({
            email,
            password: hashedPassword
        });

        await newAdmin.save();

        logAdminAction(req, 'registered admin', email);
        res.status(201).json({ message: 'New admin registered successfully', email: newAdmin.email });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const email = sanitizeString(req.body.email).toLowerCase();
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'No account found with that email.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        admin.resetPasswordToken = token;
        admin.resetPasswordExpires = Date.now() + 3600000;
        await admin.save();

        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers.host;
        const clientUrl = process.env.CLIENT_URL || `${protocol}://${host}`;
        const resetUrl = `${clientUrl}/secure-admin-dashboard/reset-password/${token}`;
        
        await sendResetEmail(admin.email, resetUrl);

        res.status(200).json({ message: 'Reset link sent to your email!' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Failed to send email. Please try again.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!admin) {
            return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
        }

        admin.password = await bcrypt.hash(newPassword, 10);
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        await admin.save();

        res.status(200).json({ message: 'Password reset successfully!' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error during password reset.' });
    }
};

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { passport, configurePassport } = require('./config/passport');
const { adminLimiter } = require('./middleware/rateLimiter');

dotenv.config();
configurePassport();

const app = express();

// Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Session middleware — required for Google OAuth state parameter (CSRF protection)
// Note: In-memory store is fine for OAuth dance only; JWT cookies handle ongoing auth
app.use(session({
    secret: process.env.JWT_SECRET || 'session_secret_fallback',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000 // 10 minutes — only needed for OAuth redirect cycle
    }
}));

// Passport (Google OAuth only — no persistent sessions, JWT handles auth)
app.use(passport.initialize());

// Database connection cache for serverless reuse across warm invocations
const globalMongoose = global.__mongoose || (global.__mongoose = {
    conn: null,
    promise: null,
});

const connectDB = async () => {
    if (globalMongoose.conn && mongoose.connection.readyState === 1) {
        return globalMongoose.conn;
    }

    if (globalMongoose.promise) {
        return globalMongoose.promise;
    }

    const mongoUri = process.env.MONGODB_URI || (
        process.env.NODE_ENV !== 'production'
            ? 'mongodb://localhost:27017/crochet'
            : null
    );

    if (!mongoUri) {
        const error = new Error('MONGODB_URI is not configured');
        console.error('MongoDB connection error:', error.message, {
            hasMongoUri: Boolean(process.env.MONGODB_URI),
            nodeEnv: process.env.NODE_ENV,
        });
        throw error;
    }

    try {
        console.log('MongoDB connect attempt', {
            hasMongoUri: Boolean(process.env.MONGODB_URI),
            nodeEnv: process.env.NODE_ENV,
        });

        globalMongoose.promise = mongoose.connect(mongoUri).then((mongooseInstance) => {
            console.log('MongoDB connected');
            return mongooseInstance;
        });

        globalMongoose.conn = await globalMongoose.promise;
        return globalMongoose.conn;
    } catch (error) {
        globalMongoose.promise = null;
        globalMongoose.conn = null;
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// Ensure DB is ready before any route handler runs
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

// Routes
app.use('/api/admin', adminLimiter);
app.use('/api/admin', require('./routes/auth'));         // Existing admin auth — UNCHANGED
app.use('/api/admin', require('./routes/adminUsers'));   // Admin users listing — NEW
app.use('/api/products', require('./routes/products'));  // Existing products — UNCHANGED
app.use('/api/categories', require('./routes/categories')); // Existing categories — UNCHANGED
app.use('/api/stats', require('./routes/stats'));        // Existing stats — UNCHANGED

// New routes
app.use('/api/auth', require('./routes/userAuth'));      // User auth + Google OAuth
app.use('/api/cart', require('./routes/cart'));          // Cart management
app.use('/api/orders', require('./routes/orders'));      // Orders (user + admin)
app.use('/api/wishlist', require('./routes/wishlist'));  // Wishlist management

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;

const passport = require('passport');

/**
 * Configures the Google OAuth strategy.
 * Called after dotenv is loaded (from index.js) so env vars are available.
 */
const configurePassport = () => {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    const User = require('../models/User');

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const googleId = profile.id;
            const email = profile.emails?.[0]?.value?.toLowerCase();
            const name = profile.displayName || profile.name?.givenName || 'User';

            // 1. Find by Google ID first
            let user = await User.findOne({ googleId });

            if (!user && email) {
                // 2. Check for existing email/password account — link it
                user = await User.findOne({ email });
                if (user) {
                    user.googleId = googleId;
                    if (!user.name) user.name = name;
                    await user.save();
                } else {
                    // 3. Create brand new user
                    user = await User.create({ name, email, googleId, password: null });
                }
            }

            if (!user) {
                return done(null, false, { message: 'Could not retrieve email from Google.' });
            }

            return done(null, user);
        } catch (error) {
            console.error('Passport Google strategy error:', error);
            return done(error, null);
        }
    }));
};

module.exports = { passport, configurePassport };

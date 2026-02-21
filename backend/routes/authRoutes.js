const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

const crypto = require('crypto');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

const getClientUrl = () => {
    return process.env.NODE_ENV === 'production'
        ? 'https://www.naijatrust.ng'
        : (process.env.FRONTEND_URL || 'http://localhost:5173');
};

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d'
    });
};

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Auth-specific rate limiter
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
    max: 10, // 10 requests per hour
    windowMs: 60 * 60 * 1000,
    message: 'Too many login/signup attempts, please try again in an hour!'
});

// Signup route
router.post('/signup', authLimiter, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'fail', message: 'Email already registered' });
        }

        // Create new user (Unverified)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const newUser = await User.create({
            name,
            email,
            password,
            isVerified: false,
            otp,
            otpExpires
        });

        // Send OTP email
        try {
            const { sendOtpEmail } = require('../utils/emailService');
            await sendOtpEmail(email, name, otp);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Optionally delete user if email fails, or allow them to resend
        }

        res.status(201).json({
            status: 'success',
            message: 'Registration successful! Please verify your email.',
            data: {
                email: newUser.email,
                requiresOtp: true
            }
        });
    } catch (err) {
        console.error('Signup error:', err);
        console.error('Error stack:', err.stack);
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Login route
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.password || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
        }

        const token = signToken(user._id);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                    avatar: user.avatar
                }
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Verify OTP route
router.post('/verify-otp', authLimiter, async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ status: 'fail', message: 'Please provide email and OTP' });
        }

        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ status: 'fail', message: 'Invalid or expired OTP' });
        }

        // Verify user
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Send welcome email after successful verification
        try {
            await sendWelcomeEmail(user.email, user.name);
        } catch (err) {
            console.error('Welcome email error:', err);
        }

        const token = signToken(user._id);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                    avatar: user.avatar
                }
            },
            message: 'Email verified successfully!'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Resend OTP route
router.post('/resend-otp', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: 'fail', message: 'Please provide email' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ status: 'fail', message: 'Email is already verified' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        // Send number email
        const { sendOtpEmail } = require('../utils/emailService');
        await sendOtpEmail(user.email, user.name, otp);

        res.status(200).json({
            status: 'success',
            message: 'OTP resent successfully'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Verify email route (Legacy Link)
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid or expired verification token'
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully! You can now login.'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Resend verification email
router.post('/resend-verification', verifyToken, authLimiter, async (req, res) => {
    try {
        const user = req.user;

        if (user.isVerified) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email is already verified'
            });
        }

        // Generate new verification token
        const verificationToken = user.generateVerificationToken();
        await user.save();

        // Send verification email
        await sendVerificationEmail(user.email, user.name, verificationToken);

        res.status(200).json({
            status: 'success',
            message: 'Verification email sent! Please check your inbox.'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Google OAuth routes (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com' &&
    process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
    router.get('/google',
        passport.authenticate('google', {
            scope: ['profile', 'email'],
            prompt: 'select_account'
        })
    );

    router.get('/google/callback',
        passport.authenticate('google', {
            failureRedirect: '/login',
            session: false
        }),
        (req, res) => {
            // Generate JWT token
            const token = signToken(req.user._id);

            // Redirect to frontend with token
            res.redirect(`${getClientUrl()}/auth/callback?token=${token}`);
        }
    );
} else {
    // Return error if Google OAuth is not configured
    router.get('/google', (req, res) => {
        res.status(503).json({
            status: 'fail',
            message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.'
        });
    });

    router.get('/google/callback', (req, res) => {
        res.status(503).json({
            status: 'fail',
            message: 'Google OAuth is not configured.'
        });
    });
}

// Update profile information (name, email)
router.patch('/updateMe', verifyToken, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = req.user;

        if (name) user.name = name;
        if (email) {
            // Check if email is already taken
            if (email !== user.email) {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({ status: 'fail', message: 'Email already in use' });
                }
                user.email = email;
                user.isVerified = false; // Re-verify if email changes
            }
        }

        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                    avatar: user.avatar
                }
            },
            message: 'Profile updated successfully'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Update password
router.patch('/updatePassword', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ status: 'fail', message: 'Current password incorrect' });
        }

        user.password = newPassword;
        await user.save();

        const token = signToken(user._id);

        res.status(200).json({
            status: 'success',
            token,
            message: 'Password updated successfully'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Upload avatar (Real file upload)
router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
        }

        const user = req.user;
        // Construct detailed URL or relative path. frontend will handle base URL or we can return full URL.
        // For simplicity and robustness, returning relative path.
        // Ensure to remove old file if needed (optional optimization).

        user.avatar = req.file.path;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                    avatar: user.avatar
                }
            },
            message: 'Avatar uploaded successfully'
        });
    } catch (err) {
        console.error('Avatar upload error:', err);
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Update avatar URL (simulated/legacy)
router.patch('/updateAvatar', verifyToken, async (req, res) => {
    try {
        const { avatar } = req.body;
        const user = req.user;

        if (avatar) user.avatar = avatar;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                    avatar: user.avatar
                }
            },
            message: 'Avatar updated successfully'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                isVerified: req.user.isVerified,
                avatar: req.user.avatar
            }
        }
    });
});

// Forgot Password
router.post('/forgot-password', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'There is no user with that email address.' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${getClientUrl()}/reset-password/${resetToken}`;


        try {
            await sendPasswordResetEmail(user.email, resetUrl, user.name);

            res.status(200).json({
                status: 'success',
                message: 'Token sent to email!'
            });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ status: 'fail', message: 'There was an error sending the email. Try again later!' });
        }
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
});

// Reset Password
router.patch('/reset-password/:token', authLimiter, async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ status: 'fail', message: 'Token is invalid or has expired' });
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const token = signToken(user._id);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                    avatar: user.avatar
                }
            },
            message: 'Password reset successful!'
        });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
});

// Delete current user account (Hard delete)
router.delete('/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id;

        // Perform hard delete
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        // Note: Reviews are preserved as they reference the ID which is now gone from Users collection.
        // Frontend handles missing user data in reviews gracefully.

        res.status(200).json({
            status: 'success',
            message: 'Your account has been permanently deleted. We hope to see you again!'
        });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ status: 'fail', message: err.message });
    }
});

module.exports = router;

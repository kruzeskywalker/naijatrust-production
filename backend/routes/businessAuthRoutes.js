const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const BusinessUser = require('../models/BusinessUser');

const { sendEmail, sendPasswordResetEmail } = require('../utils/emailService');

const { verifyBusinessToken } = require('../middleware/businessAuth');

// Helper function to validate business email
const isBusinessEmail = (email) => {
    const freeEmailDomains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    return !freeEmailDomains.includes(domain);
};

// POST /api/business-auth/signup
router.post('/signup', async (req, res) => {
    console.log('--- SIGNUP REQUEST RECEIVED ---');
    try {
        const { name, email, password, businessEmail, phone, position, companyName } = req.body;

        // Validate required fields
        if (!name || !email || !password || !businessEmail || !phone || !position) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide all required fields'
            });
        }

        // Validate business email
        if (!isBusinessEmail(businessEmail)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please use a business email address (not Gmail, Yahoo, etc.)'
            });
        }

        // Check if user already exists
        const existingUser = await BusinessUser.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email already registered'
            });
        }

        // Create new business user (Verified by default)
        const businessUser = new BusinessUser({
            name,
            email: email.toLowerCase(),
            password,
            businessEmail: businessEmail.toLowerCase(),
            phone,
            position,
            companyName,
            isEmailVerified: true // Auto-verified
        });

        await businessUser.save();

        // Generate JWT token immediately
        const token = jwt.sign(
            { id: businessUser._id, role: businessUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send success response with token
        res.status(201).json({
            status: 'success',
            message: 'Account created successfully!',
            data: {
                token,
                user: {
                    id: businessUser._id,
                    name: businessUser.name,
                    email: businessUser.email,
                    isEmailVerified: businessUser.isEmailVerified,
                    isAdminVerified: businessUser.isAdminVerified
                }
            }
        });

        // Send Welcome email in background
        sendEmail({
            to: email,
            subject: 'Welcome to NaijaTrust Business!',
            html: `
                <h2>Welcome to NaijaTrust for Businesses!</h2>
                <p>Hi ${name},</p>
                <p>Thank you for signing up. Your account has been created and verified.</p>
                <p>You can now log in to your dashboard to claim or register your business.</p>
                <p>Best regards,<br>NaijaTrust Team</p>
            `
        }).catch(err => console.error('⚠️ Failed to send welcome email:', err.message));

    } catch (error) {
        console.error('Business signup error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// POST /api/business-auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await BusinessUser.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password'
            });
        }

        // Check if account is suspended
        // Check if account is suspended or blocked
        if (user.isSuspended) {
            return res.status(403).json({
                status: 'fail',
                message: `Account suspended: ${user.suspensionReason || 'Contact support'}`
            });
        }

        // Verify password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            status: 'success',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    businessEmail: user.businessEmail,
                    isEmailVerified: user.isEmailVerified,
                    isAdminVerified: user.isAdminVerified,
                    claimedBusinesses: user.claimedBusinesses
                }
            }
        });
    } catch (error) {
        console.error('Business login error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/business-auth/verify-email/:token
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await BusinessUser.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid or expired verification token'
            });
        }

        // Mark email as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully! You can now claim or register a business.'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// POST /api/business-auth/resend-verification
router.post('/resend-verification', verifyBusinessToken, async (req, res) => {
    try {
        const user = req.user;

        if (user.isEmailVerified) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email already verified'
            });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = verificationExpires;
        await user.save();

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL}/business/verify-email/${verificationToken}`;
        await sendEmail({
            to: user.email,
            subject: 'Verify your NaijaTrust Business Account',
            html: `
                <h2>Email Verification</h2>
                <p>Hi ${user.name},</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
                <p>Best regards,<br>NaijaTrust Team</p>
            `
        });

        res.status(200).json({
            status: 'success',
            message: 'Verification email sent successfully'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/business-auth/me
router.get('/me', verifyBusinessToken, async (req, res) => {
    try {
        const user = await BusinessUser.findById(req.user._id)
            .select('-password -emailVerificationToken')
            .populate('claimedBusinesses', 'name category location rating reviewCount');

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PUT /api/business-auth/update-profile
router.put('/update-profile', verifyBusinessToken, async (req, res) => {
    try {
        const { name, phone, position } = req.body;
        const user = req.user;

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (position) user.position = position;

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    businessEmail: user.businessEmail,
                    phone: user.phone,
                    position: user.position,
                    isEmailVerified: user.isEmailVerified,
                    isAdminVerified: user.isAdminVerified,
                    claimedBusinesses: user.claimedBusinesses
                }
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PUT /api/business-auth/change-password
router.put('/change-password', verifyBusinessToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await BusinessUser.findById(req.user._id);

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ status: 'fail', message: 'Please provide current and new password' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ status: 'fail', message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ status: 'success', message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// POST /api/business-auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await BusinessUser.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'There is no user with that email address.' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const RESET_BASE = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://naijatrust-production.vercel.app' : 'http://localhost:5173');
        const resetUrl = `${RESET_BASE}/business/reset-password/${resetToken}`;

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

// POST /api/business-auth/reset-password/:token
router.patch('/reset-password/:token', async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await BusinessUser.findOne({
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

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            status: 'success',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified,
                    isAdminVerified: user.isAdminVerified,
                    claimedBusinesses: user.claimedBusinesses
                }
            },
            message: 'Password reset successful!'
        });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
});

// POST /api/business-auth/request-deletion
router.post('/request-deletion', verifyBusinessToken, async (req, res) => {
    try {
        const { reason } = req.body;
        const user = req.user;

        if (user.deletionRequest && user.deletionRequest.status === 'pending') {
            return res.status(400).json({
                status: 'fail',
                message: 'You already have a pending deletion request'
            });
        }

        user.deletionRequest = {
            status: 'pending',
            reason: reason || 'No reason provided',
            requestedAt: new Date()
        };

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Deletion request sent successfully. An admin will review it shortly.'
        });
    } catch (error) {
        console.error('Request deletion error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

module.exports = { router, verifyBusinessToken };

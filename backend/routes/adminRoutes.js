const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const ClaimRequest = require('../models/ClaimRequest');
const Business = require('../models/Business');
const BusinessUser = require('../models/BusinessUser');
const Review = require('../models/Review');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// Middleware: Verify Admin Token
const verifyAdminToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ status: 'fail', message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await AdminUser.findById(decoded.id);

        if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
            return res.status(401).json({ status: 'fail', message: 'Invalid admin token' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ status: 'fail', message: 'Invalid token' });
    }
};

// Admin Login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await AdminUser.findOne({ email: email.toLowerCase() });
        if (!admin || !admin.isActive) {
            return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
        }

        // Log login
        admin.loginHistory.push({
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        admin.lastLogin = new Date();
        await admin.save();

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.status(200).json({
            status: 'success',
            data: {
                token,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    role: admin.role,
                    permissions: admin.permissions
                }
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// Create Initial Admin (Dev Route - should be secured or removed in production)
router.post('/auth/create-initial', async (req, res) => {
    try {
        const count = await AdminUser.countDocuments();
        if (count > 0) {
            return res.status(403).json({ status: 'fail', message: 'Admin already exists' });
        }

        const { name, email, password } = req.body;
        const admin = await AdminUser.create({
            name,
            email,
            password,
            role: 'super_admin',
            permissions: ['manage_admins', 'review_claims', 'manage_businesses']
        });

        res.status(201).json({ status: 'success', data: { admin } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/admin/dashboard
router.get('/dashboard', verifyAdminToken, async (req, res) => {
    try {
        const stats = {
            pendingClaims: await ClaimRequest.countDocuments({ status: 'pending' }),
            totalBusinesses: await Business.countDocuments(),
            activeBusinessUsers: await BusinessUser.countDocuments({ isActive: true }),
            recentClaims: await ClaimRequest.find()
                .sort('-submittedAt')
                .limit(5)
                .populate('business', 'name')
                .populate('user', 'name')
        };

        res.status(200).json({ status: 'success', data: stats });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/admin/claim-requests
router.get('/claim-requests', verifyAdminToken, async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const claims = await ClaimRequest.find(query)
            .populate('business', 'name location website')
            .populate('user', 'name email businessEmail phone position')
            .sort('-submittedAt');

        res.status(200).json({ status: 'success', data: { claims } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PUT /api/admin/claim-requests/:id/approve
router.put('/claim-requests/:id/approve', verifyAdminToken, async (req, res) => {
    try {
        const claim = await ClaimRequest.findById(req.params.id)
            .populate('business')
            .populate('user');

        if (!claim) {
            return res.status(404).json({ status: 'fail', message: 'Claim not found' });
        }

        if (claim.status !== 'pending') {
            return res.status(400).json({ status: 'fail', message: 'Claim is not pending' });
        }

        // Update claim status
        claim.status = 'approved';
        claim.reviewedAt = new Date();
        claim.reviewedBy = req.admin._id;
        claim.adminNotes = req.body.adminNotes;
        await claim.save();

        // Update Business
        const business = await Business.findById(claim.business._id);
        business.claimStatus = 'claimed';
        business.isClaimed = true;
        business.owner = claim.user._id;
        business.claimedAt = new Date();
        business.isVerified = true; // Auto-verify on approved claim
        await business.save();

        // Update Business User
        const user = await BusinessUser.findById(claim.user._id);
        user.isActive = true;
        user.isAdminVerified = true;
        user.claimedBusinesses.addToSet(business._id);
        await user.save();

        // Log Admin Action
        await req.admin.logAction('approve_claim', 'claim', claim._id, `Approved claim for ${business.name}`);

        // Send Email
        const emailContent = emailTemplates.claimApproved(
            user.name,
            business.name,
            `${process.env.FRONTEND_URL}/business/dashboard`
        );
        await sendEmail({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html
        });

        res.status(200).json({ status: 'success', message: 'Claim approved successfully' });
    } catch (error) {
        console.error('Approve claim error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PUT /api/admin/claim-requests/:id/reject
router.put('/claim-requests/:id/reject', verifyAdminToken, async (req, res) => {
    try {
        const { rejectionReason, adminNotes } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({ status: 'fail', message: 'Rejection reason is required' });
        }

        const claim = await ClaimRequest.findById(req.params.id)
            .populate('business')
            .populate('user');

        if (!claim) {
            return res.status(404).json({ status: 'fail', message: 'Claim not found' });
        }

        // Update claim
        claim.status = 'rejected';
        claim.reviewedAt = new Date();
        claim.reviewedBy = req.admin._id;
        claim.rejectionReason = rejectionReason;
        claim.adminNotes = adminNotes;
        await claim.save();

        // Reset business status if it was pending
        const business = await Business.findById(claim.business._id);
        if (business.claimStatus === 'pending') {
            business.claimStatus = 'unclaimed'; // Reset to unclaimed so others can claim
            await business.save();
        }

        // Log action
        await req.admin.logAction('reject_claim', 'claim', claim._id, `Rejected: ${rejectionReason}`);

        // Send Email
        const emailContent = emailTemplates.claimRejected(
            claim.user.name,
            business.name,
            rejectionReason
        );
        await sendEmail({
            to: claim.user.email,
            subject: emailContent.subject,
            html: emailContent.html
        });

        res.status(200).json({ status: 'success', message: 'Claim rejected successfully' });
    } catch (error) {
        console.error('Reject claim error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/admin/businesses - List all businesses with filters
router.get('/businesses', verifyAdminToken, async (req, res) => {
    try {
        const { status, category, verified, search } = req.query;
        const query = {};

        // Filter by verification status
        if (verified === 'true') query.isVerified = true;
        if (verified === 'false') query.isVerified = false;

        // Filter by claim status
        if (status) query.claimStatus = status;

        // Filter by category
        if (category) query.category = category;

        // Search by name
        if (search) {
            query.$text = { $search: search };
        }

        const businesses = await Business.find(query)
            .populate('owner', 'name email')
            .populate('verifiedBy', 'name')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            data: { businesses, count: businesses.length }
        });
    } catch (error) {
        console.error('Get businesses error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// POST /api/admin/businesses - Create a new business
router.post('/businesses', verifyAdminToken, async (req, res) => {
    try {
        const { name, category, location, description, website, phone, email } = req.body;

        // Basic validation
        if (!name || !category || !location || !phone) {
            return res.status(400).json({ status: 'fail', message: 'Name, category, location, and phone are required' });
        }

        const business = await Business.create({
            name,
            category,
            location,
            description,
            website,
            phone,
            email,
            isVerified: true, // Auto-verified since admin created it
            verifiedBy: req.admin._id,
            verifiedAt: new Date(),
            claimStatus: 'unclaimed',
            isClaimed: false
        });

        // Log action
        await req.admin.logAction(
            'create_business',
            'business',
            business._id,
            `Created business: ${business.name}`
        );

        res.status(201).json({
            status: 'success',
            message: 'Business created successfully',
            data: { business }
        });
    } catch (error) {
        console.error('Create business error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PUT /api/admin/businesses/:id/verify - Toggle business verification
router.put('/businesses/:id/verify', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        const business = await Business.findById(id);
        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found' });
        }

        // Update verification status
        business.isVerified = isVerified;
        if (isVerified) {
            business.verifiedBy = req.admin._id;
            business.verifiedAt = new Date();
        } else {
            business.verifiedBy = null;
            business.verifiedAt = null;
        }
        await business.save();

        // Log action
        await req.admin.logAction(
            isVerified ? 'verify_business' : 'unverify_business',
            'business',
            business._id,
            `${isVerified ? 'Verified' : 'Unverified'} ${business.name}`
        );

        res.status(200).json({
            status: 'success',
            message: `Business ${isVerified ? 'verified' : 'unverified'} successfully`,
            data: { business }
        });
    } catch (error) {
        console.error('Verify business error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PUT /api/admin/businesses/:id/update - Update business details
router.put('/businesses/:id/update', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Prevent updating sensitive fields directly
        delete updates.owner;
        delete updates.claimStatus;
        delete updates.isClaimed;

        const business = await Business.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found' });
        }

        // Log action
        await req.admin.logAction(
            'update_business',
            'business',
            business._id,
            `Updated ${business.name}`
        );

        res.status(200).json({
            status: 'success',
            message: 'Business updated successfully',
            data: { business }
        });
    } catch (error) {
        console.error('Update business error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// DELETE /api/admin/businesses/:id - Delete a business (Protected)
router.delete('/businesses/:id', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body; // Admin password required for confirmation

        if (!password) {
            return res.status(400).json({ status: 'fail', message: 'Password is required to delete a business' });
        }

        // Verify admin password
        const admin = await AdminUser.findById(req.admin._id).select('+password');
        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ status: 'fail', message: 'Incorrect admin password' });
        }

        // Find and delete business
        const business = await Business.findByIdAndDelete(id);

        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found' });
        }

        // Optional: Clean up related data like reviews or claim requests if needed
        // For now, keeping it simple as per request

        // Log action
        await req.admin.logAction(
            'delete_business',
            'business',
            business._id,
            `Deleted business: ${business.name}`
        );

        res.status(200).json({
            status: 'success',
            message: 'Business deleted successfully'
        });
    } catch (error) {
        console.error('Delete business error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/admin/reviews - List latest reviews
router.get('/reviews', verifyAdminToken, async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('business', 'name')
            .populate('user', 'name email')
            .sort('-createdAt')
            .limit(100); // Limit to last 100 for now

        res.status(200).json({ status: 'success', data: { reviews } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PUT /api/admin/reviews/:id/hide - Hide/Unhide a review
// PUT /api/admin/reviews/:id/hide - Hide/Unhide a review
router.put('/reviews/:id/hide', verifyAdminToken, async (req, res) => {
    try {
        const { isHidden, password } = req.body;

        if (!password) {
            return res.status(400).json({ status: 'fail', message: 'Password is required' });
        }

        // Verify admin password
        const admin = await AdminUser.findById(req.admin._id).select('+password');
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ status: 'fail', message: 'Incorrect admin password' });
        }

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isHidden },
            { new: true }
        );

        if (!review) return res.status(404).json({ status: 'fail', message: 'Review not found' });

        await req.admin.logAction('moderate_review', 'review', review._id, `${isHidden ? 'Hidden' : 'Unhidden'} review`);

        res.status(200).json({ status: 'success', data: { review } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// DELETE /api/admin/reviews/:id - Hard delete review
// DELETE /api/admin/reviews/:id - Hard delete review
router.delete('/reviews/:id', verifyAdminToken, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ status: 'fail', message: 'Password is required' });
        }

        // Verify admin password
        const admin = await AdminUser.findById(req.admin._id).select('+password');
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ status: 'fail', message: 'Incorrect admin password' });
        }

        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ status: 'fail', message: 'Review not found' });

        // Update business stats
        const allReviews = await Review.find({ business: review.business, isHidden: { $ne: true } });
        const avgRating = allReviews.length > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : 0;

        await Business.findByIdAndUpdate(review.business, {
            rating: avgRating.toFixed(1),
            reviewCount: allReviews.length
        });

        await req.admin.logAction('delete_review', 'review', review._id, 'Deleted review');

        res.status(200).json({ status: 'success', message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

module.exports = router;

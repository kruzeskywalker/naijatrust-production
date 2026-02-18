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
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        console.log('--- Admin Token Verification ---');
        console.log('Auth Header exists:', !!authHeader);
        console.log('Token exists:', !!token);

        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ status: 'fail', message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        console.log('Token decoded successfully for ID:', decoded.id);

        const admin = await AdminUser.findById(decoded.id);

        if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
            console.log('Admin not found or invalid role');
            return res.status(401).json({ status: 'fail', message: 'Invalid admin token' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin token verification FAILED:', error.message);
        if (token) console.log('Token tail:', token.slice(-10));
        console.log('process.env.JWT_SECRET defined:', !!process.env.JWT_SECRET || 'fallback_secret' === 'fallback_secret');
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
            process.env.JWT_SECRET || 'fallback_secret',
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

// GET /api/admin/diagnostics/claims - Debug endpoint to list raw claims
router.get('/diagnostics/claims', verifyAdminToken, async (req, res) => {
    try {
        console.log('--- Running Claim Diagnostics ---');
        // 1. Fetch last 20 claims (any status)
        const recentClaims = await ClaimRequest.find()
            .sort({ _id: -1 })
            .limit(20)
            .lean(); // lean for raw data

        // 2. Fetch pending businesses
        const pendingBusinesses = await Business.find({ claimStatus: 'pending' })
            .sort({ _id: -1 })
            .limit(20)
            .lean();

        res.status(200).json({
            status: 'success',
            data: {
                message: 'Diagnostics Report',
                timestamp: new Date(),
                counts: {
                    totalClaims: await ClaimRequest.countDocuments(),
                    pendingClaims: await ClaimRequest.countDocuments({ status: 'pending' }),
                    pendingBusinesses: await Business.countDocuments({ claimStatus: 'pending' }),
                    totalBusinesses: await Business.countDocuments()
                },
                recentClaims: recentClaims.map(c => ({
                    id: c._id,
                    status: c.status,
                    user: c.user,
                    business: c.business,
                    submittedAt: c.submittedAt,
                    info: c.additionalInfo
                })),
                pendingBusinesses: pendingBusinesses.map(b => ({
                    id: b._id,
                    name: b.name,
                    claimStatus: b.claimStatus,
                    owner: b.owner,
                    isVerified: b.isVerified
                }))
            }
        });
    } catch (error) {
        console.error('Diagnostics error:', error);
        res.status(500).json({ status: 'fail', message: error.message, stack: error.stack });
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

        // Verification status is now strictly tied to the subscription tier
        // Basic tier (default) is NOT verified. Only higher tiers are.
        business.isVerified = business.subscriptionTier !== 'basic';
        if (business.isVerified) {
            business.verifiedAt = new Date();
            business.verifiedBy = req.admin._id;
        }
        await business.save();

        // Update Business User
        const user = await BusinessUser.findById(claim.user._id);
        user.isActive = true;
        user.isAdminVerified = true;
        user.claimedBusinesses.addToSet(business._id);
        await user.save();

        // Log Admin Action
        await req.admin.logAction('approve_claim', 'claim', claim._id, `Approved claim for ${business.name}`);

        // Send Email (Non-blocking)
        const emailContent = emailTemplates.claimApproved(
            user.name,
            business.name,
            `${process.env.FRONTEND_URL}/business/dashboard`
        );
        sendEmail({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html
        }).catch(err => console.error('Failed to send approval email:', err.message));

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

        // Send Email (Non-blocking)
        const emailContent = emailTemplates.claimRejected(
            claim.user.name,
            business.name,
            rejectionReason
        );
        sendEmail({
            to: claim.user.email,
            subject: emailContent.subject,
            html: emailContent.html
        }).catch(err => console.error('Failed to send rejection email:', err.message));

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
            query.name = { $regex: search, $options: 'i' };
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
        const { name, category, categories, location, description, website, phone, email } = req.body;

        // Basic validation
        if (!name || (!category && (!categories || categories.length === 0)) || !location || !phone) {
            return res.status(400).json({ status: 'fail', message: 'Name, categories, location, and phone are required' });
        }

        const business = await Business.create({
            name,
            category: category || (categories ? categories[0] : 'Other'), // Fallback
            categories: categories || [category], // Support both
            location,
            description,
            website,
            phone,
            email,
            // Verification status is now strictly tied to the subscription tier
            isVerified: false, // Defaults to basic tier, so not verified
            claimStatus: 'unclaimed',
            isClaimed: false,
            status: 'approved' // Admin created businesses are approved by default
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

// PUT /api/admin/businesses/:id/status - Update business status (approve/reject)
router.put('/businesses/:id/status', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid status' });
        }

        const business = await Business.findById(id);
        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found' });
        }

        // Update status
        business.status = status;

        // If approved, strictly tie verification to subscription tier
        if (status === 'approved') {
            // Ensure verification is consistent with tier
            business.isVerified = business.subscriptionTier !== 'basic';
            if (business.isVerified) {
                business.verifiedBy = req.admin._id;
                business.verifiedAt = new Date();
            }
        }

        await business.save();

        // Log action
        await req.admin.logAction(
            'update_business_status',
            'business',
            business._id,
            `Updated status to ${status} for ${business.name}`
        );

        res.status(200).json({
            status: 'success',
            message: `Business status updated to ${status}`,
            data: { business }
        });
    } catch (error) {
        console.error('Update business status error:', error);
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

// module.exports moved to end

// GET /api/admin/users - List all users
router.get('/users', verifyAdminToken, async (req, res) => {
    try {
        const { search, isBlocked } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (isBlocked !== undefined) {
            query.isBlocked = isBlocked === 'true';
        }

        const users = await require('../models/User').find(query).sort('-createdAt');
        res.status(200).json({ status: 'success', data: { users, count: users.length } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PUT /api/admin/users/:id/block - Block/Unblock user
router.put('/users/:id/block', verifyAdminToken, async (req, res) => {
    try {
        const { isBlocked } = req.body;
        const user = await require('../models/User').findByIdAndUpdate(
            req.params.id,
            { isBlocked },
            { new: true }
        );

        if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });

        await req.admin.logAction(
            isBlocked ? 'block_user' : 'unblock_user',
            'user',
            user._id,
            `${isBlocked ? 'Blocked' : 'Unblocked'} user ${user.email}`
        );

        res.status(200).json({ status: 'success', message: `User ${isBlocked ? 'blocked' : 'unblocked'}` });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/admin/business-owners - List all business owners with their claimed businesses
router.get('/business-owners', verifyAdminToken, async (req, res) => {
    try {
        const { search, status } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { businessEmail: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (status === 'active') {
            query.isSuspended = { $ne: true };
        } else if (status === 'suspended') {
            query.isSuspended = true;
        } else if (status === 'verified') {
            query.isEmailVerified = true;
            query.isAdminVerified = true;
        } else if (status === 'pending') {
            query.$or = [
                { isEmailVerified: false },
                { isAdminVerified: false }
            ];
        }

        const businessOwners = await BusinessUser.find(query)
            .populate('claimedBusinesses', 'name category location isVerified subscriptionTier')
            .select('-password -emailVerificationToken -passwordResetToken')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            data: {
                businessOwners,
                count: businessOwners.length
            }
        });
    } catch (error) {
        console.error('Get business owners error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PUT /api/admin/business-owners/:id/suspend - Suspend/Unsuspend business owner
router.put('/business-owners/:id/suspend', verifyAdminToken, async (req, res) => {
    try {
        const { isSuspended, reason } = req.body;
        const user = await BusinessUser.findByIdAndUpdate(
            req.params.id,
            {
                isSuspended,
                suspensionReason: isSuspended ? (reason || 'Suspended by admin') : null
            },
            { new: true }
        );

        if (!user) return res.status(404).json({ status: 'fail', message: 'Business owner not found' });

        await req.admin.logAction(
            isSuspended ? 'suspend_business_owner' : 'unsuspend_business_owner',
            'business_user',
            user._id,
            `${isSuspended ? 'Suspended' : 'Unsuspended'} business owner ${user.email}`
        );

        res.status(200).json({
            status: 'success',
            message: `Business owner ${isSuspended ? 'suspended' : 'unsuspended'} successfully`
        });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/admin/reviews/disputes - List disputed reviews
router.get('/reviews/disputes', verifyAdminToken, async (req, res) => {
    try {
        const reviews = await Review.find({ disputeStatus: 'pending' })
            .populate('business', 'name')
            .populate('user', 'name email')
            .sort('-createdAt');

        res.status(200).json({ status: 'success', data: { reviews } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PUT /api/admin/reviews/:id/dispute-decision - Accept or Reject Dispute
router.put('/reviews/:id/dispute-decision', verifyAdminToken, async (req, res) => {
    try {
        const { decision } = req.body; // 'accepted' or 'rejected'

        if (!['accepted', 'rejected'].includes(decision)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid decision' });
        }

        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ status: 'fail', message: 'Review not found' });

        if (decision === 'accepted') {
            // Delete the review
            const businessId = review.business;
            await Review.findByIdAndDelete(review._id);

            // Update business rating
            const allReviews = await Review.find({ business: businessId, isHidden: { $ne: true } });
            const avgRating = allReviews.length > 0
                ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
                : 0;

            await Business.findByIdAndUpdate(businessId, {
                rating: avgRating.toFixed(1),
                reviewCount: allReviews.length
            });

            await req.admin.logAction('accept_dispute', 'review', review._id, 'Accepted dispute and deleted review');
        } else {
            // Reject dispute
            review.disputeStatus = 'rejected';
            await review.save();
            await req.admin.logAction('reject_dispute', 'review', review._id, 'Rejected dispute, review stays');
        }

        res.status(200).json({ status: 'success', message: `Dispute ${decision}` });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/admin/deletion-requests - List pending business account deletion requests
router.get('/deletion-requests', verifyAdminToken, async (req, res) => {
    try {
        const users = await BusinessUser.find({ 'deletionRequest.status': 'pending' })
            .select('-password')
            .sort('-deletionRequest.requestedAt');

        res.status(200).json({ status: 'success', data: { requests: users } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PUT /api/admin/deletion-requests/:id/approve - Approve business account deletion
router.put('/deletion-requests/:id/approve', verifyAdminToken, async (req, res) => {
    try {
        const user = await BusinessUser.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        if (user.deletionRequest.status !== 'pending') {
            return res.status(400).json({ status: 'fail', message: 'No pending deletion request found' });
        }

        // 1. Unclaim all associated businesses
        if (user.claimedBusinesses && user.claimedBusinesses.length > 0) {
            await Business.updateMany(
                { _id: { $in: user.claimedBusinesses } },
                {
                    $set: {
                        owner: null,
                        isClaimed: false,
                        claimStatus: 'unclaimed',
                        subscriptionStatus: 'inactive',
                        subscriptionTier: 'basic'
                    }
                }
            );
        }

        // 2. Clear user records or hard delete? User said "their details should be deleted".
        // For business user, approval granted -> deleted.
        const userName = user.name;
        const userEmail = user.email;

        await BusinessUser.findByIdAndDelete(user._id);

        // 3. Log action
        await req.admin.logAction(
            'approve_deletion',
            'business_user',
            user._id,
            `Approved account deletion for ${userName} (${userEmail})`
        );

        res.status(200).json({ status: 'success', message: 'Account deleted and businesses unclaimed successfully' });
    } catch (error) {
        console.error('Approve deletion error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PUT /api/admin/deletion-requests/:id/reject - Reject business account deletion
router.put('/deletion-requests/:id/reject', verifyAdminToken, async (req, res) => {
    try {
        const user = await BusinessUser.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        user.deletionRequest.status = 'rejected';
        await user.save();

        // Log action
        await req.admin.logAction(
            'reject_deletion',
            'business_user',
            user._id,
            `Rejected account deletion for ${user.name} (${user.email})`
        );

        res.status(200).json({ status: 'success', message: 'Deletion request rejected' });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

module.exports = router;

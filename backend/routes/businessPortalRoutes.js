const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const BusinessUser = require('../models/BusinessUser');
const ClaimRequest = require('../models/ClaimRequest');
const Review = require('../models/Review'); // Ensure Review model is loaded
const User = require('../models/User'); // Helper: Ensure User model is loaded for population
const { verifyBusinessToken } = require('../middleware/businessAuth');
const { sendEmail, emailTemplates } = require('../utils/emailService');
const upload = require('../middleware/uploadMiddleware');

// Middleware: Verify business user is active and email verified
// Middleware: Verify business user is active and email verified
const verifyVerifiedBusinessUser = (req, res, next) => {
    // Check skipped as per requirement to allow unverified access
    /*
    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            status: 'fail',
            message: 'Please verify your email address first'
        });
    }
    */
    next();
};

// GET /api/business-portal/dashboard
router.get('/dashboard', verifyBusinessToken, verifyVerifiedBusinessUser, async (req, res) => {
    try {
        const user = req.user;

        // Fetch businesses claimed/owned by this user
        const businesses = await Business.find({ owner: user._id });

        // Fetch pending claim requests
        const claims = await ClaimRequest.find({ user: user._id })
            .populate('business', 'name location category logo');

        // Calculate total stats across all businesses
        const totalReviews = businesses.reduce((sum, biz) => sum + (biz.reviewCount || 0), 0);
        const totalViews = businesses.reduce((sum, biz) => sum + (biz.viewCount || 0), 0);
        const totalClicks = businesses.reduce((sum, biz) => sum + (biz.websiteClickCount || 0), 0);
        const totalLikes = businesses.reduce((sum, biz) => sum + (biz.likes || 0), 0);

        const avgRating = businesses.length > 0
            ? (businesses.reduce((sum, biz) => sum + (biz.rating || 0), 0) / businesses.length).toFixed(1)
            : 0;

        res.status(200).json({
            status: 'success',
            data: {
                businesses,
                claims,
                stats: {
                    totalBusinesses: businesses.length,
                    totalReviews,
                    totalViews,
                    totalClicks,
                    totalLikes,
                    avgRating
                }
            }
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/business-portal/search
router.get('/search', verifyBusinessToken, async (req, res) => {
    try {
        const { q } = req.query;
        console.log(`Search Request: "${q}"`);

        if (!q || q.length < 2) {
            return res.status(200).json({ status: 'success', data: { businesses: [] } });
        }

        const businesses = await Business.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ],
            claimStatus: { $ne: 'claimed' } // Only show unclaimed or pending businesses
        }).select('name category categories location website logo claimStatus');

        res.status(200).json({
            status: 'success',
            data: { businesses }
        });
    } catch (error) {
        console.error('Business search error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// POST /api/business-portal/claim/:businessId
router.post('/claim/:businessId', verifyBusinessToken, verifyVerifiedBusinessUser, async (req, res) => {
    try {
        const { businessId } = req.params;
        const { businessEmail, phone, position, documents } = req.body;
        const user = req.user;

        // Check location limits
        const ownedCount = await Business.countDocuments({ owner: user._id });
        const pendingCount = await ClaimRequest.countDocuments({ user: user._id, status: 'pending' });

        // Find max allowed locations from current businesses
        const businesses = await Business.find({ owner: user._id });
        const maxAllowed = businesses.length > 0
            ? Math.max(...businesses.map(b => b.features?.maxLocations || 1))
            : 1;

        if (ownedCount + pendingCount >= maxAllowed) {
            return res.status(403).json({
                status: 'fail',
                message: `You have reached the maximum number of locations allowed for your current plan (${maxAllowed}). Please upgrade your existing business plan to add more locations.`,
                limit: maxAllowed,
                current: ownedCount,
                pending: pendingCount
            });
        }

        // Check if business exists
        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found' });
        }

        // Check if already claimed
        if (business.claimStatus === 'claimed') {
            return res.status(400).json({ status: 'fail', message: 'Business is already claimed' });
        }

        // Check if user already has a pending claim for this business
        const existingClaim = await ClaimRequest.findOne({
            business: businessId,
            user: user._id,
            status: 'pending'
        });

        if (existingClaim) {
            return res.status(400).json({ status: 'fail', message: 'You already have a pending claim for this business' });
        }

        // Create claim request
        const claimRequest = await ClaimRequest.create({
            business: businessId,
            user: user._id,
            businessEmail,
            phone,
            position,
            documents
        });

        // Update business claim status
        business.claimStatus = 'pending';
        await business.save();

        // Send confirmation emails
        const emailContent = emailTemplates.claimReceived(user.name, business.name, claimRequest._id);
        await sendEmail({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html
        });

        // Notify admin (mock implementation - in real app would lookup active admins)
        // await sendEmail({ to: 'admin@naijatrust.com', ... })

        res.status(201).json({
            status: 'success',
            message: 'Claim request submitted successfully',
            data: { claim: claimRequest }
        });
    } catch (error) {
        console.error('Claim submission error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// POST /api/business-portal/register
router.post('/register', verifyBusinessToken, verifyVerifiedBusinessUser, async (req, res) => {
    try {
        const { name, category, categories, location, description, website, phone, email, documents } = req.body;
        const user = req.user;

        // Check location limits
        const ownedCount = await Business.countDocuments({ owner: user._id });
        const pendingCount = await ClaimRequest.countDocuments({ user: user._id, status: 'pending' });

        const businesses = await Business.find({ owner: user._id });
        const maxAllowed = businesses.length > 0
            ? Math.max(...businesses.map(b => b.features?.maxLocations || 1))
            : 1;

        if (ownedCount + pendingCount >= maxAllowed) {
            return res.status(403).json({
                status: 'fail',
                message: `You have reached the maximum number of locations allowed for your current plan (${maxAllowed}). Please upgrade your existing business plan to add more locations.`,
                limit: maxAllowed,
                current: ownedCount,
                pending: pendingCount
            });
        }

        // Create new business (initially verified=false)
        const newBusiness = await Business.create({
            name,
            category: category || (categories ? categories[0] : 'Other'),
            categories: categories || [category],
            location,
            description,
            website,
            phone,
            email,
            owner: user._id,
            claimStatus: 'pending', // Special status for new registration, treat as pending claim
            isVerified: false,
            status: 'pending', // Default to pending approval
            rating: 5,
            reviewCount: 0
        });

        // Create claim request for the new business (so admins can review documents)
        const claimRequest = await ClaimRequest.create({
            business: newBusiness._id,
            user: user._id,
            businessEmail: email,
            phone,
            position: user.position,
            documents,
            additionalInfo: 'New Business Registration'
        });

        // Note: We don't verify automatically. Admins must review the documents.

        res.status(201).json({
            status: 'success',
            message: 'Business registered successfully. Documents submitted for review.',
            data: { business: newBusiness, claim: claimRequest }
        });
    } catch (error) {
        console.error('Business registration error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// POST /api/business-portal/upload-logo/:businessId
router.post('/upload-logo/:businessId', verifyBusinessToken, verifyVerifiedBusinessUser, upload.single('logo'), async (req, res) => {
    try {
        const { businessId } = req.params;
        const user = req.user;

        if (!req.file) {
            return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
        }

        const business = await Business.findOne({ _id: businessId, owner: user._id });
        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found or access denied' });
        }

        business.logo = `/uploads/${req.file.filename}`;
        await business.save();

        res.status(200).json({
            status: 'success',
            message: 'Logo uploaded successfully',
            data: { logo: business.logo }
        });
    } catch (error) {
        console.error('Logo upload error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/business-portal/claim-requests
router.get('/claim-requests', verifyBusinessToken, verifyVerifiedBusinessUser, async (req, res) => {
    try {
        const user = req.user;
        const claims = await ClaimRequest.find({ user: user._id })
            .populate('business', 'name category')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            data: { claims }
        });
    } catch (error) {
        console.error('Get claims error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

const AnalyticsLog = require('../models/AnalyticsLog');

// GET /api/business-portal/analytics
router.get('/analytics', verifyBusinessToken, verifyVerifiedBusinessUser, async (req, res) => {
    try {
        const user = req.user;
        const businesses = await Business.find({ owner: user._id });
        const businessIds = businesses.map(b => b._id);

        // Fetch logs for these businesses
        const logs = await AnalyticsLog.find({ businessId: { $in: businessIds } })
            .populate('businessId', 'name') // The field in AnalyticsLog is 'businessId'
            .sort('-timestamp');

        // Map logs to have 'business' field for frontend compatibility
        const formattedLogs = logs.map(log => ({
            ...log.toObject(),
            business: log.businessId // Mapping businessId (populated object) to business
        }));

        res.status(200).json({
            status: 'success',
            data: { logs: formattedLogs }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/business-portal/reviews/:businessId
router.get('/reviews/:businessId', verifyBusinessToken, verifyVerifiedBusinessUser, async (req, res) => {
    try {
        const { businessId } = req.params;
        const user = req.user;

        // Check ownership
        const business = await Business.findOne({ _id: businessId, owner: user._id });
        if (!business) {
            return res.status(403).json({ status: 'fail', message: 'Not authorized to view reviews for this business' });
        }

        const reviews = await Review.find({ business: businessId })
            .populate('user', 'name avatar')
            .populate('replies.user', 'name avatar') // Populate user details in replies too
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            data: { reviews, business }
        });
    } catch (error) {
        console.error('Get business reviews error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// GET /api/business-portal/reviews (All reviews for all businesses owned by user)
router.get('/reviews', verifyBusinessToken, verifyVerifiedBusinessUser, async (req, res) => {
    try {
        const user = req.user;

        // Find all businesses owned by user
        const businesses = await Business.find({ owner: user._id });
        const businessIds = businesses.map(b => b._id);

        const reviews = await Review.find({ business: { $in: businessIds } })
            .populate('user', 'name avatar')
            .populate('business', 'name subscriptionTier')
            .populate('replies.user', 'name avatar')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            data: { reviews }
        });
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// POST /api/business-portal/reviews/:reviewId/reply
router.post('/reviews/:reviewId/reply', verifyBusinessToken, verifyVerifiedBusinessUser, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { content } = req.body;
        const user = req.user;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ status: 'fail', message: 'Review not found' });
        }

        // Verify ownership of the business being reviewed
        const business = await Business.findOne({ _id: review.business, owner: user._id });
        if (!business) {
            return res.status(403).json({ status: 'fail', message: 'Not authorized to reply to this review' });
        }

        // Check subscription feature access using config as source of truth
        const { getFeatures } = require('../config/subscriptionPlans');
        const features = getFeatures(business.subscriptionTier);

        if (!features || !features.canRespondToReviews) {
            return res.status(403).json({
                status: 'fail',
                message: 'Responding to reviews requires a Verified subscription or higher',
                currentTier: business.subscriptionTier,
                requiredTier: 'verified',
                upgradeUrl: '/pricing',
                feature: 'canRespondToReviews'
            });
        }

        // Add reply
        review.replies.push({
            user: user._id,
            onModel: 'BusinessUser',
            content,
            isBusiness: true,
            createdAt: new Date()
        });

        await review.save();

        res.status(200).json({
            status: 'success',
            message: 'Reply posted successfully',
            data: { review }
        });
    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// POST /api/business-portal/reviews/:reviewId/dispute
router.post('/reviews/:reviewId/dispute', verifyBusinessToken, verifyVerifiedBusinessUser, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason } = req.body;
        const user = req.user;

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ status: 'fail', message: 'Review not found' });

        // Verify ownership
        const business = await Business.findOne({ _id: review.business, owner: user._id });
        if (!business) return res.status(403).json({ status: 'fail', message: 'Not authorized' });

        if (review.disputeStatus === 'pending') {
            return res.status(400).json({ status: 'fail', message: 'Dispute already pending' });
        }

        review.disputeStatus = 'pending';
        review.disputeReason = reason;
        await review.save();

        res.status(200).json({ status: 'success', message: 'Dispute submitted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// PATCH /api/business-portal/businesses/:businessId
router.patch('/businesses/:businessId', verifyBusinessToken, verifyVerifiedBusinessUser, async (req, res) => {
    try {
        const { businessId } = req.params;
        const { name, description, website, phone, email, categories, location } = req.body;
        const user = req.user;

        const business = await Business.findOne({ _id: businessId, owner: user._id });
        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found or access denied' });
        }

        // Update fields if provided
        if (name) business.name = name;
        if (description) business.description = description;
        if (website) business.website = website;
        if (phone) business.phone = phone;
        if (email) business.email = email;
        if (categories) {
            business.categories = categories;
            if (categories.length > 0) business.category = categories[0];
        }
        if (location) business.location = location;

        business.updatedAt = new Date();
        await business.save();

        res.status(200).json({
            status: 'success',
            message: 'Business profile updated successfully',
            data: { business }
        });
    } catch (error) {
        console.error('Update business error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

// POST /api/business-portal/account/request-deletion
router.post('/account/request-deletion', verifyBusinessToken, async (req, res) => {
    try {
        const { reason } = req.body;
        const user = req.user;

        if (!reason) {
            return res.status(400).json({ status: 'fail', message: 'Please provide a reason for deletion' });
        }

        const businessUser = await BusinessUser.findById(user._id);
        if (!businessUser) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        businessUser.deletionRequest = {
            status: 'pending',
            reason,
            requestedAt: new Date()
        };

        await businessUser.save();

        res.status(200).json({
            status: 'success',
            message: 'Account deletion request submitted. Our team will review it shortly.'
        });
    } catch (error) {
        console.error('Account deletion request error:', error);
        res.status(500).json({ status: 'fail', message: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const BusinessUser = require('../models/BusinessUser');
const ClaimRequest = require('../models/ClaimRequest');
const { verifyBusinessToken } = require('./businessAuthRoutes');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// Middleware: Verify business user is active and email verified
const verifyVerifiedBusinessUser = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            status: 'fail',
            message: 'Please verify your email address first'
        });
    }
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

        if (!q || q.length < 2) {
            return res.status(200).json({ status: 'success', data: { businesses: [] } });
        }

        const businesses = await Business.find({
            $text: { $search: q },
            claimStatus: { $ne: 'claimed' } // Only show unclaimed or pending businesses
        }).select('name category location website logo claimStatus');

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
        const { name, category, location, description, website, phone, email, documents } = req.body;
        const user = req.user;

        // Create new business (initially verified=false)
        const newBusiness = await Business.create({
            name,
            category,
            location,
            description,
            website,
            phone,
            email,
            owner: user._id,
            claimStatus: 'pending', // Special status for new registration, treat as pending claim
            isVerified: false
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

const Review = require('../models/Review');

// ... existing code ...

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
            data: { reviews }
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
            .populate('business', 'name')
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

        // Add reply
        review.replies.push({
            user: user._id, // This writes BusinessUser ID. Frontend needs to handle this polymorphic ref if possible?
            // Actually Review schema 'replies.user' is ref 'User'. 
            // We might need to handle this carefully.
            // If Schema allows any ObjectId, it's fine. If it strictly refs 'User', population might fail or return null.
            // Let's check Review schema. For now, pushing ID.
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

module.exports = router;

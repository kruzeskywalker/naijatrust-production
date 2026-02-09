const express = require('express');
const Business = require('../models/Business');
const router = express.Router();

// JWT verification middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = await User.findById(decoded.id);
        if (!req.user) return res.status(401).json({ message: 'User not found' });
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Optional auth - sets req.user if token present, but doesn't require it
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            req.user = await User.findById(decoded.id);
        }
        next();
    } catch (err) {
        // Token invalid, continue without user
        next();
    }
};

// Get all businesses (with search, category filters, and pagination)
router.get('/', async (req, res) => {
    try {
        const { category, q, rating, verified, page = 1, limit = 20 } = req.query;
        let query = {};

        if (category) {
            // Find businesses where 'categories' array contains the category
            // OR 'category' field matches (backward compatibility)
            query.$or = [
                { categories: category },
                { category: category }
            ];
        }

        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { categories: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } }
            ];
        }

        // Filter by Rating (Greater than or equal)
        if (rating) {
            query.rating = { $gte: Number(rating) };
        }

        // Filter by Verification (Optional)
        if (verified === 'true') {
            query.isVerified = true;
        }

        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const businesses = await Business.find(query)
            .sort('-rating')
            .limit(limitNum)
            .skip(skip);

        const total = await Business.countDocuments(query);

        res.status(200).json({
            status: 'success',
            data: {
                businesses,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// GET /api/businesses/user/liked - Get businesses liked by current user
router.get('/user/liked', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id;

        // Find user and populate liked businesses
        const user = await User.findById(userId).populate({
            path: 'likedBusinesses',
            select: 'name category location rating reviewCount logo isVerified description'
        });

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        res.status(200).json({
            status: 'success',
            results: user.likedBusinesses.length,
            data: {
                businesses: user.likedBusinesses
            }
        });
    } catch (err) {
        console.error('Get liked businesses error:', err);
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Get single business
router.get('/:id', async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found' });
        }

        // Calculate Rankings for each category
        const rankings = [];
        const categories = business.categories && business.categories.length > 0
            ? business.categories
            : (business.category ? [business.category] : []);

        for (const cat of categories) {
            // Count businesses in this category with higher rating
            // Tie-breaker: reviewCount
            const higherRankedCount = await Business.countDocuments({
                $and: [
                    {
                        $or: [
                            { categories: cat },
                            { category: cat }
                        ]
                    },
                    {
                        $or: [
                            { rating: { $gt: business.rating } },
                            {
                                rating: business.rating,
                                reviewCount: { $gt: business.reviewCount }
                            }
                        ]
                    }
                ]
            });

            // Count total businesses in this category
            const totalInCat = await Business.countDocuments({
                $or: [
                    { categories: cat },
                    { category: cat }
                ]
            });

            rankings.push({
                category: cat,
                rank: higherRankedCount + 1, // 1-based rank
                total: totalInCat
            });
        }

        // Attach rankings to response
        const businessObj = business.toObject();
        businessObj.rankings = rankings;

        res.status(200).json({ status: 'success', data: { business: businessObj } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// POST /api/businesses/:id/analytics
// Record a view, website click, or call click
const AnalyticsLog = require('../models/AnalyticsLog');

router.post('/:id/analytics', async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // 'view', 'website_click', 'call_click'

        if (!['view', 'website_click', 'call_click'].includes(type)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid event type' });
        }

        const business = await Business.findById(id);
        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found' });
        }

        // 1. Log the event in history
        await AnalyticsLog.create({
            businessId: id,
            eventType: type,
            // visitorIp: req.ip, // Optional
            timestamp: new Date()
        });

        // 2. Increment aggregated counter
        if (type === 'view') {
            business.viewCount = (business.viewCount || 0) + 1;
        } else if (type === 'website_click') {
            business.websiteClickCount = (business.websiteClickCount || 0) + 1;
        }
        await business.save();

        res.status(200).json({ status: 'success' });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(400).json({ status: 'fail', message: err.message });
    }
});



// POST /api/businesses/:id/like - Like a business
router.post('/:id/like', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const business = await Business.findById(id);
        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found' });
        }

        // Check if user already liked
        const alreadyLiked = req.user.likedBusinesses?.includes(id);
        if (alreadyLiked) {
            return res.status(400).json({ status: 'fail', message: 'You have already liked this business' });
        }

        // Add to user's likedBusinesses
        await User.findByIdAndUpdate(userId, {
            $addToSet: { likedBusinesses: id }
        });

        // Increment business likes count
        business.likes = (business.likes || 0) + 1;
        await business.save();

        res.status(200).json({
            status: 'success',
            data: {
                likes: business.likes,
                hasLiked: true
            }
        });
    } catch (err) {
        console.error('Like error:', err);
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// DELETE /api/businesses/:id/like - Unlike a business
router.delete('/:id/like', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const business = await Business.findById(id);
        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found' });
        }

        // Check if user has liked
        const hasLiked = req.user.likedBusinesses?.includes(id);
        if (!hasLiked) {
            return res.status(400).json({ status: 'fail', message: 'You have not liked this business' });
        }

        // Remove from user's likedBusinesses
        await User.findByIdAndUpdate(userId, {
            $pull: { likedBusinesses: id }
        });

        // Decrement business likes count (ensure it doesn't go below 0)
        business.likes = Math.max((business.likes || 0) - 1, 0);
        await business.save();

        res.status(200).json({
            status: 'success',
            data: {
                likes: business.likes,
                hasLiked: false
            }
        });
    } catch (err) {
        console.error('Unlike error:', err);
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// GET /api/businesses/:id/like-status - Check if user has liked a business
router.get('/:id/like-status', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const business = await Business.findById(id);
        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found' });
        }

        const hasLiked = req.user?.likedBusinesses?.some(
            likedId => likedId.toString() === id
        ) || false;

        res.status(200).json({
            status: 'success',
            data: {
                likes: business.likes || 0,
                hasLiked
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});



module.exports = router;


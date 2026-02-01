const express = require('express');
const Business = require('../models/Business');
const router = express.Router();

// Get all businesses (with search, category filters, and pagination)
router.get('/', async (req, res) => {
    try {
        const { category, q, rating, verified, page = 1, limit = 20 } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
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

// Get single business
router.get('/:id', async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found' });
        }
        res.status(200).json({ status: 'success', data: { business } });
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

module.exports = router;

const express = require('express');
const Business = require('../models/Business');
const router = express.Router();

// Get all businesses (with search and category filters)
router.get('/', async (req, res) => {
    try {
        const { category, q } = req.query;
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
        if (req.query.rating) {
            query.rating = { $gte: Number(req.query.rating) };
        }

        // Filter by Verification (Optional)
        if (req.query.verified === 'true') {
            query.isVerified = true;
        }
        // If nothing specified, show all (or maybe verified only? Let's show all for search completeness unless filtered)
        // Previous behavior was ONLY verified. I will comment it out to allow all, enabling the filter to work meaningfully.
        // query.isVerified = true;

        const businesses = await Business.find(query).sort('-rating');
        res.status(200).json({ status: 'success', data: { businesses } });
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

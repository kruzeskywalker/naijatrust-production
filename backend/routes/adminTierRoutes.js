const express = require('express');
const router = express.Router();
const TierUpgradeRequest = require('../models/TierUpgradeRequest');
const Business = require('../models/Business');
const tierUpgradeUtils = require('../utils/tierUpgradeUtils');

// Middleware to verify admin token (reuse from existing admin routes)
const verifyAdminToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const AdminUser = require('../models/AdminUser');
        req.admin = await AdminUser.findById(decoded.id);

        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found'
            });
        }

        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// GET /api/admin/tier-requests - Get all tier upgrade requests
router.get('/tier-requests', verifyAdminToken, async (req, res) => {
    try {
        const { status, tier, page = 1, limit = 20, search } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (tier) query.requestedTier = tier;

        // Search by business name
        if (search) {
            const businesses = await Business.find({
                name: { $regex: search, $options: 'i' }
            }).select('_id');
            query.business = { $in: businesses.map(b => b._id) };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get requests with populated data
        const requests = await TierUpgradeRequest.find(query)
            .populate('business', 'name category location subscriptionTier subscriptionStatus')
            .populate('businessUser', 'name email phone')
            .populate('reviewedBy', 'name email')
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit));

        const total = await TierUpgradeRequest.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                requests,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching tier requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tier upgrade requests'
        });
    }
});

// GET /api/admin/tier-requests/stats - Get tier request statistics
router.get('/tier-requests/stats', verifyAdminToken, async (req, res) => {
    try {
        const stats = await TierUpgradeRequest.getStats();

        // Get pending count
        const pendingCount = await TierUpgradeRequest.countDocuments({ status: 'pending' });

        // Get recent requests (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCount = await TierUpgradeRequest.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                ...stats,
                pendingCount,
                recentCount
            }
        });
    } catch (error) {
        console.error('Error fetching tier request stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// GET /api/admin/tier-requests/:id - Get single tier request details
router.get('/tier-requests/:id', verifyAdminToken, async (req, res) => {
    try {
        const request = await TierUpgradeRequest.findById(req.params.id)
            .populate('business')
            .populate('businessUser')
            .populate('reviewedBy', 'name email');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Tier upgrade request not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { request }
        });
    } catch (error) {
        console.error('Error fetching tier request:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tier upgrade request'
        });
    }
});

// POST /api/admin/tier-requests/:id/approve - Approve tier upgrade request
router.post('/tier-requests/:id/approve', verifyAdminToken, async (req, res) => {
    try {
        const { adminNotes } = req.body;

        const result = await tierUpgradeUtils.approveUpgrade(
            req.params.id,
            req.admin._id,
            adminNotes
        );

        res.status(200).json({
            success: true,
            message: 'Tier upgrade approved successfully',
            data: result
        });
    } catch (error) {
        console.error('Error approving tier upgrade:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error approving tier upgrade'
        });
    }
});

// POST /api/admin/tier-requests/:id/reject - Reject tier upgrade request
router.post('/tier-requests/:id/reject', verifyAdminToken, async (req, res) => {
    try {
        const { rejectionReason, adminNotes } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const request = await tierUpgradeUtils.rejectUpgrade(
            req.params.id,
            req.admin._id,
            rejectionReason,
            adminNotes
        );

        res.status(200).json({
            success: true,
            message: 'Tier upgrade request rejected',
            data: { request }
        });
    } catch (error) {
        console.error('Error rejecting tier upgrade:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error rejecting tier upgrade'
        });
    }
});

// POST /api/admin/businesses/:id/change-tier - Manually change business tier
router.post('/businesses/:id/change-tier', verifyAdminToken, async (req, res) => {
    try {
        const { newTier, reason, duration } = req.body;

        if (!newTier) {
            return res.status(400).json({
                success: false,
                message: 'New tier is required'
            });
        }

        const result = await tierUpgradeUtils.manuallyChangeTier(
            req.params.id,
            newTier,
            req.admin._id,
            reason,
            duration
        );

        res.status(200).json({
            success: true,
            message: 'Business tier changed successfully',
            data: result
        });
    } catch (error) {
        console.error('Error changing business tier:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error changing business tier'
        });
    }
});

// POST /api/admin/tier-requests/bulk-approve - Bulk approve requests
router.post('/tier-requests/bulk-approve', verifyAdminToken, async (req, res) => {
    try {
        const { requestIds, adminNotes } = req.body;

        if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request IDs array is required'
            });
        }

        const results = [];
        const errors = [];

        for (const requestId of requestIds) {
            try {
                const result = await tierUpgradeUtils.approveUpgrade(
                    requestId,
                    req.admin._id,
                    adminNotes
                );
                results.push({ requestId, success: true, data: result });
            } catch (error) {
                errors.push({ requestId, success: false, error: error.message });
            }
        }

        res.status(200).json({
            success: true,
            message: `Approved ${results.length} of ${requestIds.length} requests`,
            data: {
                approved: results,
                failed: errors
            }
        });
    } catch (error) {
        console.error('Error bulk approving requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk approving requests'
        });
    }
});

module.exports = router;

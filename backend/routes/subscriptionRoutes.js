const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const subscriptionPlans = require('../config/subscriptionPlans');
const subscriptionUtils = require('../utils/subscriptionUtils');
const jwt = require('jsonwebtoken');

const { verifyBusinessToken } = require('../middleware/businessAuth');

// GET /api/subscriptions/plans - Get all subscription plans
router.get('/plans', async (req, res) => {
    try {
        const currency = req.query.currency || 'NGN';
        const plans = subscriptionPlans.getAllPlans();

        // Format plans for frontend
        const formattedPlans = plans.map(plan => ({
            tier: plan.tier,
            name: plan.name,
            displayName: plan.displayName,
            description: plan.description,
            popular: plan.popular || false,
            customPricing: plan.customPricing || false,
            contactSales: plan.contactSales || false,
            pricing: {
                monthly: {
                    amount: plan.price[currency].monthly,
                    currency: currency,
                    formatted: formatPrice(plan.price[currency].monthly, currency)
                },
                annual: plan.price[currency].annual ? {
                    amount: plan.price[currency].annual,
                    currency: currency,
                    formatted: formatPrice(plan.price[currency].annual, currency),
                    savings: plan.savings ? plan.savings[currency].annual : 0
                } : null
            },
            features: plan.features,
            limits: plan.limits,
            paystackPlanCode: plan.paystackPlanCode
        }));

        res.status(200).json({
            success: true,
            data: {
                plans: formattedPlans,
                currency: currency
            }
        });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription plans'
        });
    }
});

// GET /api/subscriptions/my-subscription - Get current subscription
router.get('/my-subscription', verifyBusinessToken, async (req, res) => {
    try {
        // Get business owned by this user
        const business = await Business.findOne({
            owner: req.user._id
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'No business found for this user'
            });
        }

        // Get active subscription
        const subscription = await Subscription.findOne({
            business: business._id,
            status: { $in: ['active', 'trialing', 'past_due'] }
        }).sort('-createdAt');

        // Get payment history
        const payments = await Payment.find({
            business: business._id
        }).sort('-createdAt').limit(10);

        res.status(200).json({
            success: true,
            data: {
                business: {
                    id: business._id,
                    name: business.name,
                    subscriptionTier: business.subscriptionTier,
                    subscriptionStatus: business.subscriptionStatus,
                    features: business.features,
                    isTrialing: business.isTrialing,
                    trialEndsAt: business.trialEndsAt,
                    renewalDate: business.subscriptionRenewalDate,
                    currency: business.currency
                },
                subscription: subscription,
                payments: payments
            }
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription details'
        });
    }
});

// POST /api/subscriptions/start-trial - Start free trial
router.post('/start-trial', verifyBusinessToken, async (req, res) => {
    try {
        const { businessId, tier = 'verified', trialDays = 30 } = req.body;

        // Verify business ownership
        const business = await Business.findOne({
            _id: businessId,
            owner: req.user._id
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found or you do not own this business'
            });
        }

        // Check if already has active subscription
        if (business.subscriptionStatus === 'active') {
            return res.status(400).json({
                success: false,
                message: 'Business already has an active subscription'
            });
        }

        // Check if already used trial
        if (business.isTrialing || business.trialEndsAt) {
            return res.status(400).json({
                success: false,
                message: 'Trial already used for this business'
            });
        }

        // Start trial
        const updatedBusiness = await subscriptionUtils.startTrial(
            businessId,
            tier,
            trialDays
        );

        res.status(200).json({
            success: true,
            message: `${trialDays}-day trial started successfully`,
            data: {
                business: {
                    id: updatedBusiness._id,
                    name: updatedBusiness.name,
                    subscriptionTier: updatedBusiness.subscriptionTier,
                    subscriptionStatus: updatedBusiness.subscriptionStatus,
                    features: updatedBusiness.features,
                    isTrialing: updatedBusiness.isTrialing,
                    trialEndsAt: updatedBusiness.trialEndsAt
                }
            }
        });
    } catch (error) {
        console.error('Error starting trial:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error starting trial'
        });
    }
});

// POST /api/subscriptions/cancel - Cancel subscription
router.post('/cancel', verifyBusinessToken, async (req, res) => {
    try {
        const { businessId, reason } = req.body;

        // Verify business ownership
        const business = await Business.findOne({
            _id: businessId,
            owner: req.user._id
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found or you do not own this business'
            });
        }

        // Cancel subscription
        const updatedBusiness = await subscriptionUtils.cancelSubscription(
            businessId,
            reason
        );

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: {
                business: {
                    id: updatedBusiness._id,
                    name: updatedBusiness.name,
                    subscriptionTier: updatedBusiness.subscriptionTier,
                    subscriptionStatus: updatedBusiness.subscriptionStatus,
                    features: updatedBusiness.features
                }
            }
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error cancelling subscription'
        });
    }
});

// POST /api/subscriptions/request-upgrade - Request tier upgrade
router.post('/request-upgrade', verifyBusinessToken, async (req, res) => {
    try {
        const { businessId, requestedTier, requestType, paymentMethod, paymentReference, amount, currency, billingCycle, businessNotes } = req.body;

        // Verify business ownership
        const business = await Business.findOne({
            _id: businessId,
            owner: req.user._id
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found or you do not own this business'
            });
        }

        const tierUpgradeUtils = require('../utils/tierUpgradeUtils');

        const request = await tierUpgradeUtils.processUpgradeRequest({
            businessId,
            businessUserId: req.user._id,
            requestedTier,
            requestType,
            paymentMethod,
            paymentReference,
            amount,
            currency,
            billingCycle,
            businessNotes
        });

        res.status(201).json({
            success: true,
            message: 'Tier upgrade request submitted successfully',
            data: { request }
        });
    } catch (error) {
        console.error('Error requesting upgrade:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error submitting upgrade request'
        });
    }
});

// GET /api/subscriptions/my-upgrade-requests - Get my upgrade requests
router.get('/my-upgrade-requests', verifyBusinessToken, async (req, res) => {
    try {
        const { businessId } = req.query;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: 'Business ID is required'
            });
        }

        // Verify business ownership
        const business = await Business.findOne({
            _id: businessId,
            owner: req.user._id
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found or you do not own this business'
            });
        }

        const TierUpgradeRequest = require('../models/TierUpgradeRequest');
        const requests = await TierUpgradeRequest.getRequestsByBusiness(businessId);

        res.status(200).json({
            success: true,
            data: { requests }
        });
    } catch (error) {
        console.error('Error fetching upgrade requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching upgrade requests'
        });
    }
});

// POST /api/subscriptions/cancel-upgrade-request - Cancel upgrade request
router.post('/cancel-upgrade-request', verifyBusinessToken, async (req, res) => {
    try {
        const { requestId } = req.body;

        if (!requestId) {
            return res.status(400).json({
                success: false,
                message: 'Request ID is required'
            });
        }

        const tierUpgradeUtils = require('../utils/tierUpgradeUtils');
        const request = await tierUpgradeUtils.cancelUpgradeRequest(requestId, req.user._id);

        res.status(200).json({
            success: true,
            message: 'Upgrade request cancelled successfully',
            data: { request }
        });
    } catch (error) {
        console.error('Error cancelling upgrade request:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error cancelling upgrade request'
        });
    }
});

// GET /api/subscriptions/stats - Get subscription statistics (Admin only)
router.get('/stats', async (req, res) => {
    try {
        const stats = await subscriptionUtils.getSubscriptionStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription statistics'
        });
    }
});

// Helper function to format price
function formatPrice(amount, currency) {
    if (amount === 0) return 'Free';

    if (currency === 'NGN') {
        // Convert from kobo to naira
        const naira = amount / 100;
        return `₦${naira.toLocaleString()}`;
    } else if (currency === 'USD') {
        // Convert from cents to dollars
        const dollars = amount / 100;
        return `$${dollars.toFixed(2)}`;
    }

    return `${amount}`;
}

module.exports = router;

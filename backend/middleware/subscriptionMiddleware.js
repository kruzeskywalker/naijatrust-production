const Business = require('../models/Business');
const subscriptionPlans = require('../config/subscriptionPlans');

/**
 * Middleware to check if business has an active subscription
 */
exports.requireActiveSubscription = async (req, res, next) => {
    try {
        const businessId = req.business?._id || req.params.businessId;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: 'Business ID required'
            });
        }

        const business = await Business.findById(businessId);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        // Check if subscription is active or trialing
        const isActive = business.subscriptionStatus === 'active' ||
            business.subscriptionStatus === 'trialing';

        if (!isActive) {
            return res.status(403).json({
                success: false,
                message: 'Active subscription required',
                currentTier: business.subscriptionTier,
                subscriptionStatus: business.subscriptionStatus,
                upgradeUrl: '/pricing'
            });
        }

        // Attach subscription info to request
        req.subscription = {
            tier: business.subscriptionTier,
            status: business.subscriptionStatus,
            features: business.features,
            isTrialing: business.isTrialing,
            trialEndsAt: business.trialEndsAt
        };

        next();
    } catch (error) {
        console.error('Subscription middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking subscription status'
        });
    }
};

/**
 * Middleware to check if business has access to a specific feature
 * Usage: requireFeature('canRespondToReviews')
 */
exports.requireFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            const businessId = req.business?._id || req.params.businessId;

            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: 'Business ID required'
                });
            }

            const business = await Business.findById(businessId);

            if (!business) {
                return res.status(404).json({
                    success: false,
                    message: 'Business not found'
                });
            }

            // Check if business has the required feature
            const hasFeature = business.features && business.features[featureName];

            if (!hasFeature) {
                // Get the minimum tier that has this feature
                const requiredTier = getMinimumTierForFeature(featureName);

                return res.status(403).json({
                    success: false,
                    message: `This feature requires a ${requiredTier} subscription or higher`,
                    requiredFeature: featureName,
                    currentTier: business.subscriptionTier,
                    requiredTier: requiredTier,
                    upgradeUrl: '/pricing'
                });
            }

            // Attach subscription info to request
            req.subscription = {
                tier: business.subscriptionTier,
                status: business.subscriptionStatus,
                features: business.features
            };

            next();
        } catch (error) {
            console.error('Feature check middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking feature access'
            });
        }
    };
};

/**
 * Middleware to check minimum subscription tier
 * Usage: requireTier('premium')
 */
exports.requireTier = (minimumTier) => {
    const tierHierarchy = ['basic', 'verified', 'premium', 'enterprise'];

    return async (req, res, next) => {
        try {
            const businessId = req.business?._id || req.params.businessId;

            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: 'Business ID required'
                });
            }

            const business = await Business.findById(businessId);

            if (!business) {
                return res.status(404).json({
                    success: false,
                    message: 'Business not found'
                });
            }

            const currentTierIndex = tierHierarchy.indexOf(business.subscriptionTier);
            const requiredTierIndex = tierHierarchy.indexOf(minimumTier);

            if (currentTierIndex < requiredTierIndex) {
                return res.status(403).json({
                    success: false,
                    message: `This feature requires a ${minimumTier} subscription or higher`,
                    currentTier: business.subscriptionTier,
                    requiredTier: minimumTier,
                    upgradeUrl: '/pricing'
                });
            }

            // Attach subscription info to request
            req.subscription = {
                tier: business.subscriptionTier,
                status: business.subscriptionStatus,
                features: business.features
            };

            next();
        } catch (error) {
            console.error('Tier check middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking subscription tier'
            });
        }
    };
};

/**
 * Helper function to get minimum tier for a feature
 */
function getMinimumTierForFeature(featureName) {
    const tiers = ['verified', 'premium', 'enterprise'];

    for (const tier of tiers) {
        const plan = subscriptionPlans[tier];
        if (plan && plan.features[featureName]) {
            return tier;
        }
    }

    return 'premium'; // Default fallback
}

/**
 * Middleware to attach subscription info to request (non-blocking)
 * Useful for optional subscription features
 */
exports.attachSubscriptionInfo = async (req, res, next) => {
    try {
        const businessId = req.business?._id || req.params.businessId;

        if (businessId) {
            const business = await Business.findById(businessId);

            if (business) {
                req.subscription = {
                    tier: business.subscriptionTier,
                    status: business.subscriptionStatus,
                    features: business.features,
                    isTrialing: business.isTrialing,
                    trialEndsAt: business.trialEndsAt
                };
            }
        }

        next();
    } catch (error) {
        console.error('Attach subscription info error:', error);
        // Don't block request on error
        next();
    }
};

module.exports = exports;

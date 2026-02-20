/**
 * Subscription Plan Configuration
 * Defines all subscription tiers, pricing, and features
 */

module.exports = {
    basic: {
        name: 'Basic',
        displayName: 'Basic (Free)',
        price: {
            NGN: {
                monthly: 0,
                annual: 0
            },
            USD: {
                monthly: 0,
                annual: 0
            }
        },
        features: {
            canRespondToReviews: false,
            canAccessAnalytics: false,
            canAccessAdvancedAnalytics: false,
            canBeFeatured: false,
            maxLocations: 1,
            hasAPIAccess: false,
            hasDedicatedSupport: false,
            verifiedBadge: false,
            prioritySupport: false,
            customIntegrations: false,
            whiteLabel: false
        },
        limits: {
            reviewResponses: 0,
            analyticsHistory: 0, // days
            locations: 1
        },
        description: 'Free tier for trial users and small businesses',
        popular: false
    },

    verified: {
        name: 'Verified',
        displayName: 'Verified Business',
        price: {
            NGN: {
                monthly: 500000, // ₦5,000 in kobo
                annual: 5000000  // ₦50,000 in kobo (save ₦10,000)
            },
            USD: {
                monthly: 357,    // $3.57 in cents
                annual: 3571     // $35.71 in cents
            }
        },
        features: {
            canRespondToReviews: true,
            canAccessAnalytics: true,
            canAccessAdvancedAnalytics: false,
            canBeFeatured: false,
            maxLocations: 1,
            hasAPIAccess: false,
            hasDedicatedSupport: false,
            verifiedBadge: true,
            prioritySupport: true,
            customIntegrations: false,
            whiteLabel: false
        },
        limits: {
            reviewResponses: -1, // unlimited
            analyticsHistory: 90, // 90 days
            locations: 1
        },
        description: 'Perfect for SMEs and established businesses',
        popular: true,
        savings: {
            NGN: { annual: 1000000 }, // Save ₦10,000
            USD: { annual: 71 }        // Save ~$0.71
        },
        paystackPlanCode: {
            NGN: {
                monthly: 'PLN_rrtvrpb3ht84h4g',
                annual: 'PLN_1de7t72n5xk4arl'
            }
        }
    },

    premium: {
        name: 'Premium',
        displayName: 'Premium Business',
        price: {
            NGN: {
                monthly: 1500000,  // ₦15,000 in kobo
                annual: 15000000   // ₦150,000 in kobo (save ₦30,000)
            },
            USD: {
                monthly: 1071,     // $10.71 in cents
                annual: 10714      // $107.14 in cents
            }
        },
        features: {
            canRespondToReviews: true,
            canAccessAnalytics: true,
            canAccessAdvancedAnalytics: true,
            canBeFeatured: true,
            maxLocations: 5,
            hasAPIAccess: true,
            hasDedicatedSupport: false,
            verifiedBadge: true,
            prioritySupport: true,
            customIntegrations: false,
            whiteLabel: false
        },
        limits: {
            reviewResponses: -1, // unlimited
            analyticsHistory: 365, // 1 year
            locations: 5,
            featuredListings: 3 // per month
        },
        description: 'For growing businesses and multi-location chains',
        popular: false,
        savings: {
            NGN: { annual: 3000000 }, // Save ₦30,000
            USD: { annual: 214 }       // Save ~$2.14
        },
        paystackPlanCode: {
            NGN: {
                monthly: 'PLN_p6l3zhfd3kymrbj',
                annual: 'PLN_n91zqdbajgxtw6f'
            }
        }
    },

    enterprise: {
        name: 'Enterprise',
        displayName: 'Enterprise',
        price: {
            NGN: {
                monthly: 2500000,  // ₦25,000 in kobo (starting price)
                annual: null       // Custom pricing
            },
            USD: {
                monthly: 1786,     // $17.86 in cents (starting price)
                annual: null       // Custom pricing
            }
        },
        features: {
            canRespondToReviews: true,
            canAccessAnalytics: true,
            canAccessAdvancedAnalytics: true,
            canBeFeatured: true,
            maxLocations: 999,
            hasAPIAccess: true,
            hasDedicatedSupport: true,
            verifiedBadge: true,
            prioritySupport: true,
            customIntegrations: true,
            whiteLabel: true
        },
        limits: {
            reviewResponses: -1, // unlimited
            analyticsHistory: -1, // unlimited
            locations: 999,
            featuredListings: -1, // unlimited
            apiCalls: 100000 // per month
        },
        description: 'For large corporations with custom needs',
        popular: false,
        customPricing: true,
        contactSales: true
    }
};

const plans = module.exports;

/**
 * Helper function to get plan by tier name
 */
const getPlan = function (tierName) {
    return plans[tierName] || null;
};

/**
 * Helper function to get all plans as array
 */
const getAllPlans = function () {
    return [
        { tier: 'basic', ...plans.basic },
        { tier: 'verified', ...plans.verified },
        { tier: 'premium', ...plans.premium },
        { tier: 'enterprise', ...plans.enterprise }
    ];
};

/**
 * Helper function to calculate price with discount
 */
const calculatePrice = function (tier, billingCycle, currency = 'NGN') {
    const plan = plans[tier];
    if (!plan) return 0;

    return plan.price[currency][billingCycle] || 0;
};

/**
 * Helper function to get features for a tier
 */
const getFeatures = function (tier) {
    const plan = plans[tier];
    if (!plan) return {};

    return plan.features;
};

/**
 * Helper function to check if user can access a feature
 */
const canAccessFeature = function (tier, featureName) {
    const features = getFeatures(tier);
    return features[featureName] || false;
};

module.exports = {
    ...plans,
    getPlan,
    getPlanDetails: getPlan, // Alias for backward compatibility
    getAllPlans,
    calculatePrice,
    getFeatures,
    getPlanFeatures: getFeatures, // Alias for backward compatibility
    canAccessFeature
};

const Business = require('../models/Business');
const Subscription = require('../models/Subscription');
const subscriptionPlans = require('../config/subscriptionPlans');

/**
 * Update business features based on subscription tier
 */
exports.updateBusinessFeatures = async (businessId, tier) => {
    try {
        const plan = subscriptionPlans[tier];
        if (!plan) {
            throw new Error(`Invalid subscription tier: ${tier}`);
        }

        const business = await Business.findById(businessId);
        if (!business) {
            throw new Error('Business not found');
        }

        // Update features based on plan
        business.features = { ...plan.features };
        business.subscriptionTier = tier;

        await business.save();

        return business;
    } catch (error) {
        console.error('Error updating business features:', error);
        throw error;
    }
};

/**
 * Activate subscription for a business
 */
exports.activateSubscription = async (businessId, subscriptionData) => {
    try {
        const { tier, billingCycle, paymentProvider, currency = 'NGN' } = subscriptionData;

        const business = await Business.findById(businessId);
        if (!business) {
            throw new Error('Business not found');
        }

        const plan = subscriptionPlans[tier];
        if (!plan) {
            throw new Error(`Invalid subscription tier: ${tier}`);
        }

        // Calculate dates
        const startDate = new Date();
        const renewalDate = new Date();

        if (billingCycle === 'monthly') {
            renewalDate.setMonth(renewalDate.getMonth() + 1);
        } else if (billingCycle === 'annual') {
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        }

        // Update business
        business.subscriptionTier = tier;
        business.subscriptionStatus = 'active';
        business.subscriptionStartDate = startDate;
        business.subscriptionRenewalDate = renewalDate;
        business.paymentMethod = paymentProvider;
        business.currency = currency;
        business.features = { ...plan.features };

        await business.save();

        return business;
    } catch (error) {
        console.error('Error activating subscription:', error);
        throw error;
    }
};

/**
 * Start trial for a business
 */
exports.startTrial = async (businessId, tier = 'verified', trialDays = 30) => {
    try {
        const business = await Business.findById(businessId);
        if (!business) {
            throw new Error('Business not found');
        }

        const plan = subscriptionPlans[tier];
        if (!plan) {
            throw new Error(`Invalid subscription tier: ${tier}`);
        }

        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

        // Update business
        business.subscriptionTier = tier;
        business.subscriptionStatus = 'trialing';
        business.isTrialing = true;
        business.trialEndsAt = trialEndsAt;
        business.subscriptionStartDate = new Date();
        business.features = { ...plan.features };

        await business.save();

        return business;
    } catch (error) {
        console.error('Error starting trial:', error);
        throw error;
    }
};

/**
 * Cancel subscription for a business
 */
exports.cancelSubscription = async (businessId, reason = null) => {
    try {
        const business = await Business.findById(businessId);
        if (!business) {
            throw new Error('Business not found');
        }

        // Find active subscription
        const subscription = await Subscription.findOne({
            business: businessId,
            status: { $in: ['active', 'trialing'] }
        });

        if (subscription) {
            subscription.status = 'cancelled';
            subscription.cancelledAt = new Date();
            subscription.cancellationReason = reason;
            subscription.autoRenew = false;
            await subscription.save();
        }

        // Downgrade to basic
        const basicPlan = subscriptionPlans.basic;
        business.subscriptionTier = 'basic';
        business.subscriptionStatus = 'cancelled';
        business.subscriptionEndDate = new Date();
        business.features = { ...basicPlan.features };
        business.isTrialing = false;

        await business.save();

        return business;
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
    }
};

/**
 * Check and process expired trials
 */
exports.processExpiredTrials = async () => {
    try {
        const now = new Date();

        const expiredTrials = await Business.find({
            isTrialing: true,
            trialEndsAt: { $lte: now },
            subscriptionStatus: 'trialing'
        });

        console.log(`Found ${expiredTrials.length} expired trials to process`);

        for (const business of expiredTrials) {
            // Downgrade to basic
            const basicPlan = subscriptionPlans.basic;
            business.subscriptionTier = 'basic';
            business.subscriptionStatus = 'inactive';
            business.isTrialing = false;
            business.features = { ...basicPlan.features };

            await business.save();

            console.log(`Trial expired for business: ${business.name} (${business._id})`);

            // TODO: Send email notification about trial expiration
        }

        return expiredTrials.length;
    } catch (error) {
        console.error('Error processing expired trials:', error);
        throw error;
    }
};

/**
 * Check and process subscriptions due for renewal
 */
exports.processRenewals = async () => {
    try {
        const now = new Date();

        const dueForRenewal = await Business.find({
            subscriptionStatus: 'active',
            subscriptionRenewalDate: { $lte: now }
        });

        console.log(`Found ${dueForRenewal.length} subscriptions due for renewal`);

        for (const business of dueForRenewal) {
            // Find subscription
            const subscription = await Subscription.findOne({
                business: business._id,
                status: 'active'
            });

            if (subscription && subscription.autoRenew) {
                // TODO: Process payment with payment provider
                console.log(`Processing renewal for business: ${business.name} (${business._id})`);

                // For now, just extend renewal date
                const renewalDate = new Date(business.subscriptionRenewalDate);
                if (subscription.billingCycle === 'monthly') {
                    renewalDate.setMonth(renewalDate.getMonth() + 1);
                } else {
                    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
                }

                business.subscriptionRenewalDate = renewalDate;
                await business.save();
            } else {
                // No auto-renewal, mark as past_due
                business.subscriptionStatus = 'past_due';
                await business.save();

                if (subscription) {
                    subscription.status = 'past_due';
                    await subscription.save();
                }

                console.log(`Subscription past due for business: ${business.name} (${business._id})`);
                // TODO: Send email notification
            }
        }

        return dueForRenewal.length;
    } catch (error) {
        console.error('Error processing renewals:', error);
        throw error;
    }
};

/**
 * Get subscription statistics
 */
exports.getSubscriptionStats = async () => {
    try {
        const stats = await Business.aggregate([
            {
                $group: {
                    _id: {
                        tier: '$subscriptionTier',
                        status: '$subscriptionStatus'
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const formatted = {
            byTier: {},
            byStatus: {},
            total: 0
        };

        stats.forEach(stat => {
            const tier = stat._id.tier;
            const status = stat._id.status;
            const count = stat.count;

            if (!formatted.byTier[tier]) {
                formatted.byTier[tier] = 0;
            }
            if (!formatted.byStatus[status]) {
                formatted.byStatus[status] = 0;
            }

            formatted.byTier[tier] += count;
            formatted.byStatus[status] += count;
            formatted.total += count;
        });

        return formatted;
    } catch (error) {
        console.error('Error getting subscription stats:', error);
        throw error;
    }
};

module.exports = exports;

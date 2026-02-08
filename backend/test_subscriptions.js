/**
 * Test Script: Demonstrate Subscription Features
 * This script shows all the subscription features in action
 */

const mongoose = require('mongoose');
const Business = require('./models/Business');
const BusinessUser = require('./models/BusinessUser');
const subscriptionUtils = require('./utils/subscriptionUtils');
const subscriptionPlans = require('./config/subscriptionPlans');
require('dotenv').config();

async function demonstrateSubscriptionFeatures() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // ========================================
        // 1. Show all subscription plans
        // ========================================
        console.log('📋 SUBSCRIPTION PLANS');
        console.log('='.repeat(60));

        const plans = subscriptionPlans.getAllPlans();
        plans.forEach(plan => {
            console.log(`\n${plan.displayName} (${plan.tier})`);
            console.log(`  Price (NGN): ₦${plan.price.NGN.monthly / 100}/month`);
            console.log(`  Price (USD): $${plan.price.USD.monthly / 100}/month`);
            console.log(`  Features:`);
            console.log(`    - Respond to Reviews: ${plan.features.canRespondToReviews ? '✅' : '❌'}`);
            console.log(`    - Analytics: ${plan.features.canAccessAnalytics ? '✅' : '❌'}`);
            console.log(`    - Advanced Analytics: ${plan.features.canAccessAdvancedAnalytics ? '✅' : '❌'}`);
            console.log(`    - Featured Placement: ${plan.features.canBeFeatured ? '✅' : '❌'}`);
            console.log(`    - Max Locations: ${plan.features.maxLocations}`);
        });

        // ========================================
        // 2. Find a test business
        // ========================================
        console.log('\n\n📍 FINDING TEST BUSINESS');
        console.log('='.repeat(60));

        let testBusiness = await Business.findOne({ isClaimed: true }).limit(1);

        if (!testBusiness) {
            // Create a test business if none exist
            console.log('No claimed business found, using first available business...');
            testBusiness = await Business.findOne().limit(1);
        }

        if (!testBusiness) {
            console.log('❌ No businesses found in database');
            await mongoose.connection.close();
            return;
        }

        console.log(`\nTest Business: ${testBusiness.name}`);
        console.log(`Current Tier: ${testBusiness.subscriptionTier}`);
        console.log(`Current Status: ${testBusiness.subscriptionStatus}`);
        console.log(`Can Respond to Reviews: ${testBusiness.features?.canRespondToReviews ? '✅' : '❌'}`);

        // ========================================
        // 3. Start a free trial
        // ========================================
        console.log('\n\n🎁 STARTING FREE TRIAL');
        console.log('='.repeat(60));

        const updatedBusiness = await subscriptionUtils.startTrial(
            testBusiness._id,
            'verified',
            30
        );

        console.log(`\n✅ 30-day Verified trial started!`);
        console.log(`Business: ${updatedBusiness.name}`);
        console.log(`New Tier: ${updatedBusiness.subscriptionTier}`);
        console.log(`Status: ${updatedBusiness.subscriptionStatus}`);
        console.log(`Trial Ends: ${updatedBusiness.trialEndsAt}`);
        console.log(`\nFeatures Unlocked:`);
        console.log(`  - Respond to Reviews: ${updatedBusiness.features.canRespondToReviews ? '✅' : '❌'}`);
        console.log(`  - Analytics: ${updatedBusiness.features.canAccessAnalytics ? '✅' : '❌'}`);
        console.log(`  - Verified Badge: ${updatedBusiness.features.verifiedBadge ? '✅' : '❌'}`);

        // ========================================
        // 4. Check feature access
        // ========================================
        console.log('\n\n🔐 FEATURE ACCESS CHECK');
        console.log('='.repeat(60));

        const canRespond = subscriptionPlans.canAccessFeature(
            updatedBusiness.subscriptionTier,
            'canRespondToReviews'
        );

        const canAccessAdvanced = subscriptionPlans.canAccessFeature(
            updatedBusiness.subscriptionTier,
            'canAccessAdvancedAnalytics'
        );

        console.log(`\nCan respond to reviews: ${canRespond ? '✅ YES' : '❌ NO'}`);
        console.log(`Can access advanced analytics: ${canAccessAdvanced ? '✅ YES' : '❌ NO (requires Premium)'}`);

        // ========================================
        // 5. Get subscription statistics
        // ========================================
        console.log('\n\n📊 SUBSCRIPTION STATISTICS');
        console.log('='.repeat(60));

        const stats = await subscriptionUtils.getSubscriptionStats();

        console.log(`\nTotal Businesses: ${stats.total}`);
        console.log(`\nBy Tier:`);
        Object.entries(stats.byTier).forEach(([tier, count]) => {
            console.log(`  - ${tier}: ${count}`);
        });
        console.log(`\nBy Status:`);
        Object.entries(stats.byStatus).forEach(([status, count]) => {
            console.log(`  - ${status}: ${count}`);
        });

        // ========================================
        // 6. Simulate trial expiration check
        // ========================================
        console.log('\n\n⏰ TRIAL EXPIRATION CHECK');
        console.log('='.repeat(60));

        // Find trials that would expire (none should expire yet since we just started one)
        const trialsToExpire = await Business.find({
            isTrialing: true,
            trialEndsAt: { $lte: new Date() }
        });

        console.log(`\nTrials expiring today: ${trialsToExpire.length}`);

        if (trialsToExpire.length > 0) {
            console.log('Processing expired trials...');
            const processed = await subscriptionUtils.processExpiredTrials();
            console.log(`✅ Processed ${processed} expired trials`);
        } else {
            console.log('✅ No trials expiring today');
        }

        // ========================================
        // 7. Test cancellation (optional - commented out)
        // ========================================
        console.log('\n\n❌ CANCELLATION TEST (Skipped)');
        console.log('='.repeat(60));
        console.log('To test cancellation, uncomment the code below\n');

        /*
        console.log(`\nCancelling subscription for: ${updatedBusiness.name}`);
        const cancelledBusiness = await subscriptionUtils.cancelSubscription(
            updatedBusiness._id,
            'Testing cancellation flow'
        );
        
        console.log(`✅ Subscription cancelled`);
        console.log(`New Tier: ${cancelledBusiness.subscriptionTier}`);
        console.log(`Status: ${cancelledBusiness.subscriptionStatus}`);
        console.log(`Can Respond to Reviews: ${cancelledBusiness.features.canRespondToReviews ? '✅' : '❌'}`);
        */

        // ========================================
        // Summary
        // ========================================
        console.log('\n\n✅ DEMONSTRATION COMPLETE');
        console.log('='.repeat(60));
        console.log('\nKey Features Demonstrated:');
        console.log('  ✅ Subscription plans configuration');
        console.log('  ✅ Free trial activation (30 days)');
        console.log('  ✅ Feature gating and access control');
        console.log('  ✅ Subscription statistics');
        console.log('  ✅ Trial expiration checking');
        console.log('\nNext Steps:');
        console.log('  1. Test the API endpoints with Postman');
        console.log('  2. Integrate payment provider (Paystack)');
        console.log('  3. Build frontend pricing page');
        console.log('  4. Add email notifications');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed\n');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run demonstration
if (require.main === module) {
    demonstrateSubscriptionFeatures();
}

module.exports = demonstrateSubscriptionFeatures;

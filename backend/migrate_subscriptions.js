/**
 * Migration Script: Initialize Subscription Fields for Existing Businesses
 * Run this once to set up subscription data for all existing businesses
 */

const mongoose = require('mongoose');
const Business = require('./models/Business');
const subscriptionPlans = require('./config/subscriptionPlans');
require('dotenv').config();

async function migrateExistingBusinesses() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all businesses without subscription tier set
        const businesses = await Business.find({
            $or: [
                { subscriptionTier: { $exists: false } },
                { subscriptionTier: null }
            ]
        });

        console.log(`\n📊 Found ${businesses.length} businesses to migrate\n`);

        let migratedCount = 0;
        let claimedCount = 0;

        for (const business of businesses) {
            // Set default Basic tier
            const basicPlan = subscriptionPlans.basic;

            business.subscriptionTier = 'basic';
            business.subscriptionStatus = 'inactive';
            business.currency = 'NGN';
            business.features = { ...basicPlan.features };

            // If business is claimed, offer 90-day Verified trial
            if (business.isClaimed && business.owner) {
                console.log(`🎁 Granting 90-day Verified trial to: ${business.name}`);

                const verifiedPlan = subscriptionPlans.verified;
                const trialEndsAt = new Date();
                trialEndsAt.setDate(trialEndsAt.getDate() + 90);

                business.subscriptionTier = 'verified';
                business.subscriptionStatus = 'trialing';
                business.isTrialing = true;
                business.trialEndsAt = trialEndsAt;
                business.subscriptionStartDate = new Date();
                business.features = { ...verifiedPlan.features };

                claimedCount++;
            }

            await business.save();
            migratedCount++;
        }

        console.log('\n✅ Migration Complete!');
        console.log(`   - Total businesses migrated: ${migratedCount}`);
        console.log(`   - Claimed businesses with trial: ${claimedCount}`);
        console.log(`   - Basic tier businesses: ${migratedCount - claimedCount}\n`);

        // Show summary statistics
        const stats = await Business.aggregate([
            {
                $group: {
                    _id: {
                        tier: '$subscriptionTier',
                        status: '$subscriptionStatus'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.tier': 1, '_id.status': 1 }
            }
        ]);

        console.log('📊 Subscription Statistics:');
        stats.forEach(stat => {
            console.log(`   - ${stat._id.tier} (${stat._id.status}): ${stat.count}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');

    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
}

// Run migration
if (require.main === module) {
    migrateExistingBusinesses();
}

module.exports = migrateExistingBusinesses;

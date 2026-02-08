const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);

    const Business = require('../models/Business');
    const { getFeatures } = require('../config/subscriptionPlans');

    const premiumFeatures = getFeatures('premium');
    console.log('Premium features from config:', premiumFeatures);

    // Find all premium businesses and update them
    const businesses = await Business.find({ subscriptionTier: 'premium' });

    for (const business of businesses) {
        console.log('Updating business:', business.name);
        console.log('Before:', business.features);

        business.features = premiumFeatures;
        await business.save();

        // Verify
        const updated = await Business.findById(business._id);
        console.log('After:', updated.features);
    }

    // Also update verified tier businesses
    const verifiedFeatures = getFeatures('verified');
    const verifiedBusinesses = await Business.find({ subscriptionTier: 'verified' });

    for (const business of verifiedBusinesses) {
        console.log('Updating verified business:', business.name);
        business.features = verifiedFeatures;
        await business.save();
    }

    console.log('Done! Updated', businesses.length, 'premium and', verifiedBusinesses.length, 'verified businesses.');
    process.exit(0);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

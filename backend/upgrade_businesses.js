const mongoose = require('mongoose');
const Business = require('./models/Business');
require('dotenv').config();

const upgradeAllBusinesses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await Business.updateMany(
            {},
            { $set: { subscriptionTier: 'premium', isVerified: true } }
        );

        console.log(`✅ Upgraded ${result.modifiedCount} businesses to Premium tier.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

upgradeAllBusinesses();

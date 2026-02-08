const mongoose = require('mongoose');
require('dotenv').config();
const Business = require('./models/Business');
const BusinessUser = require('./models/BusinessUser');
const TierUpgradeRequest = require('./models/TierUpgradeRequest');

const forcePendingRequest = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'business@test.com';

        const user = await BusinessUser.findOne({ email });
        if (!user) {
            console.error('Test user not found');
            process.exit(1);
        }

        const business = await Business.findOne({ owner: user._id });
        if (!business) {
            console.error('Business not found for user');
            process.exit(1);
        }

        // Clear existing requests to be clean
        await TierUpgradeRequest.deleteMany({ business: business._id });
        console.log('Cleared existing requests');

        // Create a pending request
        // Using 'manual' or 'none' as it's likely a supported method based on common schema patterns if bank_transfer is invalid. 
        // Or if bank_transfer is valid but maybe checking case? 
        // I will use 'manual' which is often used for bank transfers, or just use 'none' if requestType is payment.
        // Actually, let's verify the model first.
        // Assuming 'manual' for now based on error log "bank_transfer is not valid".

        const request = await TierUpgradeRequest.create({
            business: business._id,
            businessUser: user._id,
            currentTier: business.subscriptionTier || 'basic',
            requestedTier: 'premium',
            requestType: 'payment',
            paymentMethod: 'manual', // Trying 'manual'
            amount: 500000,
            currency: 'NGN',
            billingCycle: 'annual',
            status: 'pending'
        });

        console.log('Created pending request:', request._id);
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

forcePendingRequest();

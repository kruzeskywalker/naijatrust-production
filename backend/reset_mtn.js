const mongoose = require('mongoose');
require('dotenv').config();
const Business = require('./models/Business');

const resetMTN = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await Business.updateOne(
            { name: "MTN Nigeria" },
            {
                $set: {
                    isVerified: false,
                    isClaimed: false,
                    claimStatus: 'unclaimed',
                    owner: null
                }
            }
        );

        if (result.matchedCount > 0) {
            console.log('Successfully reset MTN Nigeria to unverified/unclaimed.');
        } else {
            console.log('MTN Nigeria not found.');
        }

        process.exit();
    } catch (error) {
        console.error('Error resetting MTN:', error);
        process.exit(1);
    }
};

resetMTN();

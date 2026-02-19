require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/Business');

const MONGODB_URI = process.env.MONGODB_URI;

const approveNGOs = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        console.log('Updating NGOs to "approved" status...');

        const result = await Business.updateMany(
            {
                $or: [
                    { category: 'NGO' },
                    { categories: 'NGO' }
                ],
                status: { $ne: 'approved' }
            },
            { $set: { status: 'approved' } }
        );

        console.log(`Matched ${result.matchedCount} NGOs.`);
        console.log(`Modified ${result.modifiedCount} NGOs to approved.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

approveNGOs();

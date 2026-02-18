const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Business = require('../models/Business');

const migrate = async () => {
    try {
        console.log('Loading env from:', path.resolve(__dirname, '../.env'));
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        console.log('MONGO URI exists:', !!uri);

        if (!uri) {
            throw new Error('MONGODB_URI is undefined');
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Find businesses without a status field or with status null
        const result = await Business.updateMany(
            { status: { $exists: false } },
            { $set: { status: 'approved' } }
        );

        console.log(`Migration complete. Updated ${result.modifiedCount} businesses to 'approved' status.`);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();

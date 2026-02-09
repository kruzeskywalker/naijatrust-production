require('dotenv').config();
const mongoose = require('mongoose');
const BusinessUser = require('./models/BusinessUser');

async function activateAllBusinessUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await BusinessUser.updateMany(
            { isEmailVerified: false },
            { $set: { isEmailVerified: true, emailVerificationToken: undefined, emailVerificationExpires: undefined } }
        );

        console.log(`Updated ${result.modifiedCount} business users to verified status.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
}

activateAllBusinessUsers();

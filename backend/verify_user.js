const mongoose = require('mongoose');
require('dotenv').config();
const BusinessUser = require('./models/BusinessUser');

const verifyUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'mtn_manager3@mtn.com';
        const result = await BusinessUser.updateOne(
            { email: email },
            {
                $set: {
                    isEmailVerified: true,
                    emailVerificationToken: undefined,
                    emailVerificationExpires: undefined
                }
            }
        );

        if (result.matchedCount > 0) {
            console.log(`Successfully verified email for user: ${email}`);
        } else {
            console.log(`User not found: ${email}`);
        }

        process.exit();
    } catch (error) {
        console.error('Error verifying user:', error);
        process.exit(1);
    }
};

verifyUser();

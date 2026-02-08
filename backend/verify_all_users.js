const mongoose = require('mongoose');
const BusinessUser = require('./models/BusinessUser');
require('dotenv').config();

async function verifyAllUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find unverified users
        const unverifiedUsers = await BusinessUser.find({
            isEmailVerified: false
        }).select('name email createdAt');

        console.log('📋 UNVERIFIED USERS:');
        console.log('='.repeat(60));

        if (unverifiedUsers.length === 0) {
            console.log('✅ No unverified users found!');
        } else {
            console.log(`Found ${unverifiedUsers.length} unverified user(s):\n`);

            unverifiedUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Created: ${user.createdAt.toISOString().split('T')[0]}`);
            });

            // Verify all unverified users
            console.log(`\n\nVerifying all ${unverifiedUsers.length} user(s)...`);

            const result = await BusinessUser.updateMany(
                { isEmailVerified: false },
                {
                    $set: {
                        isEmailVerified: true,
                        emailVerificationToken: undefined,
                        emailVerificationExpires: undefined
                    }
                }
            );

            console.log(`\n✅ Verified ${result.modifiedCount} user(s)!`);
            console.log('\nThey can now claim or register businesses.');
        }

        await mongoose.connection.close();
        console.log('\n✅ Done!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyAllUsers();

const mongoose = require('mongoose');
require('dotenv').config();
const BusinessUser = require('./models/BusinessUser');
const Business = require('./models/Business');

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'business@test.com';
        const password = 'password123';

        let user = await BusinessUser.findOne({ email });
        if (!user) {
            user = await BusinessUser.create({
                name: 'Test Business User',
                email,
                password, // Schema handles hashing in pre-save
                businessEmail: email,
                phone: '08012345678',
                position: 'Owner',
                isEmailVerified: true,
                isAdminVerified: true
            });
            console.log('Created user:', user._id);
        } else {
            console.log('User exists:', user._id);
            // Ensure password is correct if user exists (hash match not checked here, but assumable for test env)
            // Or just update password to be sure?
            user.password = password;
            await user.save();
            console.log('User password updated');
        }

        const business = await Business.findOne({});
        if (business) {
            business.owner = user._id;
            // Also need to set claimedBy? Or is owner enough?
            // Let's set both to be safe or check business schema.
            business.claimedBy = user._id;
            business.isClaimed = true;
            await business.save();
            console.log('Assigned business:', business.name, 'to user:', user._id);
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createTestUser();

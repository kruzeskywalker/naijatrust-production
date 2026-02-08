const mongoose = require('mongoose');
const Business = require('./models/Business');
const BusinessUser = require('./models/BusinessUser');
const ClaimRequest = require('./models/ClaimRequest');
require('dotenv').config();

const testVisibility = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Create a dummy business user
        const userEmail = `visibility_test_${Date.now()}@example.com`;
        const user = await BusinessUser.create({
            name: 'Visibility Tester',
            email: userEmail,
            password: 'password123',
            isEmailVerified: true,
            phone: '08012345678',
            businessEmail: userEmail,
            companyName: 'Test Co',
            position: 'CEO'
        });
        console.log(`Created user: ${user._id}`);

        // 2. Create a dummy business (unclaimed)
        const business = await Business.create({
            name: `Visibility Biz ${Date.now()}`,
            category: 'Tech',
            categories: ['Tech'],
            location: 'Lagos',
            phone: '1234567890'
        });
        console.log(`Created business: ${business._id}`);

        // 3. Create a claim request
        const claim = await ClaimRequest.create({
            business: business._id,
            user: user._id,
            status: 'pending',
            phone: '08012345678',
            businessEmail: userEmail,
            position: 'CEO'
        });
        console.log(`Created claim: ${claim._id}`);

        // 4. ADMIN APPROVES IT (Simulating adminRoutes logic)
        // Update claim
        claim.status = 'approved';
        await claim.save();

        // Update Business ownership
        business.claimStatus = 'claimed';
        business.isClaimed = true;
        business.owner = user._id; // <--- The key link
        await business.save();
        console.log('Admin approved claim and updated business owner.');

        // 5. User checks dashboard (Simulate businessLink logic)
        const businesses = await Business.find({ owner: user._id });
        console.log(`User dashboard found ${businesses.length} businesses.`);

        if (businesses.length > 0 && businesses[0]._id.toString() === business._id.toString()) {
            console.log('SUCCESS: Business is visible to user.');
        } else {
            console.log('FAILURE: Business NOT found for user.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        mongoose.disconnect();
    }
};

testVisibility();

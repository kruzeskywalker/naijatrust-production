const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('MONGO_URI loaded:', !!process.env.MONGO_URI);
const mongoose = require('mongoose');
const Business = require('./models/Business');
const BusinessUser = require('./models/BusinessUser');
const ClaimRequest = require('./models/ClaimRequest');

async function debugClaims() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) throw new Error('No Mongo URI found in environment variables');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // 1. Create a dummy business user
        const user = await BusinessUser.create({
            name: 'Debug User',
            email: `debug_${Date.now()}@test.com`,
            password: 'password123',
            businessEmail: `info_${Date.now()}@biz.com`,
            phone: '1234567890',
            position: 'Owner',
            isEmailVerified: true
        });
        console.log('User created:', user._id);

        // 2. Create a business (as per register route)
        const business = await Business.create({
            name: `Debug Business ${Date.now()}`,
            category: 'Tech',
            location: 'Lagos',
            owner: user._id,
            claimStatus: 'pending',
            isVerified: false
        });
        console.log('Business created:', business._id, 'ClaimStatus:', business.claimStatus);

        // 3. Create Claim Request (as per register route)
        // Simulate missing documents array (undefined)
        const claim = await ClaimRequest.create({
            business: business._id,
            user: user._id,
            businessEmail: user.businessEmail,
            phone: user.phone,
            position: user.position,
            // Simulate null documents
            documents: null,
            additionalInfo: 'New Business Registration'
        });
        console.log('Claim Request created:', claim._id, 'Status:', claim.status);

        // 4. Query for pending claims (as per admin route)
        // Also query ALL claims for this user to see if it exists but different status
        const allUserClaims = await ClaimRequest.find({ user: user._id });
        console.log(`User has ${allUserClaims.length} total claims`);
        allUserClaims.forEach(c => console.log(`- Claim ${c._id}: status=${c.status}`));

        const pendingClaims = await ClaimRequest.find({ status: 'pending' })
            .populate('business', 'name')
            .populate('user', 'name');

        console.log(`Found ${pendingClaims.length} pending claims`);

        const found = pendingClaims.find(c => c._id.toString() === claim._id.toString());
        if (found) {
            console.log('✅ Success: The new claim was found in pending list.');
            console.log('Populated Business:', found.business ? found.business.name : 'NULL');
            console.log('Populated User:', found.user ? found.user.name : 'NULL');
        } else {
            console.error('❌ Error: The new claim was NOT found in pending list.');
        }

        // Cleanup
        await ClaimRequest.findByIdAndDelete(claim._id);
        await Business.findByIdAndDelete(business._id);
        await BusinessUser.findByIdAndDelete(user._id);

        process.exit(0);
    } catch (error) {
        console.error('Debug script error:', error);
        process.exit(1);
    }
}

debugClaims();

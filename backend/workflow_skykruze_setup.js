const mongoose = require('mongoose');
const Business = require('./models/Business');
const BusinessUser = require('./models/BusinessUser');
const ClaimRequest = require('./models/ClaimRequest');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const setupSkykruze = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔌 Connected to MongoDB');

        // 1. Cleanup existing data to avoid duplicates
        await Business.deleteOne({ name: 'Skykruze Limited' });
        await BusinessUser.deleteOne({ email: 'skykruze_manager@example.com' });
        // We might want to be careful deleting ClaimRequests if they are generic, but for now filtering by business email is safe enough or by user
        // We'll clean up claims linked to the user we are about to recreate
        // Ideally we'd do this later, but let's just proceed.

        console.log('🧹 Cleaned up existing Skykruze data');

        // 2. Create Business User
        // Note: Password will be hashed by the model's pre-save hook
        const manager = await BusinessUser.create({
            name: 'Skykruze Manager',
            email: 'skykruze_manager@example.com',
            password: 'Password123!',
            phone: '+234 809 555 1234',
            position: 'Operations Manager',
            companyName: 'Skykruze Limited',
            businessEmail: 'info@skykruze.com',
            isEmailVerified: true // Auto-verify email for test flow
        });
        console.log('✅ Created Business User: skykruze_manager@example.com');

        // 3. Create Pending Business
        const business = await Business.create({
            name: 'Skykruze Limited',
            category: 'IT Services',
            description: 'Top-tier IT consulting and software development firm delivering innovative digital solutions.',
            location: 'Lekki Phase 1, Lagos, Nigeria',
            website: 'https://www.skykruze.com',
            phone: '+44 7751 573029',
            email: 'info@skykruze.com',
            owner: manager._id,
            isVerified: false,
            claimStatus: 'pending',
            rating: 0,
            reviewCount: 0
        });
        console.log('✅ Created Business: Skykruze Limited (Pending)');

        // 4. Create Claim Request (so Admin sees it)
        const claim = await ClaimRequest.create({
            business: business._id,
            user: manager._id,
            businessEmail: 'info@skykruze.com',
            phone: '+44 7751 573029',
            position: 'Operations Manager',
            status: 'pending',
            documents: [{
                type: 'business_license',
                url: 'incorporation_cert.pdf'
            }], // Mock doc
            additionalInfo: 'Please verify our business.'
        });
        console.log('✅ Created Claim Request');

        console.log('\n--- SETUP COMPLETE ---');
        process.exit();
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
};

setupSkykruze();

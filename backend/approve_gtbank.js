require('dotenv').config();
const mongoose = require('mongoose');
const Claim = require('./models/ClaimRequest');
const Business = require('./models/Business');
const BusinessUser = require('./models/BusinessUser');
const AdminUser = require('./models/AdminUser');
const bcrypt = require('bcryptjs');

const approveGTBankClaim = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Fix admin password
        const admin = await AdminUser.findOne({ email: 'admin@naijatrust.com' });
        if (admin) {
            // Force update the password
            admin.password = await bcrypt.hash('admin123', 10);
            await admin.save();
            console.log('✓ Admin password reset to: admin123');
        }

        // 2. Find pending GTBank claim
        const gtbankClaim = await Claim.findOne({
            businessEmail: 'contact@gtbank.com',
            status: 'pending'
        }).populate('business').populate('user');

        if (!gtbankClaim) {
            console.log('✗ No pending GTBank claim found');
            console.log('Checking all claims...');
            const allClaims = await Claim.find({}).populate('business');
            console.log(`Found ${allClaims.length} total claims:`);
            allClaims.forEach(claim => {
                console.log(`- ${claim.business?.name || 'Unknown'}: ${claim.status}`);
            });
            process.exit();
            return;
        }

        console.log(`\n✓ Found pending GTBank claim:`);
        console.log(`  Claim ID: ${gtbankClaim._id}`);
        console.log(`  Business: ${gtbankClaim.business.name}`);
        console.log(`  Claimer: ${gtbankClaim.user.name}`);

        // 3. Approve the claim
        gtbankClaim.status = 'approved';
        gtbankClaim.reviewedBy = admin._id;
        gtbankClaim.reviewedAt = new Date();
        await gtbankClaim.save();

        // 4. Update business verification
        const business = await Business.findById(gtbankClaim.business._id);
        business.isVerified = true;
        business.verifiedBy = admin._id;
        business.verifiedAt = new Date();
        business.claimedBy = gtbankClaim.user._id;
        await business.save();

        console.log('\n✓ GTBank claim approved successfully!');
        console.log('✓ GTBank is now VERIFIED');
        console.log('\nVerification details:');
        console.log(`  Business: ${business.name}`);
        console.log(`  Verified: ${business.isVerified}`);
        console.log(`  Verified At: ${business.verifiedAt}`);
        console.log(`  Claimed By: ${gtbankClaim.user.name}`);

        console.log('\n✓ You can now:');
        console.log('1. Check business dashboard - GTBank should show as "Approved" and "Verified"');
        console.log('2. Search for GTBank - should display verified badge (teal shield)');
        console.log('3. View GTBank profile - should show verified badge');
        console.log('4. Login as admin with: admin@naijatrust.com / admin123');

        process.exit();
    } catch (error) {
        console.error('Error approving GTBank claim:', error);
        process.exit(1);
    }
};

approveGTBankClaim();

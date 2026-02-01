const mongoose = require('mongoose');
const Business = require('./models/Business');
const BusinessUser = require('./models/BusinessUser');
const Review = require('./models/Review');
const User = require('./models/User');
require('dotenv').config();

const diagnose = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔌 Connected to MongoDB');

        // 1. Find the Business User
        const bizUser = await BusinessUser.findOne({ email: 'skykruze_manager@example.com' });
        if (!bizUser) {
            console.error('❌ Business User not found!');
        } else {
            console.log(`✅ Business User found: ${bizUser._id} (${bizUser.email})`);
        }

        // 2. Find the Business
        const business = await Business.findOne({ name: 'Skykruze Limited' });
        if (!business) {
            console.error('❌ Business "Skykruze Limited" not found!');
        } else {
            console.log(`✅ Business found: ${business._id}`);
            console.log(`   - Owner: ${business.owner}`);
            console.log(`   - Verified: ${business.isVerified}`);
            console.log(`   - ClaimStatus: ${business.claimStatus}`);

            if (bizUser && business.owner && business.owner.toString() === bizUser._id.toString()) {
                console.log('✅ Owner Link: MATCH');
            } else {
                console.log('❌ Owner Link: MISMATCH or MISSING');
            }
        }

        // 3. Find Reviews
        if (business) {
            const reviews = await Review.find({ business: business._id });
            console.log(`\n🔎 Reviews found: ${reviews.length}`);

            reviews.forEach(rev => {
                console.log(`   - Review: "${rev.title}" by User ${rev.user}`);
                console.log(`     Replies: ${rev.replies.length}`);
                rev.replies.forEach(rep => {
                    console.log(`       - Reply: "${rep.content}"`);
                    console.log(`         isBusiness: ${rep.isBusiness}`);
                    console.log(`         User: ${rep.user}`);
                    if (bizUser && rep.user && rep.user.toString() === bizUser._id.toString()) {
                        console.log('         ✅ Reply Author Link: MATCH');
                    } else {
                        console.log('         ⚠️ Reply Author Link: MISMATCH');
                    }
                });
            });
        }

        process.exit();
    } catch (error) {
        console.error('Diagnostic failed:', error);
        process.exit(1);
    }
};

diagnose();

const mongoose = require('mongoose');
const Business = require('../models/Business');

const verify = async () => {
    try {
        const uri = 'mongodb+srv://naijatrust_admin:ahT3iqd5irHzc74x@cluster0.ujohwdp.mongodb.net/naijatrust?retryWrites=true&w=majority&appName=Cluster0';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // 1. Create a pending business
        const testBusiness = await Business.create({
            name: 'Test Verify Business Approval',
            location: 'Lagos',
            category: 'Technology',
            phone: '08012345678',
            status: 'pending' // As if created via portal
        });
        console.log(`Created pending business: ${testBusiness._id}`);

        // 2. Check public visibility (should be hidden)
        const visibleBefore = await Business.findOne({
            _id: testBusiness._id,
            status: 'approved'
        });

        if (visibleBefore) {
            console.error('FAIL: Pending business is visible incorrectly!');
        } else {
            console.log('PASS: Pending business is NOT visible.');
        }

        // 3. Admin approves business
        testBusiness.status = 'approved';
        await testBusiness.save();
        console.log('Admin approved business.');

        // 4. Check public visibility (should be visible)
        const visibleAfter = await Business.findOne({
            _id: testBusiness._id,
            status: 'approved'
        });

        if (visibleAfter) {
            console.log('PASS: Approved business is visible.');
        } else {
            console.error('FAIL: Approved business is NOT visible!');
        }

        // Cleanup
        await Business.deleteOne({ _id: testBusiness._id });
        console.log('Cleanup complete.');

        process.exit(0);

    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verify();

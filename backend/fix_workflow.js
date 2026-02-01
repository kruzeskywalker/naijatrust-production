require('dotenv').config();
const mongoose = require('mongoose');
const BusinessUser = require('./models/BusinessUser');
const AdminUser = require('./models/AdminUser');
const bcrypt = require('bcryptjs');

const fixWorkflowBlockers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Verify the GTBank manager email
        const gtbankManager = await BusinessUser.findOne({ email: 'gtbank_manager@example.com' });
        if (gtbankManager) {
            gtbankManager.isEmailVerified = true;
            await gtbankManager.save();
            console.log('✓ Verified email for gtbank_manager@example.com');
        } else {
            console.log('✗ GTBank manager not found');
        }

        // 2. Reset admin password to 'admin123'
        const admin = await AdminUser.findOne({ email: 'admin@naijatrust.com' });
        if (admin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            admin.password = hashedPassword;
            await admin.save();
            console.log('✓ Reset admin password to: admin123');
            console.log('  Email: admin@naijatrust.com');
        } else {
            console.log('✗ Admin user not found, creating new admin...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await AdminUser.create({
                name: 'Admin User',
                email: 'admin@naijatrust.com',
                password: hashedPassword
            });
            console.log('✓ Created new admin user');
            console.log('  Email: admin@naijatrust.com');
            console.log('  Password: admin123');
        }

        console.log('\n✓ All workflow blockers resolved!');
        console.log('\nYou can now:');
        console.log('1. Login as gtbank_manager@example.com (email verified)');
        console.log('2. Claim GTBank business');
        console.log('3. Login as admin@naijatrust.com / admin123');
        console.log('4. Approve the GTBank claim');

        process.exit();
    } catch (error) {
        console.error('Error fixing workflow blockers:', error);
        process.exit(1);
    }
};

fixWorkflowBlockers();

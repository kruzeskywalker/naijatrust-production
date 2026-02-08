const mongoose = require('mongoose');
const AdminUser = require('./models/AdminUser');
require('dotenv').config();

const createInitialAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const existingAdmin = await AdminUser.findOne({ email: 'admin@naijatrust.com' });
        if (existingAdmin) {
            console.log('Admin user already exists. Updating password...');
            existingAdmin.password = 'adminPassword123!';
            await existingAdmin.save();
            console.log('✅ Admin password updated to: adminPassword123!');
            process.exit(0);
        }

        const admin = new AdminUser({
            name: 'System Admin',
            email: 'admin@naijatrust.com',
            password: 'adminPassword123!', // Strong password for dev
            role: 'super_admin',
            permissions: ['approve_claims', 'reject_claims', 'manage_businesses', 'manage_users', 'view_analytics', 'manage_admins']
        });

        await admin.save();
        console.log('✅ Initial admin created successfully');
        console.log('Email: admin@naijatrust.com');
        console.log('Password: adminPassword123!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createInitialAdmin();

const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
require('dotenv').config();

const createSuperAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI not found in .env');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'admin@skykruze.ng';
        const name = 'Super Admin';
        const password = 'Jumcent17!';

        const existingAdmin = await AdminUser.findOne({ email });
        if (existingAdmin) {
            console.log(`⚠️ Admin with email ${email} already exists. Updating password and role...`);
            existingAdmin.password = password;
            existingAdmin.role = 'super_admin';
            existingAdmin.permissions = [
                'review_claims',
                'approve_claims',
                'reject_claims',
                'manage_businesses',
                'manage_users',
                'view_analytics',
                'manage_admins'
            ];
            await existingAdmin.save();
            console.log('✅ Admin updated successfully');
        } else {
            const admin = new AdminUser({
                name,
                email,
                password,
                role: 'super_admin',
                permissions: [
                    'review_claims',
                    'approve_claims',
                    'reject_claims',
                    'manage_businesses',
                    'manage_users',
                    'view_analytics',
                    'manage_admins'
                ]
            });

            await admin.save();
            console.log('✅ Super admin created successfully');
            console.log('Email:', email);
            console.log('Role: super_admin');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error);
        process.exit(1);
    }
};

createSuperAdmin();

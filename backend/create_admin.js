const mongoose = require('mongoose');
const AdminUser = require('./models/AdminUser');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admin = await AdminUser.create({
            name: 'New Admin',
            email: 'newadmin@naijatrust.com',
            password: 'password123',
            role: 'super_admin',
            permissions: ['manage_admins', 'review_claims', 'manage_businesses'],
            isActive: true
        });
        console.log('Admin created:', admin.email);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();

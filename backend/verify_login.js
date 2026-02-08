const mongoose = require('mongoose');
const AdminUser = require('./models/AdminUser');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const verifyLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@naijatrust.com';
        const password = 'adminPassword123!';

        const admin = await AdminUser.findOne({ email });
        if (!admin) {
            console.log('❌ Admin user not found with email:', email);
            const allAdmins = await AdminUser.find({});
            console.log('Available admins:', allAdmins.map(a => a.email));
            process.exit(1);
        }

        console.log('✅ Admin user found:', admin.email);
        console.log('Stored hashed password:', admin.password);

        const isMatch = await bcrypt.compare(password, admin.password);
        if (isMatch) {
            console.log('✅ Password match successful!');
        } else {
            console.log('❌ Password match FAILED.');
            // Test if it matches the other common password
            const isMatchOld = await bcrypt.compare('admin123', admin.password);
            if (isMatchOld) {
                console.log('⚠️  But it matches "admin123"!');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyLogin();

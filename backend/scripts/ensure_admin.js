const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const ensureAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@naijatrust.com';
        const admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log('Admin already exists.');
            // Reset password just in case
            admin.password = await bcrypt.hash('admin123', 10);
            await admin.save();
            console.log('Admin password reset to: admin123');
        } else {
            console.log('Creating new admin...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff'
            });
            console.log('Admin created successfully.');
        }

        console.log('Credentials: admin@naijatrust.com / admin123');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

ensureAdmin();

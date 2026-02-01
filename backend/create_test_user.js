const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createStandardUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔌 Connected to MongoDB');

        // Cleanup
        await User.deleteOne({ email: 'test_user_sky@example.com' });
        console.log('🧹 Cleaned up existing test user');

        // Create User
        // Note: User model usually hashes password via pre-save hook too. 
        // Let's check if we need to hash manually or not. 
        // Based on authRoutes.js: const newUser = await User.create({...}); uses pre-save.
        // So we pass plain password.

        const user = await User.create({
            name: 'Test User Sky',
            email: 'test_user_sky@example.com',
            password: 'Password123!',
            isVerified: true
        });

        console.log('✅ Created Standard User: test_user_sky@example.com');
        process.exit();
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
};

createStandardUser();

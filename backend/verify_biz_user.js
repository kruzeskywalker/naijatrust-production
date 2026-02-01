const mongoose = require('mongoose');
const BusinessUser = require('./models/BusinessUser');
require('dotenv').config();

const verifyUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await BusinessUser.findOne({ email: 'bizowner@test.com' });
        if (user) {
            user.isEmailVerified = true;
            await user.save();
            console.log('User verified');
        } else {
            console.log('User not found');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyUser();

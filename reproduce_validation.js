const mongoose = require('mongoose');
const Business = require('./backend/models/Business');
require('dotenv').config({ path: 'backend/.env' });

const testValidation = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        console.log('Attempting to create business with only categories...');
        const doc = new Business({
            name: 'Test Validation Biz',
            categories: ['Tech', 'Finance'],
            location: 'Lagos',
            phone: '123',
            // category is omitted
        });

        await doc.validate();
        console.log('Validation passed!');
    } catch (error) {
        console.error('Validation failed:', error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`Field ${key}: ${error.errors[key].message}`);
            });
        }
    } finally {
        mongoose.disconnect();
    }
};

testValidation();

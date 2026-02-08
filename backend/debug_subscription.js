const mongoose = require('mongoose');
require('dotenv').config();
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5001/api';
const BusinessUser = require('./models/BusinessUser');
const Business = require('./models/Business');

async function debugSubscription() {
    let fetch;
    try {
        fetch = (await import('node-fetch')).default;
    } catch (e) {
        console.log('Using global fetch');
        fetch = global.fetch;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // 1. Get IDs from DB
        const user = await BusinessUser.findOne({ email: 'business@test.com' });
        if (!user) throw new Error('User not found');

        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/business-auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'business@test.com',
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.data.token;

        console.log('Fetching subscription...');
        const subRes = await fetch(`${API_URL}/subscriptions/my-subscription`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const subData = await subRes.json();
        console.log('Subscription Data:', JSON.stringify(subData, null, 2));

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugSubscription();

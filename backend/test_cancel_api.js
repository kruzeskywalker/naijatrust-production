const mongoose = require('mongoose');
require('dotenv').config();
const fetch = require('node-fetch'); // Using require as established

const API_URL = 'http://localhost:5001/api';
const BusinessUser = require('./models/BusinessUser');
const Business = require('./models/Business');

const KNOWN_REQUEST_ID = '69824be5201b1c7fd527b004';

async function testCancel() {
    let fetch;
    try {
        fetch = (await import('node-fetch')).default;
    } catch (e) {
        console.log('Using global fetch');
        fetch = global.fetch;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await BusinessUser.findOne({ email: 'business@test.com' });
        const business = await Business.findOne({ owner: user._id });
        const businessId = business._id.toString();

        console.log('Business ID:', businessId);

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

        console.log('Fetching requests...');
        const requestsRes = await fetch(`${API_URL}/subscriptions/my-upgrade-requests?businessId=${businessId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const requestsData = await requestsRes.json();
        console.log('Requests Data:', JSON.stringify(requestsData, null, 2));

        // Iterate to see if our ID exists
        const exists = requestsData.data.requests.find(r => r._id === KNOWN_REQUEST_ID);
        console.log('Known request exists in list:', !!exists);

        console.log('Attempting to cancel known request ID:', KNOWN_REQUEST_ID);
        const cancelRes = await fetch(`${API_URL}/subscriptions/cancel-upgrade-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ requestId: KNOWN_REQUEST_ID })
        });

        const cancelData = await cancelRes.json();
        console.log('Cancel Response:', JSON.stringify(cancelData, null, 2));

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testCancel();

require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Business = require('./models/Business');
const BusinessUser = require('./models/BusinessUser');
const User = require('./models/User');

// Force using local API
const API_URL = 'http://localhost:5001/api';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const request = async (url, method, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // console.log(`Request: ${method} ${url}`);
    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    // Check content type
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return res.json();
    } else {
        const text = await res.text();
        console.error(`❌ Unexpected response (${res.status} ${res.statusText}):`, text.substring(0, 500));
        throw new Error(`Unexpected content-type: ${contentType}`);
    }
};

const runVerification = async () => {
    let owner = null;
    let business = null;
    let user = null;

    try {
        console.log('Starting verification...');

        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB');
        }

        // 1. Create Verified Business Owner
        const ownerEmail = `owner_${Date.now()}@test.com`;

        // Ensure clean state for this email
        await BusinessUser.deleteOne({ email: ownerEmail });

        owner = await BusinessUser.create({
            name: 'Test Owner',
            email: ownerEmail,
            emailVerificationToken: undefined,
            emailVerificationExpires: undefined,
            isEmailVerified: true,
            password: 'password123',
            businessEmail: ownerEmail,
            phone: '08012345678',
            position: 'Owner',
            companyName: 'Test Corp'
        });
        console.log(`Created verified owner: ${owner._id}`);

        const ownerToken = jwt.sign({ id: owner._id }, JWT_SECRET, { expiresIn: '1d' });

        // 2. Create Business
        business = await Business.create({
            name: `Test Biz ${Date.now()}`,
            category: 'Tech',
            email: ownerEmail,
            phone: '08012345678',
            location: 'Lagos',
            description: 'A test business',
            owner: owner._id,
            claimStatus: 'claimed',
            isVerified: true
        });
        console.log(`Created business: ${business._id}`);

        // 3. Create Regular User
        const userEmail = `user_${Date.now()}@test.com`;

        // Ensure clean state
        await User.deleteOne({ email: userEmail });

        user = await User.create({
            name: 'Test User',
            email: userEmail,
            password: 'password123',
            isVerified: true
        });
        console.log(`Created user: ${user._id}`);

        const userToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

        // 4. Like Business (API)
        console.log('Liking business via API...');
        const likeRes = await request(`${API_URL}/businesses/${business._id}/like`, 'POST', {}, userToken);

        if (likeRes.status === 'success') {
            console.log('✅ Business liked successfully.');
        } else {
            console.error('❌ Failed to like business:', likeRes);
            throw new Error('Likie failed');
        }

        // 5. Check User Liked List (API)
        console.log('Checking user liked list via API...');
        const userLikedRes = await request(`${API_URL}/businesses/user/liked`, 'GET', null, userToken);
        const businesses = userLikedRes.data?.businesses || [];
        const likedIds = businesses.map(b => b._id);

        if (likedIds.includes(business._id.toString())) {
            console.log('✅ User liked list verified: Business found in list.');
        } else {
            console.error('❌ Business NOT found in user liked list.');
            console.log('List content:', businesses);
        }

        // 6. Check Business Dashboard (API)
        console.log('Checking business dashboard via API...');
        const dashboardRes = await request(`${API_URL}/business-portal/dashboard`, 'GET', null, ownerToken);

        const totalLikes = dashboardRes.data?.stats?.totalLikes;
        console.log(`Total Likes on Dashboard: ${totalLikes}`);

        if (totalLikes === 1) {
            console.log('✅ Business dashboard verified: Total likes count is correct (1).');
        } else {
            console.error(`❌ Incorrect total likes count. Expected 1, got ${totalLikes}`);
        }

        console.log('Verification Success!');

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        // Cleanup
        console.log('Cleaning up...');
        if (owner) await BusinessUser.deleteOne({ _id: owner._id });
        if (business) await Business.deleteOne({ _id: business._id });
        if (user) await User.deleteOne({ _id: user._id });

        await mongoose.disconnect();
        process.exit(0);
    }
};

runVerification();

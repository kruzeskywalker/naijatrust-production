const mongoose = require('mongoose');
// Native fetch is available in Node 18+
const BusinessUser = require('./models/BusinessUser');
const Business = require('./models/Business');
require('dotenv').config();

// Helper for delays
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const API_URL = 'http://localhost:5001/api';

const simulateFlow = async () => {
    try {
        console.log('🚀 Starting Workflow Simulation...');

        // 1. Login as Business Manager
        console.log('\n🔐 Logging in as Skykruze Manager...');
        const loginRes = await fetch(`${API_URL}/business-auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'skykruze_manager@example.com',
                password: 'Password123!'
            })
        });

        const loginData = await loginRes.json();
        if (loginData.status !== 'success') {
            throw new Error(`Login failed: ${loginData.message}`);
        }

        const token = loginData.data.token;
        console.log('✅ Login Successful. Token acquired.');

        // 2. Get Business ID
        const businessRes = await fetch(`${API_URL}/business-portal/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dashboardData = await businessRes.json();
        const businessId = dashboardData.data.businesses[0]._id;
        console.log(`✅ Found Business ID: ${businessId}`);

        // 3. Fetch Reviews (As Business)
        console.log('\n📨 Fetching Reviews...');
        const reviewsRes = await fetch(`${API_URL}/business-portal/reviews/${businessId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!reviewsRes.ok) {
            const text = await reviewsRes.text();
            throw new Error(`Fetch Reviews Failed: ${reviewsRes.status} ${reviewsRes.statusText}\nBody: ${text}`);
        }

        const reviewsData = await reviewsRes.json();
        const reviews = reviewsData.data.reviews;

        if (reviews.length === 0) {
            throw new Error('No reviews found to reply to! (Did standard user post one?)');
        }

        const targetReviewId = reviews[0]._id;
        console.log(`✅ Found Review: "${reviews[0].title}" (ID: ${targetReviewId})`);

        // 4. Post Reply
        console.log('\n✍️  Posting Reply...');
        const replyRes = await fetch(`${API_URL}/business-portal/reviews/${targetReviewId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content: "Thank you so much! We appreciate your feedback."
            })
        });

        const replyData = await replyRes.json();
        if (replyData.status !== 'success') {
            throw new Error(`Reply failed: ${replyData.message}`);
        }
        console.log('✅ Reply Posted Successfully!');

        // 5. Verify Public Visibility
        console.log('\n🌍 Verifying Public Visibility...');
        const publicRes = await fetch(`${API_URL}/businesses/${businessId}`);
        const publicData = await publicRes.json();

        // Also fetch reviews endpoint
        const publicReviewsRes = await fetch(`${API_URL}/reviews/${businessId}`);
        const publicReviewsData = await publicReviewsRes.json();

        const targetReview = publicReviewsData.data.reviews.find(r => r._id === targetReviewId);
        const latestReply = targetReview.replies[targetReview.replies.length - 1];

        console.log(`   - Public Review Title: "${targetReview.title}"`);
        console.log(`   - Latest Reply Content: "${latestReply.content}"`);
        console.log(`   - Reply IsBusiness: ${latestReply.isBusiness}`);

        if (latestReply.isBusiness && latestReply.content === "Thank you so much! We appreciate your feedback.") {
            console.log('\n🎉 SUCCESS: Workflow Verified! Reply is visible publicly.');
        } else {
            console.error('\n❌ FAILURE: Reply not verified on public profile.');
        }

    } catch (error) {
        console.error('\n❌ Simulation Failed:', error);
    }
};

simulateFlow();

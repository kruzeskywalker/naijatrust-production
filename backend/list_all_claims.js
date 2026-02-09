const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const ClaimRequest = require('./models/ClaimRequest');
const Business = require('./models/Business');

async function listAll() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) throw new Error('No Mongo URI found');
        await mongoose.connect(uri);
        console.log('Connected.');

        console.log('--- ALL CLAIM REQUESTS ---');
        const claims = await ClaimRequest.find().sort({ submittedAt: -1 }).limit(20);
        console.log(`Total Claims in DB: ${await ClaimRequest.countDocuments()}`);
        claims.forEach(c => {
            console.log(`ID: ${c._id}, Status: ${c.status}, User: ${c.user}, Biz: ${c.business}, Info: ${c.additionalInfo}`);
        });

        console.log('\n--- RECENT BUSINESSES (Pending Claims) ---');
        const businesses = await Business.find({ claimStatus: 'pending' }).sort({ createdAt: -1 }).limit(10);
        console.log(`Total Pending Businesses: ${await Business.countDocuments({ claimStatus: 'pending' })}`);
        businesses.forEach(b => {
            console.log(`ID: ${b._id}, Name: ${b.name}, ClaimStatus: ${b.claimStatus}, Owner: ${b.owner}`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listAll();

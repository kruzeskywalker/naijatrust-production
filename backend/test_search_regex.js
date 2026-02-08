const mongoose = require('mongoose');
const Business = require('./models/Business');
require('dotenv').config();

const verifyRegexSearch = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const searchTerm = "Ze";
        console.log(`\n--- Testing Regex Search for "${searchTerm}" (Simulating API) ---`);

        const q = searchTerm;
        const businesses = await Business.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ],
            claimStatus: { $ne: 'claimed' }
        }).select('name');

        if (businesses.length > 0) {
            console.log(`SUCCESS: Found ${businesses.length} matches.`);
            businesses.forEach(b => console.log(`- ${b.name}`));
        } else {
            console.log('FAILURE: No matches found.');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        mongoose.disconnect();
    }
};

verifyRegexSearch();

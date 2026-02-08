const mongoose = require('mongoose');
const Business = require('./models/Business');
require('dotenv').config();

const debugSearch = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Check Indexes
        const indexes = await Business.collection.indexes();
        console.log('--- Indexes ---');
        console.log(JSON.stringify(indexes, null, 2));

        // 2. Test Text Search
        const searchTerm = "Zenith"; // Known existing business
        console.log(`\n--- Testing Search for "${searchTerm}" ---`);
        const textResults = await Business.find(
            { $text: { $search: searchTerm } },
            { score: { $meta: "textScore" } }
        );
        console.log(`Found ${textResults.length} matches via $text search.`);
        textResults.forEach(b => console.log(`- ${b.name} (Score: ${b._doc.score})`));

        // 3. Test Regex Search (Alternative)
        console.log(`\n--- Testing Regex for "${searchTerm}" ---`);
        const regexResults = await Business.find({
            name: { $regex: searchTerm, $options: 'i' }
        });
        console.log(`Found ${regexResults.length} matches via regex.`);

    } catch (error) {
        console.error('Debug failed:', error);
    } finally {
        mongoose.disconnect();
    }
};

debugSearch();

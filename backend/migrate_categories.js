require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/Business');

const migrateCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const businesses = await Business.find({});
        console.log(`Found ${businesses.length} businesses to migrate.`);

        for (const business of businesses) {
            // If categories is empty but category exists
            if ((!business.categories || business.categories.length === 0) && business.category) {
                business.categories = [business.category];
                await business.save();
                console.log(`Migrated: ${business.name} -> [${business.category}]`);
            }
        }

        console.log('Migration complete.');
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateCategories();

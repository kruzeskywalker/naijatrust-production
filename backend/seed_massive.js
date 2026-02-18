require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/Business');

// Configuration
const TARGET_PER_CATEGORY = 50; // 50 * 20 = 1000 businesses
const LOCATIONS = [
    'Lagos, Lagos State', 'Ikeja, Lagos', 'Lekki, Lagos', 'Victoria Island, Lagos', 'Yaba, Lagos', 'Surulere, Lagos',
    'Abuja, FCT', 'Wuse 2, Abuja', 'Garki, Abuja', 'Maitama, Abuja',
    'Port Harcourt, Rivers', 'Ibadan, Oyo', 'Kano, Kano', 'Enugu, Enugu',
    'Asaba, Delta', 'Benin City, Edo', 'Calabar, Cross River', 'Jos, Plateau',
    'Kaduna, Kaduna', 'Abeokuta, Ogun'
];

const CATEGORIES = [
    'Agriculture', 'Automobiles', 'Banks', 'Ecommerce', 'Education',
    'Energy', 'Fintech', 'Food & Drink', 'Health', 'Hospitality',
    'Insurance', 'IT Services', 'Jobs', 'Legal Services', 'Logistics',
    'Media', 'Real Estate', 'Telecom', 'Travel & Hotels', 'Other'
];

const TIERS = ['basic', 'verified', 'premium', 'enterprise'];
const TIER_WEIGHTS = [0.6, 0.25, 0.1, 0.05]; // 60% Basic, 25% Verified, 10% Premium, 5% Enterprise

// Data Pools for Generation
const ADJECTIVES = [
    'Premier', 'Global', 'Royal', 'Dynamic', 'Elite', 'Innovative', 'Trusted', 'Reliable', 'Modern', 'Future',
    'Smart', 'Green', 'Golden', 'Silver', 'Blue', 'Red', 'Star', 'Prime', 'First', 'Best',
    'Rapid', 'Swift', 'Metro', 'Urban', 'National', 'International', 'African', 'Nigerian', 'Lagos', 'Capital',
    'Unique', 'Advanced', 'Strategic', 'Creative', 'Digital', 'Tech', 'Mega', 'Hyper', 'Super', 'Ultra'
];

const NOUNS = [
    'Solutions', 'Ventures', 'Enterprises', 'Group', 'Limited', 'Global', 'Services', 'Systems', 'Holdings', 'Partners',
    'Consulting', 'Technologies', 'Industries', 'Works', 'Hub', 'Connect', 'Link', 'Network', 'Point', 'Center',
    'Agency', 'Associates', 'Construct', 'Designs', 'Concept', 'Idea', 'Vision', 'Focus', 'Impact', 'Synergy',
    'Trust', 'Capital', 'Investments', 'Resources', 'Logistics', 'Motors', 'Foods', 'Farms', 'Health', 'Care'
];

const DESCRIPTIONS = [
    "Leading provider of quality services in Nigeria.",
    "Committed to excellence and customer satisfaction.",
    "Your number one choice for professional solutions.",
    "delivering innovative products for the modern world.",
    "Setting the standard for quality and reliability.",
    "Experience the difference with our premium services.",
    "Trusted by thousands of customers across the nation.",
    "Building a better future with sustainable practices.",
    "Where quality meets affordability.",
    "Providing top-notch services tailored to your needs."
];

// Helper Functions
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generatePhone = () => `080${Math.floor(Math.random() * 90000000 + 10000000)}`;

const generateRating = () => (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0

const getWeightedTier = () => 'basic';

const generateBusiness = (category, existingNames) => {
    let name;
    let attempts = 0;

    // Generate unique name
    do {
        const adj = getRandom(ADJECTIVES);
        const noun = getRandom(NOUNS);
        // Sometimes add category specific suffix
        const suffix = Math.random() > 0.7 ? ` ${category}` : '';
        name = `${adj} ${noun}${suffix}`;
        attempts++;
    } while (existingNames.has(name) && attempts < 50);

    if (existingNames.has(name)) {
        name = `${name} ${Math.floor(Math.random() * 1000)}`;
    }
    existingNames.add(name);

    const tier = 'basic';
    const isVerified = Math.random() > 0.8; // 20% chance of being verified even on basic tier, just for visual variety
    const location = getRandom(LOCATIONS);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return {
        name: name,
        category: category, // Deprecated field, keeping for compatibility
        categories: [category], // New array field
        location: location,
        description: `${name} is a ${getRandom(DESCRIPTIONS).toLowerCase()} We specialize in ${category.toLowerCase()} services.`,
        website: `https://www.${slug}.com.ng`,
        phone: generatePhone(),
        email: `info@${slug}.com.ng`,
        rating: parseFloat(generateRating()),
        reviewCount: Math.floor(Math.random() * 100),
        isVerified: isVerified,
        status: 'approved',
        subscriptionTier: tier,
        subscriptionStatus: tier === 'basic' ? 'inactive' : 'active',
        viewCount: Math.floor(Math.random() * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
    };
};

async function seedMassive() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is undefined. Check your .env file.');
            process.exit(1);
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        // 1. Identify businesses to keep (those with owners)
        console.log('🔍 Scanning for existing businesses with owners...');
        const businessesWithOwners = await Business.find({
            owner: { $exists: true, $ne: null }
        });

        const keptIds = businessesWithOwners.map(b => b._id);
        console.log(`🛡️ Found ${businessesWithOwners.length} businesses with owners. These will be PRESERVED.`);

        // 2. Delete businesses without owners
        console.log('🗑️ Clearing businesses without owners...');
        const deleteResult = await Business.deleteMany({
            owner: { $exists: false } // Or $eq: null which isn't standard but specific queries can vary. Safest is checking existence/null.
            // Actually, let's be more precise: delete matches that are NOT in keptIds
        });

        // A safer delete query to ensure we absolutely don't touch the kept ones
        // const deleteResult = await Business.deleteMany({ _id: { $nin: keptIds } });
        // The above is safer. Let's use that.

        const finalDeleteResult = await Business.deleteMany({ _id: { $nin: keptIds } });
        console.log(`🧹 Deleted ${finalDeleteResult.deletedCount} unowned businesses.`);

        // 3. Generate new businesses
        console.log(`🏭 Generating new businesses across ${CATEGORIES.length} categories...`);

        const newBusinesses = [];
        const existingNames = new Set(businessesWithOwners.map(b => b.name));

        // Count existing businesses per category to know how many more to add
        const currentCounts = {};
        businessesWithOwners.forEach(b => {
            // Check both category field and categories array
            const cat = b.category || (b.categories && b.categories[0]) || 'Other';
            currentCounts[cat] = (currentCounts[cat] || 0) + 1;
        });

        for (const category of CATEGORIES) {
            const existingCount = currentCounts[category] || 0;
            const needed = Math.max(0, TARGET_PER_CATEGORY - existingCount);

            if (needed > 0) {
                // console.log(`   - Generating ${needed} for ${category}...`);
                for (let i = 0; i < needed; i++) {
                    newBusinesses.push(generateBusiness(category, existingNames));
                }
            }
        }

        // 4. Batch Insert
        if (newBusinesses.length > 0) {
            console.log(`💾 Inserting ${newBusinesses.length} new businesses...`);
            // Insert in chunks of 100 to avoid memory issues or timeout
            const chunkSize = 100;
            for (let i = 0; i < newBusinesses.length; i += chunkSize) {
                const chunk = newBusinesses.slice(i, i + chunkSize);
                await Business.insertMany(chunk);
                process.stdout.write('.');
            }
            console.log('\n✅ Insertion complete!');
        } else {
            console.log('✨ Target counts already met. No new businesses needed.');
        }

        // 5. Verification Summary
        console.log('\n📊 Final Distribution:');
        const finalCounts = await Business.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        finalCounts.forEach(c => {
            console.log(`   ${c._id}: ${c.count}`);
        });

        const tierCounts = await Business.aggregate([
            { $group: { _id: '$subscriptionTier', count: { $sum: 1 } } }
        ]);

        console.log('\n🏆 Tier Distribution:');
        tierCounts.forEach(c => {
            console.log(`   ${c._id}: ${c.count}`);
        });

        const total = await Business.countDocuments();
        console.log(`\n🎉 Total Businesses in Database: ${total}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedMassive();

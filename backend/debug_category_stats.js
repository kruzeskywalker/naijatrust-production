require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/Business');

const MONGODB_URI = process.env.MONGODB_URI;

const debugStats = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        console.log('Running aggregation pipeline...');

        const stats = await Business.aggregate([
            { $match: { status: 'approved' } },
            {
                $project: {
                    // Use categories if exists and not empty, otherwise wrap category in array
                    allCategories: {
                        $cond: {
                            if: {
                                $and: [
                                    { $isArray: "$categories" },
                                    { $gt: [{ $size: "$categories" }, 0] }
                                ]
                            },
                            then: "$categories",
                            else: ["$category"]
                        }
                    }
                }
            },
            { $unwind: "$allCategories" },
            { $match: { allCategories: { $exists: true, $ne: null } } }, // Filter out nulls
            {
                $group: {
                    _id: "$allCategories",
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('Aggregation Results:');
        console.log(JSON.stringify(stats, null, 2));

        const categoryCounts = {};
        stats.forEach(item => {
            if (item._id) {
                categoryCounts[item._id] = item.count;
            }
        });

        console.log('Formatted Counts:');
        console.log(categoryCounts);

        // Check specifically for NGO
        const ngoCount = await Business.countDocuments({
            $or: [
                { category: 'NGO' },
                { categories: 'NGO' }
            ]
        });
        console.log(`\nDirect count for NGO: ${ngoCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

debugStats();

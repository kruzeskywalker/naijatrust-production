require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/Business');

// Use production database connection from environment variable
const MONGODB_URI = process.env.MONGODB_URI;

const ngos = [
    {
        name: 'Sydani Group',
        category: 'NGO',
        categories: ['NGO', 'Consulting'],
        rating: 4.8,
        reviewCount: 45,
        location: 'Abuja, Nigeria',
        isVerified: true,
        website: 'https://sydani.org',
        description: 'Sydani Group is a management consulting firm that specializes in the design and implementation of sustainable solutions to complex development challenges.'
    },
    {
        name: 'LEAP Africa',
        category: 'NGO',
        categories: ['NGO', 'Education'],
        rating: 4.7,
        reviewCount: 120,
        location: 'Lagos, Nigeria',
        isVerified: true,
        website: 'https://www.leapafrica.org',
        description: 'LEAP Africa is a youth-focused leadership development organization committed to raising leaders that will transform Africa.'
    },
    {
        name: 'The Tony Elumelu Foundation',
        category: 'NGO',
        categories: ['NGO', 'Fintech'], // Assuming they help with funding/entrepreneurship
        rating: 4.9,
        reviewCount: 3500,
        location: 'Lagos, Nigeria',
        isVerified: true,
        website: 'https://www.tonyelumelufoundation.org',
        description: 'The Tony Elumelu Foundation is the leading provider of entrepreneurship programmes in Africa, empowering African entrepreneurs.'
    },
    {
        name: 'BudgIT',
        category: 'NGO',
        categories: ['NGO', 'IT Services'],
        rating: 4.6,
        reviewCount: 85,
        location: 'Yaba, Lagos',
        isVerified: true,
        website: 'https://yourbudgit.com',
        description: 'BudgIT is a civic organization that applies technology to intersect citizen engagement with institutional improvement to facilitate societal change.'
    },
    {
        name: 'Connected Development (CODE)',
        category: 'NGO',
        categories: ['NGO'],
        rating: 4.5,
        reviewCount: 60,
        location: 'Abuja, Nigeria',
        isVerified: true,
        website: 'https://www.connecteddevelopment.org',
        description: 'CODE is a non-government organization whose mission is to empower marginalized communities in Africa.'
    },
    {
        name: 'Yiaga Africa',
        category: 'NGO',
        categories: ['NGO'],
        rating: 4.7,
        reviewCount: 92,
        location: 'Abuja, Nigeria',
        isVerified: true,
        website: 'https://www.yiaga.org',
        description: 'Yiaga Africa is a non-profit civic hub of change makers committed to the promotion of democratic governance, human rights and civic engagement.'
    },
    {
        name: 'SERAP',
        category: 'NGO',
        categories: ['NGO', 'Legal Services'],
        rating: 4.4,
        reviewCount: 150,
        location: 'Lagos, Nigeria',
        isVerified: true,
        website: 'https://serap-nigeria.org',
        description: 'Socio-Economic Rights and Accountability Project (SERAP) is a non-profit, non-partisan, legal and advocacy organization.'
    }
];

const seedNGOs = async () => {
    try {
        console.log('Connecting to database...');
        if (!MONGODB_URI) {
            console.error('MONGODB_URI is not defined in .env');
            process.exit(1);
        }
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        console.log('Seeding NGOs...');
        let addedCount = 0;
        let skippedCount = 0;

        for (const ngo of ngos) {
            const existing = await Business.findOne({ name: ngo.name });
            if (existing) {
                console.log(`- Skipped: ${ngo.name} (already exists)`);
                skippedCount++;
            } else {
                await Business.create(ngo);
                console.log(`+ Added: ${ngo.name}`);
                addedCount++;
            }
        }

        console.log(`\nSeed complete!`);
        console.log(`Added: ${addedCount}`);
        console.log(`Skipped: ${skippedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding NGOs:', error);
        process.exit(1);
    }
};

seedNGOs();

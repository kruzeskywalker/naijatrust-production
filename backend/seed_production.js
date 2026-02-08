require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/Business');

// Use production database connection
const PRODUCTION_MONGODB_URI = 'mongodb+srv://naijatrust_admin:ahT3iqd5irHzc74x@cluster0.ujohwdp.mongodb.net/naijatrust_production?retryWrites=true&w=majority&appName=Cluster0';

const businesses = [
    // Banks
    { name: 'Zenith Bank', category: 'Banks', rating: 4.5, reviewCount: 3200, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.zenithbank.com', phone: '+234 1 278 7000', description: 'Zenith Bank PLC is a financial services provider in Nigeria and Anglophone West Africa.' },
    { name: 'GTBank', category: 'Banks', rating: 4.2, reviewCount: 5100, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.gtbank.com', phone: '+234 1 448 0000', description: 'Guaranty Trust Bank PLC is a multinatonal financial institution that provides individuals, businesses, private and public institutions with a broad range of market-leading financial services.' },
    { name: 'FirstBank', category: 'Banks', rating: 3.9, reviewCount: 2800, location: 'Marina, Lagos', isVerified: true, website: 'https://www.firstbanknigeria.com', phone: '+234 1 905 2326', description: 'First Bank of Nigeria Limited is a Nigerian multinational bank and financial services company.' },
    { name: 'Access Bank', category: 'Banks', rating: 4.0, reviewCount: 4200, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.accessbankplc.com' },
    { name: 'UBA', category: 'Banks', rating: 3.8, reviewCount: 1900, location: 'Marina, Lagos', isVerified: true, website: 'https://www.ubagroup.com' },

    // Ecommerce
    { name: 'Jumia Nigeria', category: 'Ecommerce', rating: 3.8, reviewCount: 15400, location: 'Ogba, Lagos', isVerified: true, website: 'https://www.jumia.com.ng', phone: '+234 1 888 1106', description: 'Jumia is Nigeria\'s number one online marketplace.' },
    { name: 'Konga', category: 'Ecommerce', rating: 4.1, reviewCount: 6200, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.konga.com' },
    { name: 'Jiji Nigeria', category: 'Ecommerce', rating: 4.4, reviewCount: 9800, location: 'Yaba, Lagos', isVerified: true, website: 'https://www.jiji.ng' },
    { name: 'Slot Systems', category: 'Ecommerce', rating: 4.6, reviewCount: 1200, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.slot.ng' },
    { name: 'PayPorte', category: 'Ecommerce', rating: 3.5, reviewCount: 850, location: 'Lekki, Lagos', isVerified: false, website: 'https://www.payporte.com' },

    // Telecom
    { name: 'MTN Nigeria', category: 'Telecom', rating: 4.3, reviewCount: 25000, location: 'Ikoyi, Lagos', isVerified: true, website: 'https://www.mtn.ng', phone: '+234 803 100 0180', description: 'MTN Nigeria is the leader in telecommunications in Nigeria.' },
    { name: 'Airtel Nigeria', category: 'Telecom', rating: 4.1, reviewCount: 18000, location: 'Banana Island, Lagos', isVerified: true, website: 'https://www.airtel.com.ng' },
    { name: 'Glo (Globacom)', category: 'Telecom', rating: 3.7, reviewCount: 12000, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.gloworld.com' },
    { name: '9mobile', category: 'Telecom', rating: 3.5, reviewCount: 5400, location: 'Banana Island, Lagos', isVerified: true, website: 'https://www.9mobile.com.ng' },
    { name: 'Spectranet', category: 'Telecom', rating: 3.9, reviewCount: 2100, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.spectranet.com.ng' },

    // Fintech
    { name: 'Kuda Bank', category: 'Fintech', rating: 4.7, reviewCount: 1250, location: 'Yaba, Lagos', isVerified: true, website: 'https://www.kuda.com', phone: '+234 1 888 5832', description: 'Kuda is a full-service digital-only bank with a banking license.' },
    { name: 'OPay Nigeria', category: 'Fintech', rating: 4.7, reviewCount: 45000, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.opaycheckout.com' },
    { name: 'PalmPay', category: 'Fintech', rating: 4.6, reviewCount: 38000, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.palmpay.com' },
    { name: 'PiggyVest', category: 'Fintech', rating: 4.8, reviewCount: 25000, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.piggyvest.com' },
    { name: 'Moniepoint', category: 'Fintech', rating: 4.5, reviewCount: 12000, location: 'Oyo, Nigeria', isVerified: true, website: 'https://www.moniepoint.com' },
];

const seedProductionDB = async () => {
    try {
        console.log('Connecting to PRODUCTION database...');
        await mongoose.connect(PRODUCTION_MONGODB_URI);
        console.log('✓ Connected to MongoDB Production');

        console.log('Checking existing businesses...');
        const existingCount = await Business.countDocuments();
        console.log(`Found ${existingCount} existing businesses`);

        if (existingCount > 0) {
            console.log('⚠️  WARNING: Production database already has businesses!');
            console.log('Clearing existing businesses...');
            await Business.deleteMany({});
            console.log('✓ Cleared existing businesses');
        }

        console.log('Inserting sample businesses...');
        await Business.insertMany(businesses);
        console.log(`✓ Successfully seeded ${businesses.length} businesses to PRODUCTION database`);

        const finalCount = await Business.countDocuments();
        console.log(`✓ Total businesses in production: ${finalCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding production database:', error);
        process.exit(1);
    }
};

seedProductionDB();

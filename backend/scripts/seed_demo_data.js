const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Business = require('../models/Business');
const User = require('../models/User');
const Review = require('../models/Review');
const AnalyticsLog = require('../models/AnalyticsLog');
const BusinessUser = require('../models/BusinessUser');

dotenv.config();

// --- DATA LISTS ---

const businessCategories = [
    'Agriculture', 'Banks', 'Ecommerce', 'Education', 'Energy', 'Fintech',
    'Food & Beverage', 'Health', 'Hospitality', 'Insurance', 'IT Services',
    'Jobs', 'Legal Services', 'Logistics', 'Media', 'Real Estate', 'Telecom',
    'Travel & Hotels', 'Other'
];

// 100+ Real Nigerian Businesses across categories
const comprehensiveBusinessList = [
    // --- BANKS ---
    { name: 'GTBank', category: 'Banks', website: 'gtbank.com', isVerified: true },
    { name: 'Zenith Bank', category: 'Banks', website: 'zenithbank.com', isVerified: true },
    { name: 'Access Bank', category: 'Banks', website: 'accessbankplc.com', isVerified: true },
    { name: 'UBA (United Bank for Africa)', category: 'Banks', website: 'ubagroup.com', isVerified: true },
    { name: 'First Bank of Nigeria', category: 'Banks', website: 'firstbanknigeria.com', isVerified: true },
    { name: 'Fidelity Bank', category: 'Banks', website: 'fidelitybank.ng', isVerified: false },
    { name: 'Ecobank Nigeria', category: 'Banks', website: 'ecobank.com', isVerified: false },
    { name: 'Stanbic IBTC Bank', category: 'Banks', website: 'stanbicibtc.com', isVerified: true },
    { name: 'Sterling Bank', category: 'Banks', website: 'sterling.ng', isVerified: false },
    { name: 'Union Bank', category: 'Banks', website: 'unionbankng.com', isVerified: true },

    // --- FINTECH ---
    { name: 'Kuda Bank', category: 'Fintech', website: 'kuda.com', isVerified: true },
    { name: 'OPay', category: 'Fintech', website: 'opayweb.com', isVerified: true },
    { name: 'PalmPay', category: 'Fintech', website: 'palmpay.com', isVerified: true },
    { name: 'Moniepoint', category: 'Fintech', website: 'moniepoint.com', isVerified: true },
    { name: 'Paystack', category: 'Fintech', website: 'paystack.com', isVerified: true },
    { name: 'Flutterwave', category: 'Fintech', website: 'flutterwave.com', isVerified: true },
    { name: 'PiggyVest', category: 'Fintech', website: 'piggyvest.com', isVerified: true },
    { name: 'Cowrywise', category: 'Fintech', website: 'cowrywise.com', isVerified: true },
    { name: 'Interswitch', category: 'Fintech', website: 'interswitchgroup.com', isVerified: true },
    { name: 'Remita', category: 'Fintech', website: 'remita.net', isVerified: false },
    { name: 'Carbon', category: 'Fintech', website: 'getcarbon.co', isVerified: true },
    { name: 'FairMoney', category: 'Fintech', website: 'fairmoney.io', isVerified: false },

    // --- ECOMMERCE ---
    { name: 'Jumia Nigeria', category: 'Ecommerce', website: 'jumia.com.ng', isVerified: true },
    { name: 'Konga', category: 'Ecommerce', website: 'konga.com', isVerified: true },
    { name: 'Jiji', category: 'Ecommerce', website: 'jiji.ng', isVerified: true },
    { name: 'Slot Systems', category: 'Ecommerce', website: 'slot.ng', isVerified: true },
    { name: 'AliExpress Nigeria', category: 'Ecommerce', website: 'aliexpress.com', isVerified: false },
    { name: 'Kara.com.ng', category: 'Ecommerce', website: 'kara.com.ng', isVerified: false },
    { name: 'Spar Nigeria', category: 'Ecommerce', website: 'sparnigeria.com', isVerified: true },

    // --- FOOD & BEVERAGE ---
    { name: 'Chicken Republic', category: 'Food & Beverage', website: 'chicken-republic.com', isVerified: true },
    { name: 'The Place', category: 'Food & Beverage', website: 'theplace.com.ng', isVerified: true },
    { name: 'Kilimanjaro', category: 'Food & Beverage', website: 'kilimanjaro-restaurants.com', isVerified: false },
    { name: 'Domino\'s Pizza Nigeria', category: 'Food & Beverage', website: 'dominos.ng', isVerified: true },
    { name: 'Cold Stone Creamery', category: 'Food & Beverage', website: 'coldstonecreamery.ng', isVerified: true },
    { name: 'Mama Cassie', category: 'Food & Beverage', website: 'mamacassie.com', isVerified: false },
    { name: 'Tantalizers', category: 'Food & Beverage', website: 'tantalizersng.com', isVerified: false },
    { name: 'Mr Bigg\'s', category: 'Food & Beverage', website: 'mrbiggs.com.ng', isVerified: false },
    { name: 'Sweet Sensation', category: 'Food & Beverage', website: 'sweetsensation.ng', isVerified: false },
    { name: 'Mega Chicken', category: 'Food & Beverage', website: 'megachicken.com.ng', isVerified: true },

    // --- TELECOM ---
    { name: 'MTN Nigeria', category: 'Telecom', website: 'mtnonline.com', isVerified: true },
    { name: 'Airtel Nigeria', category: 'Telecom', website: 'airtel.com.ng', isVerified: true },
    { name: 'Glo (Globacom)', category: 'Telecom', website: 'gloworld.com', isVerified: true },
    { name: '9mobile', category: 'Telecom', website: '9mobile.com.ng', isVerified: false },
    { name: 'Spectranet', category: 'Telecom', website: 'spectranet.com.ng', isVerified: false },
    { name: 'Smile Communications', category: 'Telecom', website: 'smile.com.ng', isVerified: false },
    { name: 'Starlink Nigeria', category: 'Telecom', website: 'starlink.com', isVerified: true },
    { name: 'MainOne', category: 'Telecom', website: 'mainone.net', isVerified: true },

    // --- TRAVEL & HOTELS ---
    { name: 'Ibom Air', category: 'Travel & Hotels', website: 'ibomair.com', isVerified: true },
    { name: 'Air Peace', category: 'Travel & Hotels', website: 'flyairpeace.com', isVerified: true },
    { name: 'Arik Air', category: 'Travel & Hotels', website: 'arikair.com', isVerified: false },
    { name: 'Green Africa', category: 'Travel & Hotels', website: 'greenafrica.com', isVerified: true },
    { name: 'Dana Air', category: 'Travel & Hotels', website: 'flydanaair.com', isVerified: false },
    { name: 'Wakanow', category: 'Travel & Hotels', website: 'wakanow.com', isVerified: true },
    { name: 'Travelstart', category: 'Travel & Hotels', website: 'travelstart.com.ng', isVerified: false },
    { name: 'Transcorp Hilton Abuja', category: 'Travel & Hotels', website: 'transcorphotels.com', isVerified: true },
    { name: 'Eko Hotels & Suites', category: 'Travel & Hotels', website: 'ekohotels.com', isVerified: true },
    { name: 'Radisson Blu Lagos', category: 'Travel & Hotels', website: 'radissonhotels.com', isVerified: true },

    // --- LOGISTICS ---
    { name: 'GIG Logistics', category: 'Logistics', website: 'giglogistics.com', isVerified: true },
    { name: 'DHL Nigeria', category: 'Logistics', website: 'dhl.com/ng-en', isVerified: true },
    { name: 'Red Star Express', category: 'Logistics', website: 'redstarplc.com', isVerified: true },
    { name: 'Kwik Delivery', category: 'Logistics', website: 'kwik.delivery', isVerified: false },
    { name: 'Gokada', category: 'Logistics', website: 'gokada.ng', isVerified: false },
    { name: 'Max.ng', category: 'Logistics', website: 'max.ng', isVerified: false },
    { name: 'Sendbox', category: 'Logistics', website: 'sendbox.co', isVerified: true },

    // --- REAL ESTATE ---
    { name: 'LandWey', category: 'Real Estate', website: 'landwey.ng', isVerified: true },
    { name: 'Mixta Africa', category: 'Real Estate', website: 'mixtafrica.com', isVerified: true },
    { name: 'PropertyPro.ng', category: 'Real Estate', website: 'propertypro.ng', isVerified: true },
    { name: 'Nigeria Property Centre', category: 'Real Estate', website: 'nigeriapropertycentre.com', isVerified: true },
    { name: 'RevolutionPlus Property', category: 'Real Estate', website: 'revolutionplusproperty.com', isVerified: false },
    { name: 'Homes & Condos', category: 'Real Estate', website: 'homesandcondos.com.ng', isVerified: false },

    // --- EDUCATION ---
    { name: 'AltSchool Africa', category: 'Education', website: 'altschoolafrica.com', isVerified: true },
    { name: 'uLesson', category: 'Education', website: 'ulesson.com', isVerified: true },
    { name: 'Andela', category: 'Education', website: 'andela.com', isVerified: true },
    { name: 'Decagon', category: 'Education', website: 'decagon.institute', isVerified: true },
    { name: 'Covenant University', category: 'Education', website: 'covenantuniversity.edu.ng', isVerified: true },
    { name: 'University of Lagos', category: 'Education', website: 'unilag.edu.ng', isVerified: true },
    { name: 'Nexford University', category: 'Education', website: 'nexford.org', isVerified: true },

    // --- HEALTH ---
    { name: 'LifeBank', category: 'Health', website: 'lifebank.ng', isVerified: true },
    { name: '54gene', category: 'Health', website: '54gene.com', isVerified: true },
    { name: 'Helium Health', category: 'Health', website: 'heliumhealth.com', isVerified: true },
    { name: 'Reliance HMO', category: 'Health', website: 'reliancehmo.com', isVerified: true },
    { name: 'Iwosan Lagoon Hospitals', category: 'Health', website: 'iwosanlagoonhospitals.com', isVerified: true },
    { name: 'Eko Hospital', category: 'Health', website: 'ekocorp.net', isVerified: false },
    { name: 'Reddingson Hospital', category: 'Health', website: 'reddingtonhospital.com', isVerified: true },

    // --- IT SERVICES / MEDIA / OTHER ---
    { name: 'MainOne', category: 'IT Services', website: 'mainone.net', isVerified: true },
    { name: 'SystemSpecs', category: 'IT Services', website: 'systemspecs.com.ng', isVerified: true },
    { name: 'Channels TV', category: 'Media', website: 'channelstv.com', isVerified: true },
    { name: 'Arise News', category: 'Media', website: 'arise.tv', isVerified: true },
    { name: 'Pulse Nigeria', category: 'Media', website: 'pulse.ng', isVerified: true },
    { name: 'Punch Newspapers', category: 'Media', website: 'punchng.com', isVerified: true },
    { name: 'Jobberman', category: 'Jobs', website: 'jobberman.com', isVerified: true },
    { name: 'MyJobMag', category: 'Jobs', website: 'myjobmag.com', isVerified: false },
    { name: 'Leadway Assurance', category: 'Insurance', website: 'leadway.com', isVerified: true },
    { name: 'AXA Mansard', category: 'Insurance', website: 'axamansard.com', isVerified: true },
    { name: 'AIICO Insurance', category: 'Insurance', website: 'aiicoplc.com', isVerified: true },
    { name: 'Dangote Cement', category: 'Other', website: 'dangotecement.com', isVerified: true },
    { name: 'BUA Group', category: 'Other', website: 'buagroup.com', isVerified: true },
    { name: 'Oando PLC', category: 'Energy', website: 'oandoplc.com', isVerified: true },
    { name: 'Seplat Energy', category: 'Energy', website: 'seplatenergy.com', isVerified: true },
    { name: 'TotalEnergies Nigeria', category: 'Energy', website: 'totalenergies.ng', isVerified: true },
    { name: 'Mikano International', category: 'Energy', website: 'mikano-intl.com', isVerified: false },
    { name: 'Indomie (Dufil Prima)', category: 'Food & Beverage', website: 'dufil.com', isVerified: true },
    { name: 'Nigerian Breweries', category: 'Food & Beverage', website: 'nbplc.com', isVerified: true },
    { name: 'Guinness Nigeria', category: 'Food & Beverage', website: 'guinness-nigeria.com', isVerified: true }
];

const nigerianNames = [
    'Chinedu Okeke', 'Adebayo Oluwaseun', 'Zainab Yusuf', 'Emeka Nnamdi', 'Folake Adebayo',
    'Ibrahim Musa', 'Ngozi Eze', 'Tunde Bakare', 'Fatima Bello', 'Kelechi Iheanacho',
    'Yemi Alade', 'Burna Boy', 'Tiwa Savage', 'Davido Adeleke', 'Wizkid Balogun',
    'Funke Akindele', 'Genevieve Nnaji', 'Don Jazzy', 'Olamide Adedeji', 'Simi Ogunleye',
    'Chioma Jesus', 'Basketmouth', 'Falz TheBahdGuy', 'Mr Macaroni', 'Broda Shaggi',
    'Taooma', 'KieKie', 'Sabinus', 'BrainJotter', 'Lasisi Elenu'
];


const reviewTemplates = {
    positive: [
        "Excellent service! I'm very impressed with their customer support.",
        "Fast and reliable. Would definitely recommend to others.",
        "The best experience I've had in a long time. Keep it up!",
        "Seamless transaction completely. Very happy customer.",
        "I love this brand. They never disappoint.",
        "Top notch quality! Will surely patronize again.",
        "Their response time is amazing. Kudos!",
        "Very professional staff and good environment."
    ],
    neutral: [
        "It was okay, but delivery took longer than expected.",
        "Customer service was helpful, but the app is a bit buggy.",
        "Not bad, but there are better alternatives out there.",
        "Average experience. Nothing special to write home about.",
        "Good product but the packaging could be better."
    ],
    negative: [
        "Terrible experience. They took my money and didn't deliver.",
        "Customer support is non-existent. Avoid at all costs!",
        "The app keeps crashing. Very frustrating.",
        "Hidden charges everywhere. Be careful.",
        "I regret using this service. Total waste of time.",
        "Very rude staff. I will never go there again."
    ]
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    // Be careful clearing in production! Ideally check env.
    await Business.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } }); // Keep admin
    await BusinessUser.deleteMany({});
    await AnalyticsLog.deleteMany({});

    console.log('👤 Creating Users...');
    const users = [];
    const password = await bcrypt.hash('password123', 10);

    for (const name of nigerianNames) {
        users.push({
            name,
            email: `${name.toLowerCase().replace(/ /g, '.').replace(/[^a-z0-9.]/g, '')}@example.com`,
            password,
            avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`
        });
    }
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    console.log('🏢 Creating Businesses & Owners...');
    const createdBusinesses = [];

    // Create a robust demo account for the "Pitch"
    const demoOwnerName = "Demo Owner";
    const demoOwnerEmail = "demo@naijatrust.com";
    const demoOwner = await BusinessUser.create({
        name: demoOwnerName,
        email: demoOwnerEmail,
        password: 'password123', // Will be hashed by pre-save hook
        isEmailVerified: true,
        businessEmail: demoOwnerEmail, // Required
        phone: '+2348012345678', // Required
        position: 'Owner', // Required
        claimedBusinesses: [] // Field name is claimedBusinesses in schema
    });

    for (const bizData of comprehensiveBusinessList) {
        // Assign demo ownership to a few key brands for the pitch
        const isDemoBiz = ['Kuda Bank', 'GTBank', 'Chicken Republic'].includes(bizData.name);
        const owner = isDemoBiz ? demoOwner : null;

        // Generate logo placeholder using name
        const logo = `https://ui-avatars.com/api/?name=${bizData.name.replace(/ /g, '+')}&background=random&color=fff&size=200`;

        const business = await Business.create({
            ...bizData,
            description: `${bizData.name} is a leading player in the ${bizData.category} sector in Nigeria. Known for quality service and reliability.`,
            email: `contact@${bizData.website}`,
            phone: '+234 800 000 0000',
            location: 'Lagos, Nigeria', // Default location
            logo: logo,
            owner: owner ? owner._id : null,
            claimStatus: owner ? 'claimed' : 'unclaimed',
            reviewCount: 0,
            rating: 0,
            viewCount: 0,
            websiteClickCount: 0
        });
        createdBusinesses.push(business);

        if (owner) {
            owner.claimedBusinesses.push(business._id);
        }
    }
    await demoOwner.save();
    console.log(`✅ Created ${createdBusinesses.length} businesses.`);

    console.log('⭐ Generating Reviews...');
    for (const biz of createdBusinesses) {
        // Vary review count based on verification status (Verified = Popular = More reviews)
        const numReviews = biz.isVerified ? Math.floor(Math.random() * 25) + 5 : Math.floor(Math.random() * 5);

        let totalRating = 0;

        for (let i = 0; i < numReviews; i++) {
            const user = getRandom(createdUsers);
            // Skew ratings slightly positive for verified
            const skew = biz.isVerified ? 3 : 1;
            const rating = Math.min(5, Math.floor(Math.random() * 5) + 1 + (Math.random() > 0.7 ? 1 : 0));

            totalRating += rating;

            let content;
            if (rating >= 4) content = getRandom(reviewTemplates.positive);
            else if (rating === 3) content = getRandom(reviewTemplates.neutral);
            else content = getRandom(reviewTemplates.negative);

            const date = getRandomDate(new Date(2025, 0, 1), new Date());

            await Review.create({
                user: user._id,
                business: biz._id,
                rating,
                title: content.substring(0, 20) + "...",
                content,
                likes: Math.floor(Math.random() * 10),
                createdAt: date
            });
        }

        // Update Aggregate Stats
        if (numReviews > 0) {
            biz.reviewCount = numReviews;
            biz.rating = (totalRating / numReviews).toFixed(1);
            await biz.save();
        }
    }
    console.log('✅ Reviews Generated');

    console.log('📊 Generating Analytics Data (Views & Clicks)...');
    const eventTypes = ['view', 'website_click', 'call_click'];

    for (const biz of createdBusinesses) {
        // Heavy traffic for Demo businesses, light for others
        const isDemo = biz.owner?.toString() === demoOwner._id.toString();
        const trafficScale = isDemo ? 50 : 5;

        let views = 0;
        let clicks = 0;

        for (let i = 0; i < trafficScale; i++) {
            const eventType = Math.random() > 0.7 ? 'website_click' : 'view';
            if (eventType === 'view') views++;
            if (eventType === 'website_click') clicks++;

            const date = getRandomDate(new Date(new Date().setDate(new Date().getDate() - 30)), new Date());

            await AnalyticsLog.create({
                businessId: biz._id,
                eventType,
                metadata: { source: 'search' },
                timestamp: date
            });
        }

        biz.viewCount = views;
        biz.websiteClickCount = clicks;
        await biz.save();
    }
    console.log('✅ Analytics Generated');

    console.log('\n🎉 COMPREHENSIVE SEEDING COMPLETE');
    console.log(`Total Businesses: ${createdBusinesses.length}`);
    process.exit(0);
};

seedData();

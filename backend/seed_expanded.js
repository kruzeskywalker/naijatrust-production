require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/Business');

const businesses = [
    // --- BANKS ---
    { name: 'Zenith Bank', category: 'Banks', rating: 4.5, reviewCount: 3200, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.zenithbank.com', phone: '+234 1 278 7000', description: 'Zenith Bank PLC is a financial services provider in Nigeria and Anglophone West Africa.' },
    { name: 'GTBank', category: 'Banks', rating: 4.2, reviewCount: 5100, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.gtbank.com', phone: '+234 1 448 0000', description: 'Guaranty Trust Bank PLC is a multinatonal financial institution that provides individuals, businesses, private and public institutions with a broad range of market-leading financial services.' },
    { name: 'FirstBank', category: 'Banks', rating: 3.9, reviewCount: 2800, location: 'Marina, Lagos', isVerified: true, website: 'https://www.firstbanknigeria.com', phone: '+234 1 905 2326', description: 'First Bank of Nigeria Limited is a Nigerian multinational bank and financial services company.' },
    { name: 'Access Bank', category: 'Banks', rating: 4.0, reviewCount: 4200, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.accessbankplc.com' },
    { name: 'UBA', category: 'Banks', rating: 3.8, reviewCount: 1900, location: 'Marina, Lagos', isVerified: true, website: 'https://www.ubagroup.com' },
    { name: 'Fidelity Bank', category: 'Banks', rating: 3.7, reviewCount: 1500, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.fidelitybank.ng' },

    // --- ECOMMERCE ---
    { name: 'Jumia Nigeria', category: 'Ecommerce', rating: 3.8, reviewCount: 15400, location: 'Ogba, Lagos', isVerified: true, website: 'https://www.jumia.com.ng', phone: '+234 1 888 1106', description: 'Jumia is Nigeria\'s number one online marketplace.' },
    { name: 'Konga', category: 'Ecommerce', rating: 4.1, reviewCount: 6200, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.konga.com' },
    { name: 'Jiji Nigeria', category: 'Ecommerce', rating: 4.4, reviewCount: 9800, location: 'Yaba, Lagos', isVerified: true, website: 'https://www.jiji.ng' },
    { name: 'Slot Systems', category: 'Ecommerce', rating: 4.6, reviewCount: 1200, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.slot.ng' },
    { name: 'PayPorte', category: 'Ecommerce', rating: 3.5, reviewCount: 850, location: 'Lekki, Lagos', isVerified: false, website: 'https://www.payporte.com' },

    // --- TELECOM ---
    { name: 'MTN Nigeria', category: 'Telecom', rating: 4.3, reviewCount: 25000, location: 'Ikoyi, Lagos', isVerified: true, website: 'https://www.mtn.ng', phone: '+234 803 100 0180', description: 'MTN Nigeria is the leader in telecommunications in Nigeria.' },
    { name: 'Airtel Nigeria', category: 'Telecom', rating: 4.1, reviewCount: 18000, location: 'Banana Island, Lagos', isVerified: true, website: 'https://www.airtel.com.ng' },
    { name: 'Glo (Globacom)', category: 'Telecom', rating: 3.7, reviewCount: 12000, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.gloworld.com' },
    { name: '9mobile', category: 'Telecom', rating: 3.5, reviewCount: 5400, location: 'Banana Island, Lagos', isVerified: true, website: 'https://www.9mobile.com.ng' },
    { name: 'Spectranet', category: 'Internet Service Providers', rating: 3.9, reviewCount: 2100, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.spectranet.com.ng' },
    { name: 'Starlink Nigeria', category: 'Internet Service Providers', rating: 4.8, reviewCount: 500, location: 'Lekki, Lagos', isVerified: true, website: 'https://www.starlink.com' },

    // --- FINTECH ---
    { name: 'Kuda Bank', category: 'Fintech', rating: 4.7, reviewCount: 12500, location: 'Yaba, Lagos', isVerified: true, website: 'https://www.kuda.com', phone: '+234 1 888 5832', description: 'Kuda is a full-service digital-only bank with a banking license.' },
    { name: 'OPay Nigeria', category: 'Fintech', rating: 4.7, reviewCount: 45000, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.opaycheckout.com' },
    { name: 'PalmPay', category: 'Fintech', rating: 4.6, reviewCount: 38000, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.palmpay.com' },
    { name: 'PiggyVest', category: 'Fintech', rating: 4.8, reviewCount: 25000, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.piggyvest.com' },
    { name: 'Moniepoint', category: 'Fintech', rating: 4.5, reviewCount: 12000, location: 'Oyo, Nigeria', isVerified: true, website: 'https://www.moniepoint.com' },
    { name: 'Remita', category: 'Fintech', rating: 3.6, reviewCount: 1800, location: 'Lagos, Nigeria', isVerified: true, website: 'https://www.remita.net' },
    { name: 'Interswitch', category: 'Fintech', rating: 4.0, reviewCount: 2200, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.interswitchgroup.com' },

    // --- AUTOMOBILES ---
    { name: 'Cars45', category: 'Automobiles', rating: 4.2, reviewCount: 3500, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.cars45.com', description: 'Sell or buy used cars in Nigeria with ease.' },
    { name: 'Elizade Motors', category: 'Automobiles', rating: 4.4, reviewCount: 800, location: 'Ilupeju, Lagos', isVerified: true, website: 'https://www.elizade.com', description: 'Authorized Toyota dealer in Nigeria.' },
    { name: 'Coscharis Motors', category: 'Automobiles', rating: 4.3, reviewCount: 1100, location: 'Lekki, Lagos', isVerified: true, website: 'https://www.coscharisgroup.com' },
    { name: 'Autochek', category: 'Automobiles', rating: 4.1, reviewCount: 1500, location: 'Lekki, Lagos', isVerified: true, website: 'https://autochek.africa/ng' },
    { name: 'GIG Motors', category: 'Automobiles', rating: 3.9, reviewCount: 600, location: 'Lagos, Nigeria', isVerified: false },

    // --- TRAVEL & AVIATION ---
    { name: 'Air Peace', category: 'Travel & Aviation', rating: 3.5, reviewCount: 8000, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.flyairpeace.com', description: 'West and Central Africa\'s largest airline.' },
    { name: 'Ibom Air', category: 'Travel & Aviation', rating: 4.6, reviewCount: 4500, location: 'Uyo, Akwa Ibom', isVerified: true, website: 'https://www.ibomair.com', description: 'Airline of choice for on-time departures.' },
    { name: 'Wakanow', category: 'Travel & Aviation', rating: 3.8, reviewCount: 3200, location: 'Lekki, Lagos', isVerified: true, website: 'https://www.wakanow.com' },
    { name: 'Travelstart Nigeria', category: 'Travel & Aviation', rating: 4.0, reviewCount: 2100, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.travelstart.com.ng' },
    { name: 'GIG Mobility (GIGM)', category: 'Travel & Aviation', rating: 4.2, reviewCount: 15000, location: 'Lagos, Nigeria', isVerified: true, website: 'https://gigm.com', description: 'Technologically powered transport platform.' },
    { name: 'Peace Mass Transit', category: 'Travel & Aviation', rating: 3.4, reviewCount: 6000, location: 'Enugu, Nigeria', isVerified: false, website: 'https://pmt.ng' },

    // --- REAL ESTATE ---
    { name: 'Jide Taiwo & Co', category: 'Real Estate', rating: 3.9, reviewCount: 400, location: 'Lagos Island, Lagos', isVerified: true, website: 'https://www.jidetaiwoandco.com' },
    { name: 'Landwey Investment', category: 'Real Estate', rating: 4.1, reviewCount: 900, location: 'Lekki, Lagos', isVerified: true, website: 'https://landwey.ng' },
    { name: 'PropertyPro.ng', category: 'Real Estate', rating: 4.0, reviewCount: 1200, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.propertypro.ng' },
    { name: 'Mixta Africa', category: 'Real Estate', rating: 3.8, reviewCount: 300, location: 'Ikoyi, Lagos', isVerified: true, website: 'https://mixtafrica.com' },

    // --- EDUCATION ---
    { name: 'Covenant University', category: 'Education', rating: 4.5, reviewCount: 2500, location: 'Ota, Ogun', isVerified: true, website: 'https://covenantuniversity.edu.ng' },
    { name: 'University of Lagos (UNILAG)', category: 'Education', rating: 4.2, reviewCount: 5000, location: 'Akoka, Lagos', isVerified: true, website: 'https://unilag.edu.ng' },
    { name: 'uLesson', category: 'Education', rating: 4.6, reviewCount: 1800, location: 'Abuja, Nigeria', isVerified: true, website: 'https://ulesson.com', description: 'Best learning app for students.' },
    { name: 'AltSchool Africa', category: 'Education', rating: 4.4, reviewCount: 1200, location: 'Lagos, Nigeria', isVerified: true, website: 'https://altschoolafrica.com' },
    { name: 'Andela', category: 'Education', rating: 4.7, reviewCount: 800, location: 'Lagos, Nigeria', isVerified: true, website: 'https://andela.com' },

    // --- HEALTH & WELLNESS ---
    { name: 'Lagoon Hospitals', category: 'Health', rating: 3.8, reviewCount: 600, location: 'Lagos, Nigeria', isVerified: true, website: 'https://www.lagoonhospitals.com' },
    { name: 'Reddington Hospital', category: 'Health', rating: 4.0, reviewCount: 550, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://reddingtonhospital.com' },
    { name: 'Total Health Trust (THT)', category: 'Health', rating: 3.2, reviewCount: 400, location: 'Lagos, Nigeria', isVerified: true, website: 'https://www.totalhealthtrust.com' },
    { name: 'Reliance HMO', category: 'Health', rating: 4.5, reviewCount: 1500, location: 'Lagos, Nigeria', isVerified: true, website: 'https://www.reliancehmo.com' },
    { name: 'i-Fitness Gym', category: 'Health', rating: 4.3, reviewCount: 2200, location: 'Lekki, Lagos', isVerified: true, website: 'https://ifitness.ng' },

    // --- INSURANCE ---
    { name: 'AXA Mansard', category: 'Insurance', rating: 4.1, reviewCount: 1200, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.axamansard.com' },
    { name: 'Leadway Assurance', category: 'Insurance', rating: 4.2, reviewCount: 1400, location: 'Surulere, Lagos', isVerified: true, website: 'https://www.leadway.com' },
    { name: 'AIICO Insurance', category: 'Insurance', rating: 3.9, reviewCount: 900, location: 'Lagos Island, Lagos', isVerified: true, website: 'https://www.aiicoplc.com' },

    // --- LOGISTICS ---
    { name: 'GIG Logistics (GIGL)', category: 'Logistics', rating: 3.7, reviewCount: 8500, location: 'Lagos, Nigeria', isVerified: true, website: 'https://giglogistics.com' },
    { name: 'Red Star Express (FedEx)', category: 'Logistics', rating: 3.9, reviewCount: 1100, location: 'Isolo, Lagos', isVerified: true, website: 'https://redstarplc.com' },
    { name: 'DHL Nigeria', category: 'Logistics', rating: 4.0, reviewCount: 3000, location: 'Isolo, Lagos', isVerified: true, website: 'https://www.dhl.com/ng-en' },
    { name: 'Kwik Delivery', category: 'Logistics', rating: 3.8, reviewCount: 1500, location: 'Yaba, Lagos', isVerified: true, website: 'https://kwik.delivery' },

    // --- FOOD & BEVERAGE ---
    { name: 'Chicken Republic', category: 'Food & Drink', rating: 4.1, reviewCount: 6000, location: 'Lagos, Nigeria', isVerified: true, website: 'https://www.chicken-republic.com' },
    { name: 'The Place', category: 'Food & Drink', rating: 4.0, reviewCount: 4500, location: 'Lekki, Lagos', isVerified: true, website: 'https://www.theplace.com.ng' },
    { name: 'Domino\'s Pizza Nigeria', category: 'Food & Drink', rating: 3.9, reviewCount: 5200, location: 'Lagos, Nigeria', isVerified: true, website: 'https://www.dominos.ng' },
    { name: 'Cold Stone Creamery', category: 'Food & Drink', rating: 4.4, reviewCount: 3800, location: 'Lagos, Nigeria', isVerified: true, website: 'https://coldstonecreamery.ng' },
    { name: 'Mega Chicken', category: 'Food & Drink', rating: 4.2, reviewCount: 2200, location: 'Iota, Lagos', isVerified: true },

    // --- MEDIA & ENTERTAINMENT ---
    { name: 'MultiChoice (DStv)', category: 'Media', rating: 3.1, reviewCount: 12000, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.dstvafrica.com' },
    { name: 'Startimes', category: 'Media', rating: 3.5, reviewCount: 4500, location: 'Mushin, Lagos', isVerified: true, website: 'https://www.startimestv.com' },
    { name: 'Netflix Nigeria', category: 'Media', rating: 4.5, reviewCount: 8000, location: 'Online', isVerified: true, website: 'https://www.netflix.com/ng' },
    { name: 'Filmhouse Cinemas', category: 'Media', rating: 4.3, reviewCount: 3500, location: 'Lekki, Lagos', isVerified: true, website: 'https://friendship-cinemas.com' }, // Placeholder URL structure
    { name: 'Linda Ikeji\'s Blog', category: 'Media', rating: 3.6, reviewCount: 5000, location: 'Online', isVerified: false, website: 'https://www.lindaikejisblog.com' },

    // --- ENERGY ---
    { name: 'Ikeja Electric', category: 'Energy', rating: 2.5, reviewCount: 15000, location: 'Ikeja, Lagos', isVerified: true, website: 'https://www.ikejaelectric.com' },
    { name: 'Eko Electricity Distribution', category: 'Energy', rating: 2.8, reviewCount: 12000, location: 'Marina, Lagos', isVerified: true, website: 'https://ekedp.com' },
    { name: 'Oando PLC', category: 'Energy', rating: 3.9, reviewCount: 800, location: 'Victoria Island, Lagos', isVerified: true, website: 'https://www.oandoplc.com' },
    { name: 'NNPC Retail', category: 'Energy', rating: 3.5, reviewCount: 2500, location: 'Abuja, Nigeria', isVerified: true, website: 'https://nnpcgroup.com' }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Optional: clear existing if you want a clean slate, or just upsert/append
        // For a seed script, usually clearing is safer to avoid duplicates unless we check existence.
        // Let's clear for now to ensure clean "expanded" state.

        console.log('Clearing existing businesses...');
        await Business.deleteMany({});

        console.log(`Seeding ${businesses.length} businesses across ${new Set(businesses.map(b => b.category)).size} categories...`);

        const businessesWithCategories = businesses.map(b => ({
            ...b,
            categories: [b.category] // Populate new array field based on old single category
        }));

        await Business.insertMany(businessesWithCategories);
        console.log('Successfully seeded expanded business list!');

        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();

require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/Business');

const PROD_URI = process.env.MONGODB_URI;

const businesses = [
    // BANKS (25)
    { name: 'Zenith Bank', category: 'Banks', location: 'Lagos', description: 'Leading Nigerian bank with excellent customer service', website: 'https://www.zenithbank.com', phone: '+234-1-2787000', rating: 4.5, reviewCount: 120, isVerified: true },
    { name: 'GTBank (Guaranty Trust Bank)', category: 'Banks', location: 'Lagos', description: 'Innovative banking solutions for individuals and businesses', website: 'https://www.gtbank.com', phone: '+234-1-4480000', rating: 4.6, reviewCount: 150, isVerified: true },
    { name: 'First Bank of Nigeria', category: 'Banks', location: 'Lagos', description: 'Nigeria\'s oldest bank with nationwide coverage', website: 'https://www.firstbanknigeria.com', phone: '+234-1-9052720', rating: 4.3, reviewCount: 200, isVerified: true },
    { name: 'Access Bank', category: 'Banks', location: 'Lagos', description: 'Comprehensive banking services with digital solutions', website: 'https://www.accessbankplc.com', phone: '+234-1-2712005', rating: 4.4, reviewCount: 180, isVerified: true },
    { name: 'United Bank for Africa (UBA)', category: 'Banks', location: 'Lagos', description: 'Pan-African bank serving millions across Africa', website: 'https://www.ubagroup.com', phone: '+234-1-2808822', rating: 4.2, reviewCount: 160, isVerified: true },
    { name: 'Ecobank Nigeria', category: 'Banks', location: 'Lagos', description: 'Pan-African banking with strong Nigerian presence', website: 'https://www.ecobank.com', phone: '+234-1-2700000', rating: 4.1, reviewCount: 95, isVerified: true },
    { name: 'Stanbic IBTC Bank', category: 'Banks', location: 'Lagos', description: 'Premium banking services for corporate and retail', website: 'https://www.stanbicibtcbank.com', phone: '+234-1-4227000', rating: 4.5, reviewCount: 110, isVerified: true },
    { name: 'Fidelity Bank', category: 'Banks', location: 'Lagos', description: 'Reliable banking partner for Nigerians', website: 'https://www.fidelitybank.ng', phone: '+234-1-4485252', rating: 4.3, reviewCount: 88, isVerified: true },
    { name: 'Union Bank of Nigeria', category: 'Banks', location: 'Lagos', description: 'Heritage bank with modern banking solutions', website: 'https://www.unionbankng.com', phone: '+234-1-2808822', rating: 4.0, reviewCount: 75, isVerified: true },
    { name: 'Sterling Bank', category: 'Banks', location: 'Lagos', description: 'Alternative banking with focus on SMEs', website: 'https://www.sterlingbankng.com', phone: '+234-1-4484481', rating: 4.2, reviewCount: 92, isVerified: true },
    { name: 'Wema Bank', category: 'Banks', location: 'Lagos', description: 'Nigeria\'s longest surviving indigenous bank', website: 'https://www.wemabank.com', phone: '+234-1-2778600', rating: 4.1, reviewCount: 68, isVerified: true },
    { name: 'Polaris Bank', category: 'Banks', location: 'Lagos', description: 'Customer-focused banking solutions', website: 'https://www.polarisbanklimited.com', phone: '+234-1-4485500', rating: 4.0, reviewCount: 54, isVerified: true },
    { name: 'Heritage Bank', category: 'Banks', location: 'Lagos', description: 'Innovative banking for entrepreneurs', website: 'https://www.heritagebank.com', phone: '+234-1-4618800', rating: 4.2, reviewCount: 62, isVerified: true },
    { name: 'Keystone Bank', category: 'Banks', location: 'Lagos', description: 'Reliable banking partner', website: 'https://www.keystonebankng.com', phone: '+234-1-2802000', rating: 3.9, reviewCount: 45, isVerified: true },
    { name: 'Unity Bank', category: 'Banks', location: 'Lagos', description: 'Banking for all Nigerians', website: 'https://www.unitybank.com', phone: '+234-1-2715000', rating: 3.8, reviewCount: 38, isVerified: true },
    { name: 'Citibank Nigeria', category: 'Banks', location: 'Lagos', description: 'International banking excellence', website: 'https://www.citigroup.com/nigeria', phone: '+234-1-2700500', rating: 4.6, reviewCount: 72, isVerified: true },
    { name: 'Standard Chartered Bank', category: 'Banks', location: 'Lagos', description: 'Global bank with local expertise', website: 'https://www.sc.com/ng', phone: '+234-1-2365000', rating: 4.5, reviewCount: 85, isVerified: true },
    { name: 'FCMB (First City Monument Bank)', category: 'Banks', location: 'Lagos', description: 'Progressive banking solutions', website: 'https://www.fcmb.com', phone: '+234-1-2798800', rating: 4.3, reviewCount: 98, isVerified: true },
    { name: 'Providus Bank', category: 'Banks', location: 'Lagos', description: 'Corporate and commercial banking', website: 'https://www.providusbank.com', phone: '+234-1-2369000', rating: 4.1, reviewCount: 42, isVerified: true },
    { name: 'Jaiz Bank', category: 'Banks', location: 'Abuja', description: 'Nigeria\'s first non-interest bank', website: 'https://www.jaizbank.com', phone: '+234-1-4605840', rating: 4.0, reviewCount: 56, isVerified: true },
    { name: 'Globus Bank', category: 'Banks', location: 'Lagos', description: 'Digital-first banking experience', website: 'https://www.globusbank.com', phone: '+234-1-2369000', rating: 4.2, reviewCount: 48, isVerified: true },
    { name: 'Suntrust Bank', category: 'Banks', location: 'Abuja', description: 'Innovative banking for SMEs', website: 'https://www.suntrust.com.ng', phone: '+234-1-2369000', rating: 4.0, reviewCount: 35, isVerified: true },
    { name: 'Titan Trust Bank', category: 'Banks', location: 'Abuja', description: 'Modern banking solutions', website: 'https://www.titantrust.com', phone: '+234-1-2369000', rating: 3.9, reviewCount: 28, isVerified: true },
    { name: 'Parallex Bank', category: 'Banks', location: 'Lagos', description: 'Digital banking for the future', website: 'https://www.parallexbank.com', phone: '+234-1-2369000', rating: 4.1, reviewCount: 31, isVerified: true },
    { name: 'Premium Trust Bank', category: 'Banks', location: 'Lagos', description: 'Banking excellence', website: 'https://www.premiumtrustbank.com', phone: '+234-1-2369000', rating: 3.8, reviewCount: 22, isVerified: true },

    // ECOMMERCE (25)
    { name: 'Jumia Nigeria', category: 'Ecommerce', location: 'Lagos', description: 'Nigeria\'s largest online marketplace', website: 'https://www.jumia.com.ng', phone: '+234-1-8888888', rating: 4.3, reviewCount: 5200, isVerified: true },
    { name: 'Konga', category: 'Ecommerce', location: 'Lagos', description: 'Leading e-commerce platform with fast delivery', website: 'https://www.konga.com', phone: '+234-1-8888889', rating: 4.2, reviewCount: 3800, isVerified: true },
    { name: 'Jiji', category: 'Ecommerce', location: 'Lagos', description: 'Buy and sell anything online', website: 'https://www.jiji.ng', phone: '+234-1-8888890', rating: 4.4, reviewCount: 4500, isVerified: true },
    { name: 'Slot Systems', category: 'Ecommerce', location: 'Lagos', description: 'Electronics and gadgets retailer', website: 'https://www.slot.ng', phone: '+234-1-4540213', rating: 4.1, reviewCount: 1200, isVerified: true },
    { name: 'PayPorte', category: 'Ecommerce', location: 'Lagos', description: 'Fashion and lifestyle marketplace', website: 'https://www.payporte.com', phone: '+234-1-8888891', rating: 3.9, reviewCount: 850, isVerified: true },
    { name: 'Dealdey', category: 'Ecommerce', location: 'Lagos', description: 'Daily deals and discounts', website: 'https://www.dealdey.com', phone: '+234-1-8888892', rating: 4.0, reviewCount: 620, isVerified: true },
    { name: 'Yudala', category: 'Ecommerce', location: 'Lagos', description: 'Omnichannel retail experience', website: 'https://www.yudala.com', phone: '+234-1-8888893', rating: 4.1, reviewCount: 540, isVerified: true },
    { name: 'Shoprite Nigeria', category: 'Ecommerce', location: 'Lagos', description: 'Groceries and household items', website: 'https://www.shoprite.co.za/ng', phone: '+234-1-2808000', rating: 4.5, reviewCount: 2100, isVerified: true },
    { name: 'Spar Nigeria', category: 'Ecommerce', location: 'Lagos', description: 'Quality groceries and fresh produce', website: 'https://www.spar.ng', phone: '+234-1-2808001', rating: 4.3, reviewCount: 980, isVerified: true },
    { name: 'Wakanow', category: 'Ecommerce', location: 'Lagos', description: 'Travel bookings and packages', website: 'https://www.wakanow.com', phone: '+234-1-2808002', rating: 4.2, reviewCount: 1450, isVerified: true },
    { name: 'Travelstart Nigeria', category: 'Ecommerce', location: 'Lagos', description: 'Flight and hotel bookings', website: 'https://www.travelstart.com.ng', phone: '+234-1-2808003', rating: 4.1, reviewCount: 890, isVerified: true },
    { name: 'Hotels.ng', category: 'Ecommerce', location: 'Lagos', description: 'Hotel bookings across Nigeria', website: 'https://www.hotels.ng', phone: '+234-1-2808004', rating: 4.4, reviewCount: 1650, isVerified: true },
    { name: 'Supermart.ng', category: 'Ecommerce', location: 'Lagos', description: 'Online grocery shopping', website: 'https://www.supermart.ng', phone: '+234-1-2808005', rating: 4.2, reviewCount: 720, isVerified: true },
    { name: 'Gloo.ng', category: 'Ecommerce', location: 'Lagos', description: 'Fashion and beauty products', website: 'https://www.gloo.ng', phone: '+234-1-2808006', rating: 4.0, reviewCount: 450, isVerified: true },
    { name: 'Zando Nigeria', category: 'Ecommerce', location: 'Lagos', description: 'Fashion marketplace', website: 'https://www.zando.com.ng', phone: '+234-1-2808007', rating: 4.1, reviewCount: 580, isVerified: true },
    { name: 'Kaymu Nigeria', category: 'Ecommerce', location: 'Lagos', description: 'Online shopping platform', website: 'https://www.kaymu.com.ng', phone: '+234-1-2808008', rating: 3.9, reviewCount: 420, isVerified: true },
    { name: 'OLX Nigeria', category: 'Ecommerce', location: 'Lagos', description: 'Classified ads marketplace', website: 'https://www.olx.com.ng', phone: '+234-1-2808009', rating: 4.3, reviewCount: 2800, isVerified: true },
    { name: 'Vconnect', category: 'Ecommerce', location: 'Lagos', description: 'Business directory and marketplace', website: 'https://www.vconnect.com', phone: '+234-1-2808010', rating: 4.0, reviewCount: 650, isVerified: true },
    { name: 'Cheki Nigeria', category: 'Ecommerce', location: 'Lagos', description: 'Cars for sale', website: 'https://www.cheki.com.ng', phone: '+234-1-2808011', rating: 4.2, reviewCount: 1100, isVerified: true },
    { name: 'Cars45', category: 'Ecommerce', location: 'Lagos', description: 'Buy and sell cars easily', website: 'https://www.cars45.com', phone: '+234-1-2808012', rating: 4.4, reviewCount: 1350, isVerified: true },
    { name: 'Autochek', category: 'Ecommerce', location: 'Lagos', description: 'Verified used cars', website: 'https://www.autochek.africa', phone: '+234-1-2808013', rating: 4.3, reviewCount: 920, isVerified: true },
    { name: 'Carmudi Nigeria', category: 'Ecommerce', location: 'Lagos', description: 'New and used cars marketplace', website: 'https://www.carmudi.com.ng', phone: '+234-1-2808014', rating: 4.1, reviewCount: 780, isVerified: true },
    { name: 'Private Property Nigeria', category: 'Ecommerce', location: 'Lagos', description: 'Real estate listings', website: 'https://www.privateproperty.com.ng', phone: '+234-1-2808015', rating: 4.2, reviewCount: 850, isVerified: true },
    { name: 'ToLet.com.ng', category: 'Ecommerce', location: 'Lagos', description: 'Property rentals and sales', website: 'https://www.tolet.com.ng', phone: '+234-1-2808016', rating: 4.0, reviewCount: 690, isVerified: true },
    { name: 'Nigeria Property Centre', category: 'Ecommerce', location: 'Lagos', description: 'Real estate marketplace', website: 'https://www.nigeriapropertycentre.com', phone: '+234-1-2808017', rating: 4.3, reviewCount: 1240, isVerified: true },

    // TELECOM (25)
    { name: 'MTN Nigeria', category: 'Telecom', location: 'Lagos', description: 'Nigeria\'s largest mobile network', website: 'https://www.mtnonline.com', phone: '180', rating: 4.2, reviewCount: 8500, isVerified: true },
    { name: 'Airtel Nigeria', category: 'Telecom', location: 'Lagos', description: 'Affordable data and voice services', website: 'https://www.airtel.com.ng', phone: '111', rating: 4.0, reviewCount: 6200, isVerified: true },
    { name: 'Glo Mobile', category: 'Telecom', location: 'Lagos', description: 'Grandmaster of data', website: 'https://www.gloworld.com', phone: '121', rating: 3.8, reviewCount: 5800, isVerified: true },
    { name: '9mobile', category: 'Telecom', location: 'Lagos', description: 'Innovative telecom solutions', website: 'https://www.9mobile.com.ng', phone: '200', rating: 3.7, reviewCount: 3200, isVerified: true },
    { name: 'Spectranet', category: 'Telecom', location: 'Lagos', description: '4G LTE internet service', website: 'https://www.spectranet.com.ng', phone: '+234-1-4535000', rating: 4.1, reviewCount: 1200, isVerified: true },
    { name: 'Smile Nigeria', category: 'Telecom', location: 'Lagos', description: '4G LTE broadband', website: 'https://www.smilecoms.com', phone: '+234-1-8888888', rating: 4.0, reviewCount: 980, isVerified: true },
    { name: 'Swift Networks', category: 'Telecom', location: 'Lagos', description: 'Fiber optic internet', website: 'https://www.swiftng.com', phone: '+234-1-4535001', rating: 4.3, reviewCount: 850, isVerified: true },
    { name: 'Tizeti Network', category: 'Telecom', location: 'Lagos', description: 'Unlimited internet', website: 'https://www.tizeti.com', phone: '+234-1-4535002', rating: 4.2, reviewCount: 720, isVerified: true },
    { name: 'Coollink', category: 'Telecom', location: 'Lagos', description: 'Broadband internet provider', website: 'https://www.coollink.ng', phone: '+234-1-4535003', rating: 4.0, reviewCount: 450, isVerified: true },
    { name: 'Ipnx Nigeria', category: 'Telecom', location: 'Lagos', description: 'Enterprise connectivity', website: 'https://www.ipnxnigeria.net', phone: '+234-1-4535004', rating: 4.1, reviewCount: 380, isVerified: true },
    { name: 'MainOne', category: 'Telecom', location: 'Lagos', description: 'Wholesale connectivity', website: 'https://www.mainone.net', phone: '+234-1-4535005', rating: 4.4, reviewCount: 520, isVerified: true },
    { name: 'Liquid Telecom Nigeria', category: 'Telecom', location: 'Lagos', description: 'Business connectivity solutions', website: 'https://www.liquidtelecom.com', phone: '+234-1-4535006', rating: 4.2, reviewCount: 410, isVerified: true },
    { name: 'Vodacom Business Nigeria', category: 'Telecom', location: 'Lagos', description: 'Enterprise telecom', website: 'https://www.vodacom.com.ng', phone: '+234-1-4535007', rating: 4.0, reviewCount: 290, isVerified: true },
    { name: 'Globacom Glo-1', category: 'Telecom', location: 'Lagos', description: 'Submarine cable system', website: 'https://www.glo-1.com', phone: '+234-1-4535008', rating: 4.3, reviewCount: 180, isVerified: true },
    { name: 'Suburban Fiber', category: 'Telecom', location: 'Lagos', description: 'Fiber to the home', website: 'https://www.suburbanfiber.com', phone: '+234-1-4535009', rating: 4.1, reviewCount: 320, isVerified: true },
    { name: 'Fiberone Broadband', category: 'Telecom', location: 'Lagos', description: 'High-speed internet', website: 'https://www.fiberone.ng', phone: '+234-1-4535010', rating: 4.2, reviewCount: 450, isVerified: true },
    { name: 'Hyperia', category: 'Telecom', location: 'Lagos', description: 'Wireless broadband', website: 'https://www.hyperia.com', phone: '+234-1-4535011', rating: 3.9, reviewCount: 220, isVerified: true },
    { name: 'Cobranet', category: 'Telecom', location: 'Lagos', description: 'Internet service provider', website: 'https://www.cobranet.ng', phone: '+234-1-4535012', rating: 4.0, reviewCount: 280, isVerified: true },
    { name: 'Starcomms', category: 'Telecom', location: 'Lagos', description: 'CDMA network provider', website: 'https://www.starcomms.com', phone: '+234-1-4535013', rating: 3.6, reviewCount: 150, isVerified: true },
    { name: 'Visafone', category: 'Telecom', location: 'Lagos', description: 'CDMA services', website: 'https://www.visafone.com.ng', phone: '+234-1-4535014', rating: 3.5, reviewCount: 120, isVerified: true },
    { name: 'Multilinks', category: 'Telecom', location: 'Lagos', description: 'Broadband services', website: 'https://www.multilinks.com', phone: '+234-1-4535015', rating: 3.7, reviewCount: 180, isVerified: true },
    { name: 'Zoom Mobile', category: 'Telecom', location: 'Lagos', description: 'CDMA network', website: 'https://www.zoommobile.ng', phone: '+234-1-4535016', rating: 3.4, reviewCount: 95, isVerified: true },
    { name: 'Intercellular Nigeria', category: 'Telecom', location: 'Lagos', description: 'Telecom infrastructure', website: 'https://www.intercellular.com.ng', phone: '+234-1-4535017', rating: 4.0, reviewCount: 210, isVerified: true },
    { name: 'IHS Towers Nigeria', category: 'Telecom', location: 'Lagos', description: 'Telecom tower infrastructure', website: 'https://www.ihstowers.com', phone: '+234-1-4535018', rating: 4.2, reviewCount: 160, isVerified: true },
    { name: 'American Tower Nigeria', category: 'Telecom', location: 'Lagos', description: 'Tower infrastructure provider', website: 'https://www.americantower.com', phone: '+234-1-4535019', rating: 4.1, reviewCount: 140, isVerified: true },

    // FINTECH (25)
    { name: 'Kuda Bank', category: 'Fintech', location: 'Lagos', description: 'The bank of the free', website: 'https://www.kuda.com', phone: '+234-1-8888888', rating: 4.6, reviewCount: 3500, isVerified: true },
    { name: 'OPay', category: 'Fintech', location: 'Lagos', description: 'Mobile money and payments', website: 'https://www.opayweb.com', phone: '+234-1-8888889', rating: 4.4, reviewCount: 4200, isVerified: true },
    { name: 'PalmPay', category: 'Fintech', location: 'Lagos', description: 'Digital financial services', website: 'https://www.palmpay.com', phone: '+234-1-8888890', rating: 4.3, reviewCount: 3800, isVerified: true },
    { name: 'PiggyVest', category: 'Fintech', location: 'Lagos', description: 'Save and invest online', website: 'https://www.piggyvest.com', phone: '+234-1-8888891', rating: 4.7, reviewCount: 5200, isVerified: true },
    { name: 'Moniepoint', category: 'Fintech', location: 'Lagos', description: 'Business banking and payments', website: 'https://www.moniepoint.com', phone: '+234-1-8888892', rating: 4.5, reviewCount: 2800, isVerified: true },
    { name: 'Paystack', category: 'Fintech', location: 'Lagos', description: 'Online payment gateway', website: 'https://www.paystack.com', phone: '+234-1-8888893', rating: 4.8, reviewCount: 1850, isVerified: true },
    { name: 'Flutterwave', category: 'Fintech', location: 'Lagos', description: 'Payment infrastructure for Africa', website: 'https://www.flutterwave.com', phone: '+234-1-8888894', rating: 4.7, reviewCount: 1620, isVerified: true },
    { name: 'Carbon (Paylater)', category: 'Fintech', location: 'Lagos', description: 'Digital lending and banking', website: 'https://www.getcarbon.co', phone: '+234-1-8888895', rating: 4.2, reviewCount: 2400, isVerified: true },
    { name: 'FairMoney', category: 'Fintech', location: 'Lagos', description: 'Instant loans and banking', website: 'https://www.fairmoney.io', phone: '+234-1-8888896', rating: 4.1, reviewCount: 1980, isVerified: true },
    { name: 'Branch', category: 'Fintech', location: 'Lagos', description: 'Mobile loans and payments', website: 'https://www.branch.co', phone: '+234-1-8888897', rating: 4.0, reviewCount: 1650, isVerified: true },
    { name: 'Renmoney', category: 'Fintech', location: 'Lagos', description: 'Personal loans', website: 'https://www.renmoney.com', phone: '+234-1-8888898', rating: 3.9, reviewCount: 1420, isVerified: true },
    { name: 'Cowrywise', category: 'Fintech', location: 'Lagos', description: 'Automated savings and investment', website: 'https://www.cowrywise.com', phone: '+234-1-8888899', rating: 4.6, reviewCount: 2100, isVerified: true },
    { name: 'Bamboo', category: 'Fintech', location: 'Lagos', description: 'Invest in US stocks', website: 'https://www.bamboo.africa', phone: '+234-1-8888900', rating: 4.5, reviewCount: 980, isVerified: true },
    { name: 'Risevest', category: 'Fintech', location: 'Lagos', description: 'Dollar investment platform', website: 'https://www.risevest.com', phone: '+234-1-8888901', rating: 4.4, reviewCount: 1250, isVerified: true },
    { name: 'Chaka', category: 'Fintech', location: 'Lagos', description: 'Global stock trading', website: 'https://www.chaka.com', phone: '+234-1-8888902', rating: 4.3, reviewCount: 720, isVerified: true },
    { name: 'Trove Finance', category: 'Fintech', location: 'Lagos', description: 'Invest in global markets', website: 'https://www.trove.finance', phone: '+234-1-8888903', rating: 4.4, reviewCount: 850, isVerified: true },
    { name: 'Alat by Wema', category: 'Fintech', location: 'Lagos', description: 'Digital-only bank', website: 'https://www.alat.ng', phone: '+234-1-8888904', rating: 4.2, reviewCount: 1580, isVerified: true },
    { name: 'VFD Microfinance Bank', category: 'Fintech', location: 'Lagos', description: 'Digital microfinance', website: 'https://www.vfdmfb.com', phone: '+234-1-8888905', rating: 4.1, reviewCount: 680, isVerified: true },
    { name: 'Sparkle', category: 'Fintech', location: 'Lagos', description: 'Digital banking', website: 'https://www.sparkle.ng', phone: '+234-1-8888906', rating: 4.0, reviewCount: 520, isVerified: true },
    { name: 'Rubies Bank', category: 'Fintech', location: 'Lagos', description: 'Microfinance banking', website: 'https://www.rubiesbank.com', phone: '+234-1-8888907', rating: 3.9, reviewCount: 420, isVerified: true },
    { name: 'Paga', category: 'Fintech', location: 'Lagos', description: 'Mobile money platform', website: 'https://www.mypaga.com', phone: '+234-1-8888908', rating: 4.3, reviewCount: 2850, isVerified: true },
    { name: 'Quickteller', category: 'Fintech', location: 'Lagos', description: 'Bill payments and transfers', website: 'https://www.quickteller.com', phone: '+234-1-8888909', rating: 4.2, reviewCount: 1920, isVerified: true },
    { name: 'Remita', category: 'Fintech', location: 'Lagos', description: 'Payment and collection platform', website: 'https://www.remita.net', phone: '+234-1-8888910', rating: 4.1, reviewCount: 1450, isVerified: true },
    { name: 'Interswitch', category: 'Fintech', location: 'Lagos', description: 'Payment processing', website: 'https://www.interswitchgroup.com', phone: '+234-1-8888911', rating: 4.4, reviewCount: 1680, isVerified: true },
    { name: 'Verve', category: 'Fintech', location: 'Lagos', description: 'Nigerian payment card', website: 'https://www.vervecard.com', phone: '+234-1-8888912', rating: 4.2, reviewCount: 2200, isVerified: true },
];

async function seedProduction() {
    try {
        await mongoose.connect(PROD_URI);
        console.log('Connected to production database');

        // Clear existing businesses
        await Business.deleteMany({});
        console.log('Cleared existing businesses');

        // Insert new businesses
        await Business.insertMany(businesses);
        console.log(`✅ Successfully added ${businesses.length} businesses to production!`);

        // Show summary
        const counts = await Business.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        console.log('\n📊 Business Distribution:');
        counts.forEach(c => {
            console.log(`${c._id}: ${c.count} businesses`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedProduction();

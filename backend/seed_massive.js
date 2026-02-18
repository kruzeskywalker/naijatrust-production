require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/Business');

// REAL NIGERIAN BUSINESSES DATA (EXPANDED LIST)
const realBusinesses = [
    // --- BANKS ---
    { name: 'Zenith Bank', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Leading Nigerian bank with excellent customer service', website: 'https://www.zenithbank.com', phone: '+234-1-2787000' },
    { name: 'GTBank', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Innovative banking solutions for individuals and businesses', website: 'https://www.gtbank.com', phone: '+234-1-4480000' },
    { name: 'First Bank', category: 'Banks', location: 'Marina, Lagos', description: 'Nigeria\'s oldest bank with nationwide coverage', website: 'https://www.firstbanknigeria.com', phone: '+234-1-9052720' },
    { name: 'Access Bank', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Comprehensive banking services with digital solutions', website: 'https://www.accessbankplc.com', phone: '+234-1-2712005' },
    { name: 'UBA', category: 'Banks', location: 'Marina, Lagos', description: 'Pan-African bank serving millions across Africa', website: 'https://www.ubagroup.com', phone: '+234-1-2808822' },
    { name: 'Ecobank', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Pan-African banking with strong Nigerian presence', website: 'https://www.ecobank.com', phone: '+234-1-2700000' },
    { name: 'Stanbic IBTC', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Premium banking services for corporate and retail', website: 'https://www.stanbicibtcbank.com', phone: '+234-1-4227000' },
    { name: 'Fidelity Bank', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Reliable banking partner for Nigerians', website: 'https://www.fidelitybank.ng', phone: '+234-1-4485252' },
    { name: 'Union Bank', category: 'Banks', location: 'Marina, Lagos', description: 'Heritage bank with modern banking solutions', website: 'https://www.unionbankng.com', phone: '+234-1-2808822' },
    { name: 'Sterling Bank', category: 'Banks', location: 'Marina, Lagos', description: 'Alternative banking with focus on SMEs', website: 'https://www.sterlingbankng.com', phone: '+234-1-4484481' },
    { name: 'Wema Bank', category: 'Banks', location: 'Marina, Lagos', description: 'Nigeria\'s longest surviving indigenous bank', website: 'https://www.wemabank.com', phone: '+234-1-2778600' },
    { name: 'Polaris Bank', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Customer-focused banking solutions', website: 'https://www.polarisbanklimited.com', phone: '+234-1-4485500' },
    { name: 'Heritage Bank', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Innovative banking for entrepreneurs', website: 'https://www.heritagebank.com', phone: '+234-1-4618800' },
    { name: 'Keystone Bank', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Reliable banking partner', website: 'https://www.keystonebankng.com', phone: '+234-1-2802000' },
    { name: 'Unity Bank', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Banking for all Nigerians', website: 'https://www.unitybank.com', phone: '+234-1-2715000' },
    { name: 'FCMB', category: 'Banks', location: 'Marina, Lagos', description: 'Progressive banking solutions', website: 'https://www.fcmb.com', phone: '+234-1-2798800' },
    { name: 'Providus Bank', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Corporate and commercial banking', website: 'https://www.providusbank.com', phone: '+234-1-2369000' },
    { name: 'Jaiz Bank', category: 'Banks', location: 'Central Business District, Abuja', description: 'Nigeria\'s first non-interest bank', website: 'https://www.jaizbank.com', phone: '+234-1-4605840' },
    { name: 'Globus Bank', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Digital-first banking experience', website: 'https://www.globusbank.com', phone: '+234-1-2369000' },
    { name: 'Suntrust Bank', category: 'Banks', location: 'Victoria Island, Lagos', description: 'Innovative banking for SMEs', website: 'https://www.suntrust.com.ng', phone: '+234-1-2369000' },

    // --- TELECOM ---
    { name: 'MTN Nigeria', category: 'Telecom', location: 'Ikoyi, Lagos', description: 'Nigeria\'s largest mobile network', website: 'https://www.mtnonline.com', phone: '180' },
    { name: 'Airtel Nigeria', category: 'Telecom', location: 'Banana Island, Lagos', description: 'Affordable data and voice services', website: 'https://www.airtel.com.ng', phone: '111' },
    { name: 'Glo Mobile', category: 'Telecom', location: 'Victoria Island, Lagos', description: 'Grandmaster of data', website: 'https://www.gloworld.com', phone: '121' },
    { name: '9mobile', category: 'Telecom', location: 'Banana Island, Lagos', description: 'Innovative telecom solutions', website: 'https://www.9mobile.com.ng', phone: '200' },
    { name: 'Spectranet', category: 'Telecom', location: 'Ikeja, Lagos', description: '4G LTE internet service', website: 'https://www.spectranet.com.ng', phone: '+234-1-4535000' },
    { name: 'Smile Nigeria', category: 'Telecom', location: 'Victoria Island, Lagos', description: '4G LTE broadband', website: 'https://www.smilecoms.com', phone: '+234-1-8888888' },
    { name: 'Swift Networks', category: 'Telecom', location: 'Victoria Island, Lagos', description: 'Fiber optic internet', website: 'https://www.swiftng.com', phone: '+234-1-4535001' },
    { name: 'Tizeti', category: 'Telecom', location: 'Lekki, Lagos', description: 'Unlimited internet', website: 'https://www.tizeti.com', phone: '+234-1-4535002' },
    { name: 'Ipnx Nigeria', category: 'Telecom', location: 'Victoria Island, Lagos', description: 'Enterprise connectivity', website: 'https://www.ipnxnigeria.net', phone: '+234-1-4535004' },
    { name: 'MainOne', category: 'Telecom', location: 'Victoria Island, Lagos', description: 'Wholesale connectivity', website: 'https://www.mainone.net', phone: '+234-1-4535005' },
    { name: 'Cobranet', category: 'Telecom', location: 'Victoria Island, Lagos', description: 'Internet service provider', website: 'https://www.cobranet.ng', phone: '+234-1-4535006' },
    { name: 'Coollink', category: 'Telecom', location: 'Victoria Island, Lagos', description: 'Broadband internet', website: 'https://www.coollink.ng', phone: '+234-1-4535007' },
    { name: 'Suburban Fiber', category: 'Telecom', location: 'Wuse, Abuja', description: 'Fiber optic network', website: 'https://www.suburbanfiber.com', phone: '+234-1-4535008' },
    { name: 'FiberOne', category: 'Telecom', location: 'Lekki, Lagos', description: 'Fiber to the home', website: 'https://www.fiberone.ng', phone: '+234-1-4535009' },

    // --- ECOMMERCE ---
    { name: 'Jumia', category: 'Ecommerce', location: 'Ikeja, Lagos', description: 'Nigeria\'s largest online marketplace', website: 'https://www.jumia.com.ng', phone: '+234-1-8888888' },
    { name: 'Konga', category: 'Ecommerce', location: 'Ikeja, Lagos', description: 'Leading e-commerce platform', website: 'https://www.konga.com', phone: '+234-1-8888889' },
    { name: 'Jiji', category: 'Ecommerce', location: 'Yaba, Lagos', description: 'Classifieds marketplace', website: 'https://www.jiji.ng', phone: '+234-1-8888890' },
    { name: 'Slot', category: 'Ecommerce', location: 'Ikeja, Lagos', description: 'Mobile phones and gadgets', website: 'https://www.slot.ng', phone: '+234-1-4540213' },
    { name: 'PayPorte', category: 'Ecommerce', location: 'Lekki, Lagos', description: 'Fashion and lifestyle', website: 'https://www.payporte.com', phone: '+234-1-8888891' },
    { name: 'Spar Nigeria', category: 'Ecommerce', location: 'Ilupeju, Lagos', description: 'Large supermarket chain', website: 'https://www.spar.ng', phone: '+234-1-2808001' },
    { name: 'Shoprite', category: 'Ecommerce', location: 'Ikeja, Lagos', description: 'Retail supermarket', website: 'https://www.shoprite.co.za', phone: '+234-1-2808000' },
    { name: 'Market Square', category: 'Ecommerce', location: 'Port Harcourt, Rivers', description: 'Neighborhood supermarket', website: 'https://www.marketsquareng.com', phone: '+234-1-2369000' },
    { name: 'Prince Ebeano', category: 'Ecommerce', location: 'Lekki, Lagos', description: 'Supermarket and grocery', website: 'https://www.ebeano.com', phone: '+234-1-2369000' },
    { name: 'Sahad Stores', category: 'Ecommerce', location: 'Central Area, Abuja', description: 'Large department store', website: 'https://www.sahadstores.com', phone: '+234-1-2369000' },
    { name: 'Justrite', category: 'Ecommerce', location: 'Ota, Ogun', description: 'Superstore chain', website: 'https://www.justrite.com.ng', phone: '+234-1-2369000' },
    { name: 'Addide', category: 'Ecommerce', location: 'Gbagada, Lagos', description: 'Neighborhood supermarket', website: 'https://www.addide.com', phone: '+234-1-2369000' },
    { name: 'Hubmart', category: 'Ecommerce', location: 'Victoria Island, Lagos', description: 'Grocery and fresh produce', website: 'https://www.hubmart.com', phone: '+234-1-2369000' },

    // --- FINTECH ---
    { name: 'Paystack', category: 'Fintech', location: 'Ikeja, Lagos', description: 'Modern payments for Africa', website: 'https://www.paystack.com', phone: '+234-1-8888893' },
    { name: 'Flutterwave', category: 'Fintech', location: 'Ikoyi, Lagos', description: 'Payment infrastructure', website: 'https://www.flutterwave.com', phone: '+234-1-8888894' },
    { name: 'Interswitch', category: 'Fintech', location: 'Victoria Island, Lagos', description: 'Digital payments and commerce', website: 'https://www.interswitchgroup.com', phone: '+234-1-8888911' },
    { name: 'Moniepoint', category: 'Fintech', location: 'Lekki, Lagos', description: 'Business banking', website: 'https://www.moniepoint.com', phone: '+234-1-8888892' },
    { name: 'Opay', category: 'Fintech', location: 'Ikeja, Lagos', description: 'Mobile money', website: 'https://www.opayweb.com', phone: '+234-1-8888889' },
    { name: 'PalmPay', category: 'Fintech', location: 'Ikeja, Lagos', description: 'Digital payments', website: 'https://www.palmpay.com', phone: '+234-1-8888890' },
    { name: 'Kuda', category: 'Fintech', location: 'Yaba, Lagos', description: 'Digital bank', website: 'https://www.kuda.com', phone: '+234-1-8888888' },
    { name: 'PiggyVest', category: 'Fintech', location: 'Ikeja, Lagos', description: 'Savings and investment', website: 'https://www.piggyvest.com', phone: '+234-1-8888891' },
    { name: 'Cowrywise', category: 'Fintech', location: 'Ikeja, Lagos', description: 'Wealth management', website: 'https://www.cowrywise.com', phone: '+234-1-8888899' },
    { name: 'Carbon', category: 'Fintech', location: 'Lekki, Lagos', description: 'Digital bank and loans', website: 'https://www.getcarbon.co', phone: '+234-1-8888895' },
    { name: 'Bamboo', category: 'Fintech', location: 'Lekki, Lagos', description: 'Investment platform', website: 'https://www.investbamboo.com', phone: '+234-1-8888896' },
    { name: 'Risevest', category: 'Fintech', location: 'Yaba, Lagos', description: 'Dollar investments', website: 'https://www.risevest.com', phone: '+234-1-8888897' },
    { name: 'FairMoney', category: 'Fintech', location: 'Ikeja, Lagos', description: 'Instant loans', website: 'https://www.fairmoney.io', phone: '+234-1-8888898' },
    { name: 'Paga', category: 'Fintech', location: 'Yaba, Lagos', description: 'Mobile payments', website: 'https://www.mypaga.com', phone: '+234-1-8888899' },
    { name: 'Remita', category: 'Fintech', location: 'Victoria Island, Lagos', description: 'Payment gateway', website: 'https://www.remita.net', phone: '+234-1-8888900' },

    // --- OIL & GAS / ENERGY ---
    { name: 'NNPC Retail', category: 'Energy', location: 'Central Business District, Abuja', description: 'National oil company retail arm', website: 'https://www.nnpcgroup.com', phone: '+234-1-2369000' },
    { name: 'TotalEnergies', category: 'Energy', location: 'Victoria Island, Lagos', description: 'Multi-energy company', website: 'https://www.totalenergies.ng', phone: '+234-1-2369000' },
    { name: 'Oando', category: 'Energy', location: 'Victoria Island, Lagos', description: 'Indigenous energy solutions', website: 'https://www.oandoplc.com', phone: '+234-1-2369000' },
    { name: 'MRS Oil', category: 'Energy', location: 'Apapa, Lagos', description: 'Downstream oil marketing', website: 'https://www.mrsoilnigplc.com', phone: '+234-1-2369000' },
    { name: 'Conoil', category: 'Energy', location: 'Marina, Lagos', description: 'Petroleum marketing', website: 'https://www.conoilplc.com', phone: '+234-1-2369000' },
    { name: 'Ardova (Forte Oil)', category: 'Energy', location: 'Victoria Island, Lagos', description: 'Energy solutions provider', website: 'https://www.ardovaplc.com', phone: '+234-1-2369000' },
    { name: 'Seplat Energy', category: 'Energy', location: 'Ikoyi, Lagos', description: 'Indigenous energy company', website: 'https://www.seplatenergy.com', phone: '+234-1-2369000' },
    { name: 'Rainoil', category: 'Energy', location: 'Lekki, Lagos', description: 'Downstream oil and gas', website: 'https://www.rainoil.com.ng', phone: '+234-1-2369000' },
    { name: 'Nipco', category: 'Energy', location: 'Apapa, Lagos', description: 'Petroleum storage and distribution', website: 'https://www.nipponplc.com', phone: '+234-1-2369000' },
    { name: 'Ikeja Electric', category: 'Energy', location: 'Ikeja, Lagos', description: 'Power distribution', website: 'https://www.ikejaelectric.com', phone: '+234-1-2369000' },
    { name: 'Eko Electricity', category: 'Energy', location: 'Marina, Lagos', description: 'Distribution company', website: 'https://www.ekedp.com', phone: '+234-1-2369000' },
    { name: 'Abuja Electricity', category: 'Energy', location: 'Wuse, Abuja', description: 'Power distribution', website: 'https://www.abujaelectricity.com', phone: '+234-1-2369000' },

    // --- FOOD & DRINK ---
    { name: 'Chicken Republic', category: 'Food & Drink', location: 'Gbagada, Lagos', description: 'QSR chain', website: 'https://www.chicken-republic.com', phone: '+234-1-2369000' },
    { name: 'Mr Bigg\'s', category: 'Food & Drink', location: 'Oregun, Lagos', description: 'Fast food restaurant', website: 'https://www.mrbiggs.com', phone: '+234-1-2369000' },
    { name: 'Tantalizers', category: 'Food & Drink', location: 'Festac, Lagos', description: 'Fast food and outdoor catering', website: 'https://www.tantalizersng.com', phone: '+234-1-2369000' },
    { name: 'Domino\'s Pizza', category: 'Food & Drink', location: 'Lekki, Lagos', description: 'Pizza delivery chain', website: 'https://www.dominos.ng', phone: '+234-1-2369000' },
    { name: 'Cold Stone Creamery', category: 'Food & Drink', location: 'Lekki, Lagos', description: 'Ice cream chain', website: 'https://www.coldstonecreamery.ng', phone: '+234-1-2369000' },
    { name: 'Kilimanjaro', category: 'Food & Drink', location: 'Port Harcourt, Rivers', description: 'Restaurant chain', website: 'https://www.kilimanjaro-restaurants.com', phone: '+234-1-2369000' },
    { name: 'The Place', category: 'Food & Drink', location: 'Lekki, Lagos', description: 'Restaurant and club', website: 'https://www.theplace.com.ng', phone: '+234-1-2369000' },
    { name: 'Sweet Sensation', category: 'Food & Drink', location: 'Ikeja, Lagos', description: 'Confectionery and restaurant', website: 'https://www.sweetsensation.ng', phone: '+234-1-2369000' },
    { name: 'Mega Chicken', category: 'Food & Drink', location: 'Lekki, Lagos', description: 'Restaurant', website: 'https://www.megachicken.com.ng', phone: '+234-1-2369000' },
    { name: 'Tastee Fried Chicken', category: 'Food & Drink', location: 'Victoria Island, Lagos', description: 'Quick service restaurant', website: 'https://www.tasteenigeria.com', phone: '+234-1-2369000' },
    { name: 'Burger King Nigeria', category: 'Food & Drink', location: 'Victoria Island, Lagos', description: 'Global burger chain', website: 'https://www.burger-king.ng', phone: '+234-1-2369000' },
    { name: 'KFC Nigeria', category: 'Food & Drink', location: 'Ikeja, Lagos', description: 'Fried chicken', website: 'https://www.kfc.com.ng', phone: '+234-1-2369000' },
    { name: 'Debonairs Pizza', category: 'Food & Drink', location: 'Victoria Island, Lagos', description: 'Pizza restaurant', website: 'https://www.debonairspizza.ng', phone: '+234-1-2369000' },

    // --- HOSPITALITY ---
    { name: 'Transcorp Hilton', category: 'Hospitality', location: 'Maitama, Abuja', description: 'Luxury hotel', website: 'https://www.transcorphotels.com', phone: '+234-1-2369000' },
    { name: 'Eko Hotels & Suites', category: 'Hospitality', location: 'Victoria Island, Lagos', description: 'Luxury hotel and conference center', website: 'https://www.ekohotels.com', phone: '+234-1-2369000' },
    { name: 'Sheraton Lagos', category: 'Hospitality', location: 'Ikeja, Lagos', description: 'International hotel', website: 'https://www.marriott.com', phone: '+234-1-2369000' },
    { name: 'Radisson Blu', category: 'Hospitality', location: 'Victoria Island, Lagos', description: 'Upscale hotel', website: 'https://www.radissonhotels.com', phone: '+234-1-2369000' },
    { name: 'Oriental Hotel', category: 'Hospitality', location: 'Lekki, Lagos', description: 'Luxury hotel', website: 'https://www.lagosoriental.com', phone: '+234-1-2369000' },
    { name: 'Fraser Suites', category: 'Hospitality', location: 'Central Business District, Abuja', description: 'Luxury serviced apartments', website: 'https://www.frasershospitality.com', phone: '+234-1-2369000' },
    { name: 'Wheatbaker Hotel', category: 'Hospitality', location: 'Ikoyi, Lagos', description: 'Boutique hotel', website: 'https://www.thewheatbakerlagos.com', phone: '+234-1-2369000' },
    { name: 'Southern Sun', category: 'Hospitality', location: 'Ikoyi, Lagos', description: 'Hotel', website: 'https://www.southernsun.com', phone: '+234-1-2369000' },
    { name: 'Ibom Icon Hotel', category: 'Hospitality', location: 'Uyo, Akwa Ibom', description: 'Golf resort', website: 'https://www.ibomicon.com', phone: '+234-1-2369000' },
    { name: 'Hotel Presidential', category: 'Hospitality', location: 'Port Harcourt, Rivers', description: 'Hotel', website: 'https://www.hotelpresidentialph.com', phone: '+234-1-2369000' },
    { name: 'Protea Hotel', category: 'Hospitality', location: 'Ikeja, Lagos', description: 'Business hotel', website: 'https://www.marriott.com', phone: '+234-1-2369000' },

    // --- HEALTH ---
    { name: 'Lagoon Hospitals', category: 'Health', location: 'Ikoyi, Lagos', description: 'Leading private healthcare', website: 'https://www.lagoonhospitals.com', phone: '+234-1-2369000' },
    { name: 'Reddington Hospital', category: 'Health', location: 'Victoria Island, Lagos', description: 'Multi-specialist hospital', website: 'https://www.reddingtonhospital.com', phone: '+234-1-2369000' },
    { name: 'Eko Hospital', category: 'Health', location: 'Ikeja, Lagos', description: 'Private hospital group', website: 'https://www.ekohospital.com', phone: '+234-1-2369000' },
    { name: 'St. Nicholas Hospital', category: 'Health', location: 'Lagos Island, Lagos', description: 'Private hospital', website: 'https://www.saintnicholashospital.com', phone: '+234-1-2369000' },
    { name: 'Cedarcrest Hospitals', category: 'Health', location: 'Gudu, Abuja', description: 'Specialist hospital', website: 'https://www.cedarcresthospitals.com', phone: '+234-1-2369000' },
    { name: 'Nizamiye Hospital', category: 'Health', location: 'Industrial Layout, Abuja', description: 'Nigerian-Turkish hospital', website: 'https://www.nizamiyehospital.com.ng', phone: '+234-1-2369000' },
    { name: 'Evercare Hospital', category: 'Health', location: 'Lekki, Lagos', description: 'Tertiary care hospital', website: 'https://www.evercare.ng', phone: '+234-1-2369000' },
    { name: 'Lily Hospitals', category: 'Health', location: 'Warri, Delta', description: 'Private hospital', website: 'https://www.lilyhospitals.com', phone: '+234-1-2369000' },
    { name: 'Nisa Premier Hospital', category: 'Health', location: 'Jabi, Abuja', description: 'Fertility and general hospital', website: 'https://www.nisa.com.ng', phone: '+234-1-2369000' },
    { name: 'Bridge Clinic', category: 'Health', location: 'Ikeja, Lagos', description: 'Fertility centre', website: 'https://www.thebridgeclinic.com', phone: '+234-1-2369000' },

    // --- LOGISTICS ---
    { name: 'GIG Logistics', category: 'Logistics', location: 'Gbagada, Lagos', description: 'Logistics and courier services', website: 'https://www.giglogistics.com', phone: '+234-1-2369000' },
    { name: 'Red Star Express (FedEx)', category: 'Logistics', location: 'Isolo, Lagos', description: 'Courier and logistics', website: 'https://www.redstarplc.com', phone: '+234-1-2369000' },
    { name: 'DHL Nigeria', category: 'Logistics', location: 'Isolo, Lagos', description: 'International shipping', website: 'https://www.dhl.com/ng-en', phone: '+234-1-2369000' },
    { name: 'Kobo360', category: 'Logistics', location: 'Yaba, Lagos', description: 'Digital logistics platform', website: 'https://www.kobo360.com', phone: '+234-1-2369000' },
    { name: 'ABC Transport', category: 'Logistics', location: 'Amuwo Odofin, Lagos', description: 'Haulage and transport', website: 'https://www.abctransport.com', phone: '+234-1-2369000' },
    { name: 'GUO Transport', category: 'Logistics', location: 'Alaba, Lagos', description: 'Transport and logistics', website: 'https://www.guotransport.com', phone: '+234-1-2369000' },
    { name: 'Sifax Group', category: 'Logistics', location: 'Apapa, Lagos', description: 'Ports and cargo handling', website: 'https://www.sifaxgroup.com', phone: '+234-1-2369000' },
    { name: 'Dangote Transport', category: 'Logistics', location: 'Apapa, Lagos', description: 'Haulage', website: 'https://www.dangote.com', phone: '+234-1-2369000' },
    { name: 'Courier Plus', category: 'Logistics', location: 'Isolo, Lagos', description: 'Logistics services', website: 'https://www.courierplus-ng.com', phone: '+234-1-2369000' },
    { name: 'Speedaf', category: 'Logistics', location: 'Ikeja, Lagos', description: 'Express delivery', website: 'https://www.speedaf.com', phone: '+234-1-2369000' },
    { name: 'Kwik Delivery', category: 'Logistics', location: 'Yaba, Lagos', description: 'On-demand delivery', website: 'https://www.kwik.delivery', phone: '+234-1-2369000' },
    { name: 'Gokada', category: 'Logistics', location: 'Lekki, Lagos', description: 'Last mile delivery', website: 'https://www.gokada.ng', phone: '+234-1-2369000' },

    // --- AUTOMOBILES ---
    { name: 'Innoson Vehicle Manufacturing', category: 'Automobiles', location: 'Nnewi, Anambra', description: 'Indigenous vehicle manufacturer', website: 'https://www.innosonvehicles.com', phone: '+234-1-2369000' },
    { name: 'Coscharis Motors', category: 'Automobiles', location: 'Lekki, Lagos', description: 'Luxury car dealership', website: 'https://www.coscharisgroup.net', phone: '+234-1-2369000' },
    { name: 'Elizade Motors', category: 'Automobiles', location: 'Ikeja, Lagos', description: 'Toyota dealership', website: 'https://www.elizade.com', phone: '+234-1-2369000' },
    { name: 'Globe Motors', category: 'Automobiles', location: 'Victoria Island, Lagos', description: 'Automobile dealership', website: 'https://www.globemotors.ng', phone: '+234-1-2369000' },
    { name: 'Stallion Motors', category: 'Automobiles', location: 'Victoria Island, Lagos', description: 'Vehicle assembly and sales', website: 'https://www.stalliongroup.com', phone: '+234-1-2369000' },
    { name: 'Lanre Shittu Motors', category: 'Automobiles', location: 'Surulere, Lagos', description: 'Mack trucks and cars', website: 'https://www.lanreshittu.com', phone: '+234-1-2369000' },
    { name: 'Kia Nigeria', category: 'Automobiles', location: 'Victoria Island, Lagos', description: 'Kia assembly and sales', website: 'https://www.kiamotorsnigeria.com', phone: '+234-1-2369000' },
    { name: 'Honda Manufacturing', category: 'Automobiles', location: 'Ota, Ogun', description: 'Honda vehicle assembly', website: 'https://www.honda.com.ng', phone: '+234-1-2369000' },
    { name: 'Nord Automobiles', category: 'Automobiles', location: 'Sangotedo, Lagos', description: 'Indigenous car manufacturer', website: 'https://www.nordmotion.com', phone: '+234-1-2369000' },
    { name: 'Jet Systems', category: 'Automobiles', location: 'Gbagada, Lagos', description: 'Electric vehicle manufacturer', website: 'https://www.jet.mn', phone: '+234-1-2369000' },

    // --- MEDIA ---
    { name: 'Channels TV', category: 'Media', location: 'Isheri North, Lagos', description: 'News television station', website: 'https://www.channelstv.com', phone: '+234-1-2369000' },
    { name: 'Arise News', category: 'Media', location: 'Ikoyi, Lagos', description: 'Global news channel', website: 'https://www.arise.tv', phone: '+234-1-2369000' },
    { name: 'TVC News', category: 'Media', location: 'Ikosi, Lagos', description: '24-hour news channel', website: 'https://www.tvcnews.tv', phone: '+234-1-2369000' },
    { name: 'Punch Newspapers', category: 'Media', location: 'Magboro, Ogun', description: 'Daily newspaper', website: 'https://www.punchng.com', phone: '+234-1-2369000' },
    { name: 'ThisDay', category: 'Media', location: 'Apapa, Lagos', description: 'National newspaper', website: 'https://www.thisdaylive.com', phone: '+234-1-2369000' },
    { name: 'Vanguard', category: 'Media', location: 'Apapa, Lagos', description: 'Daily news', website: 'https://www.vanguardngr.com', phone: '+234-1-2369000' },
    { name: 'BusinessDay', category: 'Media', location: 'Apapa, Lagos', description: 'Business news', website: 'https://www.businessday.ng', phone: '+234-1-2369000' },
    { name: 'Linda Ikeji Blog', category: 'Media', location: 'Lekki, Lagos', description: 'Entertainment blog', website: 'https://www.lindaikejisblog.com', phone: '+234-1-2369000' },
    { name: 'Pulse Nigeria', category: 'Media', location: 'Lekki, Lagos', description: 'Digital media publisher', website: 'https://www.pulse.ng', phone: '+234-1-2369000' },
    { name: 'NairaLand', category: 'Media', location: 'Ota, Ogun', description: 'Online forum', website: 'https://www.nairaland.com', phone: '+234-1-2369000' },
    { name: 'Beat FM', category: 'Media', location: 'Ikoyi, Lagos', description: 'Radio station', website: 'https://www.thebeat99.com', phone: '+234-1-2369000' },
    { name: 'Cool FM', category: 'Media', location: 'Victoria Island, Lagos', description: 'Radio station', website: 'https://www.coolfm.ng', phone: '+234-1-2369000' },
    { name: 'Soundcity', category: 'Media', location: 'Lekki, Lagos', description: 'Music channel', website: 'https://www.soundcity.tv', phone: '+234-1-2369000' },

    // --- REAL ESTATE ---
    { name: 'Jide Taiwo & Co', category: 'Real Estate', location: 'Victoria Island, Lagos', description: 'Estate surveyors and valuers', website: 'https://www.jidetaiwoandco.com', phone: '+234-1-2369000' },
    { name: 'Diya Fatimilehin & Co', category: 'Real Estate', location: 'Victoria Island, Lagos', description: 'Real estate firm', website: 'https://www.diyafatimilehin.com', phone: '+234-1-2369000' },
    { name: 'LandWey', category: 'Real Estate', location: 'Lekki, Lagos', description: 'Real estate development', website: 'https://www.landwey.ng', phone: '+234-1-2369000' },
    { name: 'Mixta Africa', category: 'Real Estate', location: 'Ikoyi, Lagos', description: 'Real estate developer', website: 'https://www.mixtafrica.com', phone: '+234-1-2369000' },
    { name: 'Knight Frank Nigeria', category: 'Real Estate', location: 'Lagos Island, Lagos', description: 'Property consultancy', website: 'https://www.knightfrank.ng', phone: '+234-1-2369000' },
    { name: 'Fine and Country', category: 'Real Estate', location: 'Ikoyi, Lagos', description: 'Luxury real estate', website: 'https://www.fineandcountry.com/ng', phone: '+234-1-2369000' },
    { name: 'Alpha Mead', category: 'Real Estate', location: 'Ikeja, Lagos', description: 'Facilities management', website: 'https://www.alphamead.com', phone: '+234-1-2369000' },
    { name: 'UPDC', category: 'Real Estate', location: 'Marina, Lagos', description: 'Property development', website: 'https://www.updcplc.com', phone: '+234-1-2369000' },
    { name: 'RevolutionPlus Property', category: 'Real Estate', location: 'Ikeja, Lagos', description: 'Real estate company', website: 'https://www.revolutionplusproperty.com', phone: '+234-1-2369000' },
    { name: 'Adron Homes', category: 'Real Estate', location: 'Omole, Lagos', description: 'Estate development', website: 'https://www.adronhomesproperties.com', phone: '+234-1-2369000' },

    // --- INSURANCE ---
    { name: 'AIICO Insurance', category: 'Insurance', location: 'Victoria Island, Lagos', description: 'Financial services group', website: 'https://www.aiicoplc.com', phone: '+234-1-2369000' },
    { name: 'AXA Mansard', category: 'Insurance', location: 'Victoria Island, Lagos', description: 'Insurance and asset management', website: 'https://www.axamansard.com', phone: '+234-1-2369000' },
    { name: 'Leadway Assurance', category: 'Insurance', location: 'Iponri, Lagos', description: 'Insurance services', website: 'https://www.leadway.com', phone: '+234-1-2369000' },
    { name: 'Mutual Benefits', category: 'Insurance', location: 'Ilupeju, Lagos', description: 'Assurance company', website: 'https://www.mutualbenefitsassurance.com', phone: '+234-1-2369000' },
    { name: 'Cornerstone Insurance', category: 'Insurance', location: 'Victoria Island, Lagos', description: 'Insurance company', website: 'https://www.cornerstone.com.ng', phone: '+234-1-2369000' },
    { name: 'Custodian Investment', category: 'Insurance', location: 'Yaba, Lagos', description: 'Investment and insurance', website: 'https://www.custodianplc.com.ng', phone: '+234-1-2369000' },
    { name: 'NEM Insurance', category: 'Insurance', location: 'Obanikoro, Lagos', description: 'General insurance', website: 'https://www.nem-insurance.com', phone: '+234-1-2369000' },
    { name: 'Sovereign Trust', category: 'Insurance', location: 'Victoria Island, Lagos', description: 'Insurance company', website: 'https://www.stiplc.com', phone: '+234-1-2369000' },
    { name: 'Lasaco Assurance', category: 'Insurance', location: 'Ikeja, Lagos', description: 'Insurance services', website: 'https://www.lasacoassurance.com', phone: '+234-1-2369000' },
    { name: 'Consolidated Hallmark', category: 'Insurance', location: 'Obanikoro, Lagos', description: 'General business insurance', website: 'https://www.chiplc.com', phone: '+234-1-2369000' },

    // --- EDUCATION ---
    { name: 'Covenant University', category: 'Education', location: 'Ota, Ogun', description: 'Private Christian university', website: 'https://www.covenantuniversity.edu.ng', phone: '+234-1-2369000' },
    { name: 'University of Lagos', category: 'Education', location: 'Akoka, Lagos', description: 'Federal university', website: 'https://www.unilag.edu.ng', phone: '+234-1-2369000' },
    { name: 'Afe Babalola University', category: 'Education', location: 'Ado-Ekiti, Ekiti', description: 'Private university', website: 'https://www.abuad.edu.ng', phone: '+234-1-2369000' },
    { name: 'Pan-Atlantic University', category: 'Education', location: 'Ibeju-Lekki, Lagos', description: 'Private university', website: 'https://www.pau.edu.ng', phone: '+234-1-2369000' },
    { name: 'Babcock University', category: 'Education', location: 'Ilishan-Remo, Ogun', description: 'Seventh-day Adventist university', website: 'https://www.babcock.edu.ng', phone: '+234-1-2369000' },
    { name: 'Greensprings School', category: 'Education', location: 'Lekki, Lagos', description: 'British international school', website: 'https://www.greensprings-school.com', phone: '+234-1-2369000' },
    { name: 'Grange School', category: 'Education', location: 'Ikeja, Lagos', description: 'British curriculum school', website: 'https://www.grangeschool.com', phone: '+234-1-2369000' },
    { name: 'Daywaterman College', category: 'Education', location: 'Abeokuta, Ogun', description: 'Secondary school', website: 'https://www.daywaterman.com', phone: '+234-1-2369000' },
    { name: 'Corona Schools', category: 'Education', location: 'Ikoyi, Lagos', description: 'Trust council schools', website: 'https://www.coronaschools.org', phone: '+234-1-2369000' },
    { name: 'Meadow Hall', category: 'Education', location: 'Lekki, Lagos', description: 'Education group', website: 'https://www.meadowhallgroup.com', phone: '+234-1-2369000' },

    // --- AGRICULTURE ---
    { name: 'Olam Nigeria', category: 'Agriculture', location: 'Surulere, Lagos', description: 'Agri-business', website: 'https://www.olamgroup.com', phone: '+234-1-2369000' },
    { name: 'Flour Mills of Nigeria', category: 'Agriculture', location: 'Apapa, Lagos', description: 'Food and agro-allied', website: 'https://www.fmnplc.com', phone: '+234-1-2369000' },
    { name: 'Dangote Sugar', category: 'Agriculture', location: 'Apapa, Lagos', description: 'Sugar refining', website: 'https://www.dangotesugar.com.ng', phone: '+234-1-2369000' },
    { name: 'Presco', category: 'Agriculture', location: 'Benin City, Edo', description: 'Oil palm company', website: 'https://www.presco-plc.com', phone: '+234-1-2369000' },
    { name: 'Okomu Oil', category: 'Agriculture', location: 'Okomu, Edo', description: 'Oil palm and rubber', website: 'https://www.okomunigeria.com', phone: '+234-1-2369000' },
    { name: 'Farmcrowdy', category: 'Agriculture', location: 'Lekki, Lagos', description: 'Agritech platform', website: 'https://www.farmcrowdy.com', phone: '+234-1-2369000' },
    { name: 'Thrive Agric', category: 'Agriculture', location: 'Wuse, Abuja', description: 'Agricultural technology', website: 'https://www.thriveagric.com', phone: '+234-1-2369000' },
    { name: 'Stallion Group (Rice)', category: 'Agriculture', location: 'Victoria Island, Lagos', description: 'Rice farming', website: 'https://www.stalliongroup.com', phone: '+234-1-2369000' },
    { name: 'Chi Farms', category: 'Agriculture', location: 'Isolo, Lagos', description: 'Poultry and catfish', website: 'https://www.chifarms.com', phone: '+234-1-2369000' },
    { name: 'Notore Chemical', category: 'Agriculture', location: 'Onne, Rivers', description: 'Agro-chemicals', website: 'https://www.notore.com', phone: '+234-1-2369000' },

    // --- OTHER (Construction, Manufacturing, etc.) ---
    { name: 'Julius Berger', category: 'Other', location: 'Utako, Abuja', description: 'Construction company', website: 'https://www.julius-berger.com', phone: '+234-1-2369000' },
    { name: 'Dangote Cement', category: 'Other', location: 'Ikoyi, Lagos', description: 'Cement manufacturer', website: 'https://www.dangotecement.com', phone: '+234-1-2369000' },
    { name: 'Lafarge Africa', category: 'Other', location: 'Ikoyi, Lagos', description: 'Building solutions', website: 'https://www.lafarge.com.ng', phone: '+234-1-2369000' },
    { name: 'Nestle Nigeria', category: 'Other', location: 'Ilupeju, Lagos', description: 'Food and beverage', website: 'https://www.nestle-cwa.com', phone: '+234-1-2369000' },
    { name: 'Unilever Nigeria', category: 'Other', location: 'Oregun, Lagos', description: 'Consumer goods', website: 'https://www.unilever-owa.com', phone: '+234-1-2369000' },
    { name: 'PZ Cussons', category: 'Other', location: 'Ilupeju, Lagos', description: 'Consumer products', website: 'https://www.pzcussons.com', phone: '+234-1-2369000' },
    { name: 'Nigerian Breweries', category: 'Other', location: 'Iganmu, Lagos', description: 'Brewing company', website: 'https://www.nbplc.com', phone: '+234-1-2369000' },
    { name: 'Guinness Nigeria', category: 'Other', location: 'Ikeja, Lagos', description: 'Brewery', website: 'https://www.guinness-nigeria.com', phone: '+234-1-2369000' },
    { name: 'Reynolds Construction (RCC)', category: 'Other', location: 'Jabi, Abuja', description: 'Construction', website: 'https://www.rcc.com.ng', phone: '+234-1-2369000' },
    { name: 'Hitech Construction', category: 'Other', location: 'Victoria Island, Lagos', description: 'Civil engineering', website: 'https://www.hitech.com', phone: '+234-1-2369000' },

    // --- FASHION (NEW) ---
    { name: 'Mai Atafo', category: 'Other', location: 'Lekki, Lagos', description: 'Bespoke fashion designer', website: 'https://www.maiatafo.com', phone: '+234-1-2369000' },
    { name: 'Lisa Folawiyo', category: 'Other', location: 'Ikoyi, Lagos', description: 'Luxury fashion brand', website: 'https://www.lisafolawiyo.com', phone: '+234-1-2369000' },
    { name: 'Dye Lab', category: 'Other', location: 'Victoria Island, Lagos', description: 'Contemporary adire fashion', website: 'https://www.dyelab.com', phone: '+234-1-2369000' },
    { name: 'Orange Culture', category: 'Other', location: 'Lekki, Lagos', description: 'Contemporary menswear', website: 'https://www.orangeculture.com.ng', phone: '+234-1-2369000' },
    { name: 'Deola Sagoe', category: 'Other', location: 'Victoria Island, Lagos', description: 'Haute couture fashion', website: 'https://www.deolasagoe.net', phone: '+234-1-2369000' },
    { name: 'Tiffany Amber', category: 'Other', location: 'Ikoyi, Lagos', description: 'Luxury lifestyle brand', website: 'https://www.tiffanyamberng.com', phone: '+234-1-2369000' },
    { name: 'Kenneth Ize', category: 'Other', location: 'Lagos Island, Lagos', description: 'Textile-focused fashion', website: 'https://www.kennethize.net', phone: '+234-1-2369000' },
    { name: 'Maki Oh', category: 'Other', location: 'Lekki, Lagos', description: 'Womenswear brand', website: 'https://www.makioh.com', phone: '+234-1-2369000' },
    { name: 'Ugo Monye', category: 'Other', location: 'Lekki, Lagos', description: 'Men\'s fashion designer', website: 'https://www.ugomonye.com', phone: '+234-1-2369000' },
    { name: 'Banke Kuku', category: 'Other', location: 'Ikoyi, Lagos', description: 'Textile and lounge wear', website: 'https://www.bankekuku.com', phone: '+234-1-2369000' },

    // --- TECH STARTUPS (NEW) ---
    { name: 'Andela', category: 'IT Services', location: 'Epic Tower, Lagos', description: 'Global talent network', website: 'https://www.andela.com', phone: '+234-1-2369000' },
    { name: 'Jobberman', category: 'Jobs', location: 'Victoria Island, Lagos', description: 'Leading job portal', website: 'https://www.jobberman.com', phone: '+234-1-2369000' },
    { name: 'IrokoTV', category: 'Media', location: 'Anthony Village, Lagos', description: 'Nollywood streaming platform', website: 'https://www.irokotv.com', phone: '+234-1-2369000' },
    { name: 'Hotels.ng', category: 'Travel & Hotels', location: 'Yaba, Lagos', description: 'Hotel booking platform', website: 'https://www.hotels.ng', phone: '+234-1-2369000' },
    { name: 'Printivo', category: 'IT Services', location: 'Yaba, Lagos', description: 'Online printing service', website: 'https://www.printivo.com', phone: '+234-1-2369000' },
    { name: 'Terragon Group', category: 'IT Services', location: 'Victoria Island, Lagos', description: 'Data and marketing technology', website: 'https://www.terragongroup.com', phone: '+234-1-2369000' },
    { name: 'CcHub', category: 'IT Services', location: 'Yaba, Lagos', description: 'Innovation center', website: 'https://www.cchubnigeria.com', phone: '+234-1-2369000' },
    { name: 'LifeBank', category: 'Health', location: 'Yaba, Lagos', description: 'Medical logistics', website: 'https://www.lifebank.ng', phone: '+234-1-2369000' },
    { name: 'Helium Health', category: 'Health', location: 'Lekki, Lagos', description: 'Healthcare technology', website: 'https://www.heliumhealth.com', phone: '+234-1-2369000' },
    { name: 'uLesson', category: 'Education', location: 'Jabi, Abuja', description: 'Edtech platform', website: 'https://www.ulesson.com', phone: '+234-1-2369000' },

    // --- ENTERTAINMENT (NEW) ---
    { name: 'Filmhouse Cinemas', category: 'Other', location: 'Lekki, Lagos', description: 'Leading cinema chain', website: 'https://www.filmhouseng.com', phone: '+234-1-2369000' },
    { name: 'Genesis Cinemas', category: 'Other', location: 'Victoria Island, Lagos', description: 'Cinema exhibition', website: 'https://www.genesiscinemas.com', phone: '+234-1-2369000' },
    { name: 'Silverbird Cinemas', category: 'Other', location: 'Victoria Island, Lagos', description: 'Entertainment company', website: 'https://www.silverbirdcinemas.com', phone: '+234-1-2369000' },
    { name: 'Viva Cinemas', category: 'Other', location: 'Iikeja, Lagos', description: 'Cinema chain', website: 'https://www.vivacinemas.com', phone: '+234-1-2369000' },
    { name: 'Mavin Records', category: 'Media', location: 'Victoria Island, Lagos', description: 'Record label', website: 'https://www.mavinrecords.com', phone: '+234-1-2369000' },
    { name: 'YBNL Nation', category: 'Media', location: 'Lekki, Lagos', description: 'Record label', website: 'https://www.ybnlnation.com', phone: '+234-1-2369000' },
    { name: 'DMW', category: 'Media', location: 'Lekki, Lagos', description: 'Record label', website: 'https://www.dmw-hq.com', phone: '+234-1-2369000' },
    { name: 'Chocolate City', category: 'Media', location: 'Gbagada, Lagos', description: 'Music entertainment group', website: 'https://www.chocolatecitygroup.com', phone: '+234-1-2369000' },
    { name: 'EbonyLife Place', category: 'Other', location: 'Victoria Island, Lagos', description: 'Luxury lifestyle resort', website: 'https://www.ebonylifeplace.com', phone: '+234-1-2369000' },
    { name: 'Landmark Beach', category: 'Travel & Hotels', location: 'Victoria Island, Lagos', description: 'Beach resort', website: 'https://www.landmarkbeach.ng', phone: '+234-1-2369000' }
];

const generatePhone = () => `080${Math.floor(Math.random() * 90000000 + 10000000)}`;

async function seedMassive() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is undefined. Check your .env file or run from the correct directory.');
            process.exit(1);
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        console.log('🔍 Scanning for existing businesses with owners...');
        const businessesWithOwners = await Business.find({
            owner: { $exists: true, $ne: null }
        });
        const keptIds = businessesWithOwners.map(b => b._id);
        const existingNames = new Set(businessesWithOwners.map(b => b.name));
        console.log(`🛡️ Preserving ${businessesWithOwners.length} businesses with owners.`);

        console.log('🗑️ Clearing unowned businesses...');
        await Business.deleteMany({ _id: { $nin: keptIds } });

        console.log(`🏭 Generating businesses...`);
        const newBusinesses = [];

        // Add Real Businesses
        console.log(`   - Adding ${realBusinesses.length} Real Nigerian Companies...`);
        for (const biz of realBusinesses) {
            if (!existingNames.has(biz.name)) {
                const slug = biz.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                newBusinesses.push({
                    ...biz,
                    categories: [biz.category],
                    description: biz.description || `${biz.name} is a leading player in the ${biz.category} industry.`,
                    website: biz.website || `https://www.${slug}.com.ng`,
                    phone: biz.phone || generatePhone(),
                    email: `info@${slug}.com.ng`,
                    rating: 5.0, // Initial trust score of 5
                    reviewCount: 0, // Initial review count of 0
                    isVerified: Math.random() > 0.5, // 50% chance for real ones
                    status: 'approved',
                    subscriptionTier: 'basic',
                    subscriptionStatus: 'inactive',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                existingNames.add(biz.name);
            }
        }

        // Batch Insert
        if (newBusinesses.length > 0) {
            console.log(`💾 Inserting ${newBusinesses.length} businesses...`);
            const chunkSize = 100;
            for (let i = 0; i < newBusinesses.length; i += chunkSize) {
                const chunk = newBusinesses.slice(i, i + chunkSize);
                await Business.insertMany(chunk);
                process.stdout.write('.');
            }
            console.log('\n✅ Insertion complete!');
        }

        // Summary
        const total = await Business.countDocuments();
        console.log(`\n🎉 Total Businesses: ${total}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedMassive();

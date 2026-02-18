require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/Business');

// REAL NIGERIAN BUSINESSES DATA (Target: 500+)
const realBusinesses = [
    // --- BANKS (20) ---
    { name: 'Zenith Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'GTBank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'First Bank', category: 'Banks', location: 'Marina, Lagos' },
    { name: 'Access Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'UBA', category: 'Banks', location: 'Marina, Lagos' },
    { name: 'Ecobank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'Stanbic IBTC', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'Fidelity Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'Union Bank', category: 'Banks', location: 'Marina, Lagos' },
    { name: 'Sterling Bank', category: 'Banks', location: 'Marina, Lagos' },
    { name: 'Wema Bank', category: 'Banks', location: 'Marina, Lagos' },
    { name: 'Polaris Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'Heritage Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'Keystone Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'Unity Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'FCMB', category: 'Banks', location: 'Marina, Lagos' },
    { name: 'Providus Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'Jaiz Bank', category: 'Banks', location: 'Central Business District, Abuja' },
    { name: 'Globus Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'Suntrust Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'Titan Trust Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'Lotus Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'Parallex Bank', category: 'Banks', location: 'Victoria Island, Lagos' },
    { name: 'Premium Trust Bank', category: 'Banks', location: 'Marina, Lagos' },
    { name: 'Signature Bank', category: 'Banks', location: 'Abuja, FCT' },

    // --- TELECOM (15) ---
    { name: 'MTN Nigeria', category: 'Telecom', location: 'Ikoyi, Lagos' },
    { name: 'Airtel Nigeria', category: 'Telecom', location: 'Banana Island, Lagos' },
    { name: 'Glo Mobile', category: 'Telecom', location: 'Victoria Island, Lagos' },
    { name: '9mobile', category: 'Telecom', location: 'Banana Island, Lagos' },
    { name: 'Spectranet', category: 'Telecom', location: 'Ikeja, Lagos' },
    { name: 'Smile Nigeria', category: 'Telecom', location: 'Victoria Island, Lagos' },
    { name: 'Swift Networks', category: 'Telecom', location: 'Victoria Island, Lagos' },
    { name: 'Tizeti', category: 'Telecom', location: 'Lekki, Lagos' },
    { name: 'Ipnx Nigeria', category: 'Telecom', location: 'Victoria Island, Lagos' },
    { name: 'MainOne', category: 'Telecom', location: 'Victoria Island, Lagos' },
    { name: 'Cobranet', category: 'Telecom', location: 'Victoria Island, Lagos' },
    { name: 'Coollink', category: 'Telecom', location: 'Victoria Island, Lagos' },
    { name: 'Suburban Fiber', category: 'Telecom', location: 'Wuse, Abuja' },
    { name: 'FiberOne', category: 'Telecom', location: 'Lekki, Lagos' },
    { name: 'Starlink Nigeria', category: 'Telecom', location: 'Lekki, Lagos' },

    // --- ECOMMERCE & RETAIL (30) ---
    { name: 'Jumia', category: 'Ecommerce', location: 'Ikeja, Lagos' },
    { name: 'Konga', category: 'Ecommerce', location: 'Ikeja, Lagos' },
    { name: 'Jiji', category: 'Ecommerce', location: 'Yaba, Lagos' },
    { name: 'Slot', category: 'Ecommerce', location: 'Ikeja, Lagos' },
    { name: 'PayPorte', category: 'Ecommerce', location: 'Lekki, Lagos' },
    { name: 'Spar Nigeria', category: 'Ecommerce', location: 'Ilupeju, Lagos' },
    { name: 'Shoprite', category: 'Ecommerce', location: 'Ikeja, Lagos' },
    { name: 'Market Square', category: 'Ecommerce', location: 'Port Harcourt, Rivers' },
    { name: 'Prince Ebeano', category: 'Ecommerce', location: 'Lekki, Lagos' },
    { name: 'Sahad Stores', category: 'Ecommerce', location: 'Central Area, Abuja' },
    { name: 'Justrite', category: 'Ecommerce', location: 'Ota, Ogun' },
    { name: 'Addide', category: 'Ecommerce', location: 'Gbagada, Lagos' },
    { name: 'Hubmart', category: 'Ecommerce', location: 'Victoria Island, Lagos' },
    { name: 'Game Stores', category: 'Ecommerce', location: 'Lekki, Lagos' },
    { name: 'Blenco Supermarket', category: 'Ecommerce', location: 'Ajah, Lagos' },
    { name: 'H-Medix', category: 'Ecommerce', location: 'Wuse 2, Abuja' },
    { name: 'Next Cash and Carry', category: 'Ecommerce', location: 'Jahi, Abuja' },
    { name: 'Exclusive Stores', category: 'Ecommerce', location: 'Wuse 2, Abuja' },
    { name: 'Grand Square', category: 'Ecommerce', location: 'Central Business District, Abuja' },
    { name: 'FoodCo', category: 'Ecommerce', location: 'Ibadan, Oyo' },
    { name: 'Roban Stores', category: 'Ecommerce', location: 'Enugu, Enugu' },
    { name: 'Everyday Supermarket', category: 'Ecommerce', location: 'Port Harcourt, Rivers' },
    { name: 'Genesis Centre', category: 'Ecommerce', location: 'Port Harcourt, Rivers' },
    { name: 'Kilimanjaro Hall', category: 'Ecommerce', location: 'Port Harcourt, Rivers' },
    { name: 'Okin Biscuits', category: 'Ecommerce', location: 'Offa, Kwara' },
    { name: 'Domino Stores', category: 'Ecommerce', location: 'Yaba, Lagos' },
    { name: 'Park n Shop', category: 'Ecommerce', location: 'Victoria Island, Lagos' },
    { name: 'Daytona Supermarket', category: 'Ecommerce', location: 'Lekki, Lagos' },
    { name: 'Old English Supermarket', category: 'Ecommerce', location: 'Ibadan, Oyo' },
    { name: 'Feedwell Supermarket', category: 'Ecommerce', location: 'Akure, Ondo' },

    // --- FINTECH (25) ---
    { name: 'Paystack', category: 'Fintech', location: 'Ikeja, Lagos' },
    { name: 'Flutterwave', category: 'Fintech', location: 'Ikoyi, Lagos' },
    { name: 'Interswitch', category: 'Fintech', location: 'Victoria Island, Lagos' },
    { name: 'Moniepoint', category: 'Fintech', location: 'Lekki, Lagos' },
    { name: 'Opay', category: 'Fintech', location: 'Ikeja, Lagos' },
    { name: 'PalmPay', category: 'Fintech', location: 'Ikeja, Lagos' },
    { name: 'Kuda', category: 'Fintech', location: 'Yaba, Lagos' },
    { name: 'PiggyVest', category: 'Fintech', location: 'Ikeja, Lagos' },
    { name: 'Cowrywise', category: 'Fintech', location: 'Ikeja, Lagos' },
    { name: 'Carbon', category: 'Fintech', location: 'Lekki, Lagos' },
    { name: 'Bamboo', category: 'Fintech', location: 'Lekki, Lagos' },
    { name: 'Risevest', category: 'Fintech', location: 'Yaba, Lagos' },
    { name: 'FairMoney', category: 'Fintech', location: 'Ikeja, Lagos' },
    { name: 'Paga', category: 'Fintech', location: 'Yaba, Lagos' },
    { name: 'Remita', category: 'Fintech', location: 'Victoria Island, Lagos' },
    { name: 'TeamApt', category: 'Fintech', location: 'Lekki, Lagos' },
    { name: 'Lidya', category: 'Fintech', location: 'Lekki, Lagos' },
    { name: 'Renmoney', category: 'Fintech', location: 'Ikoyi, Lagos' },
    { name: 'Vbank', category: 'Fintech', location: 'Lagos Island, Lagos' },
    { name: 'Sparkle', category: 'Fintech', location: 'Victoria Island, Lagos' },
    { name: 'Kusnap', category: 'Fintech', location: 'Port Harcourt, Rivers' },
    { name: 'Patricia', category: 'Fintech', location: 'Lekki, Lagos' },
    { name: 'Baxi', category: 'Fintech', location: 'Gbagada, Lagos' },
    { name: 'Etranzact', category: 'Fintech', location: 'Ikeja, Lagos' },
    { name: 'Unified Payments', category: 'Fintech', location: 'Victoria Island, Lagos' },

    // --- OIL & GAS (20) ---
    { name: 'NNPC Retail', category: 'Energy', location: 'Central Business District, Abuja' },
    { name: 'TotalEnergies', category: 'Energy', location: 'Victoria Island, Lagos' },
    { name: 'Oando', category: 'Energy', location: 'Victoria Island, Lagos' },
    { name: 'MRS Oil', category: 'Energy', location: 'Apapa, Lagos' },
    { name: 'Conoil', category: 'Energy', location: 'Marina, Lagos' },
    { name: 'Ardova (Forte Oil)', category: 'Energy', location: 'Victoria Island, Lagos' },
    { name: 'Seplat Energy', category: 'Energy', location: 'Ikoyi, Lagos' },
    { name: 'Rainoil', category: 'Energy', location: 'Lekki, Lagos' },
    { name: 'Nipco', category: 'Energy', location: 'Apapa, Lagos' },
    { name: 'Ikeja Electric', category: 'Energy', location: 'Ikeja, Lagos' },
    { name: 'Eko Electricity', category: 'Energy', location: 'Marina, Lagos' },
    { name: 'Abuja Electricity', category: 'Energy', location: 'Wuse, Abuja' },
    { name: 'Sahara Group', category: 'Energy', location: 'Ikoyi, Lagos' },
    { name: 'Aiteo Group', category: 'Energy', location: 'Victoria Island, Lagos' },
    { name: 'Etero Energy', category: 'Energy', location: 'Abuja, FCT' },
    { name: 'Matrix Energy', category: 'Energy', location: 'Warri, Delta' },
    { name: 'Prudent Energy', category: 'Energy', location: 'Ikeja, Lagos' },
    { name: 'Nepal Oil', category: 'Energy', location: 'Ikoyi, Lagos' },
    { name: 'Hyde Energy', category: 'Energy', location: 'Lekki, Lagos' },
    { name: 'Falcon Corporation', category: 'Energy', location: 'Port Harcourt, Rivers' },

    // --- FOOD & DRINK (40) ---
    { name: 'Chicken Republic', category: 'Food & Drink', location: 'Gbagada, Lagos' },
    { name: 'Mr Bigg\'s', category: 'Food & Drink', location: 'Oregun, Lagos' },
    { name: 'Tantalizers', category: 'Food & Drink', location: 'Festac, Lagos' },
    { name: 'Domino\'s Pizza', category: 'Food & Drink', location: 'Lekki, Lagos' },
    { name: 'Cold Stone Creamery', category: 'Food & Drink', location: 'Lekki, Lagos' },
    { name: 'Kilimanjaro', category: 'Food & Drink', location: 'Port Harcourt, Rivers' },
    { name: 'The Place', category: 'Food & Drink', location: 'Lekki, Lagos' },
    { name: 'Sweet Sensation', category: 'Food & Drink', location: 'Ikeja, Lagos' },
    { name: 'Mega Chicken', category: 'Food & Drink', location: 'Lekki, Lagos' },
    { name: 'Tastee Fried Chicken', category: 'Food & Drink', location: 'Victoria Island, Lagos' },
    { name: 'Burger King Nigeria', category: 'Food & Drink', location: 'Victoria Island, Lagos' },
    { name: 'KFC Nigeria', category: 'Food & Drink', location: 'Ikeja, Lagos' },
    { name: 'Debonairs Pizza', category: 'Food & Drink', location: 'Victoria Island, Lagos' },
    { name: 'Mama Cass', category: 'Food & Drink', location: 'Ikeja, Lagos' },
    { name: 'Yakoyo', category: 'Food & Drink', location: 'Ilupeju, Lagos' },
    { name: 'Glover Court Suya', category: 'Food & Drink', location: 'Ikoyi, Lagos' },
    { name: 'Jay\'s Diner', category: 'Food & Drink', location: 'Lekki, Lagos' },
    { name: 'Ocean Basket', category: 'Food & Drink', location: 'Victoria Island, Lagos' },
    { name: 'Hard Rock Cafe', category: 'Food & Drink', location: 'Victoria Island, Lagos' },
    { name: 'RSVP Lagos', category: 'Food & Drink', location: 'Victoria Island, Lagos' },
    { name: 'Nok by Alara', category: 'Food & Drink', location: 'Victoria Island, Lagos' },
    { name: 'Shiro', category: 'Food & Drink', location: 'Victoria Island, Lagos' },
    { name: 'Z Kitchen', category: 'Food & Drink', location: 'Victoria Island, Lagos' },
    { name: 'Cactus Restaurant', category: 'Food & Drink', location: 'Victoria Island, Lagos' },
    { name: 'Terra Kulture', category: 'Food & Drink', location: 'Victoria Island, Lagos' },
    { name: 'Yellow Chilli', category: 'Food & Drink', location: 'Ikeja, Lagos' },
    { name: 'Jevinik Restaurant', category: 'Food & Drink', location: 'Wuse 2, Abuja' },
    { name: 'Nkoyo', category: 'Food & Drink', location: 'Central Business District, Abuja' },
    { name: 'BluCabana', category: 'Food & Drink', location: 'Mabushi, Abuja' },
    { name: 'Woks and Koi', category: 'Food & Drink', location: 'Wuse 2, Abuja' },
    { name: 'Coco Cafe', category: 'Food & Drink', location: 'Jabi, Abuja' },
    { name: 'Genesis Restaurant', category: 'Food & Drink', location: 'Port Harcourt, Rivers' },
    { name: 'Pizzawallah', category: 'Food & Drink', location: 'Ibadan, Oyo' },
    { name: 'Amala Skye', category: 'Food & Drink', location: 'Ibadan, Oyo' },
    { name: 'Kokodome', category: 'Food & Drink', location: 'Ibadan, Oyo' },
    { name: 'Bush Bar', category: 'Food & Drink', location: 'Enugu, Enugu' },
    { name: 'Calabar Kitchen', category: 'Food & Drink', location: 'Surulere, Lagos' },
    { name: 'Ofada Boy', category: 'Food & Drink', location: 'Surulere, Lagos' },
    { name: 'Danfo Bistro', category: 'Food & Drink', location: 'Ikoyi, Lagos' },
    { name: 'Eric Kayser', category: 'Food & Drink', location: 'Victoria Island, Lagos' },

    // --- HOSPITALITY (20) ---
    { name: 'Transcorp Hilton', category: 'Hospitality', location: 'Maitama, Abuja' },
    { name: 'Eko Hotels & Suites', category: 'Hospitality', location: 'Victoria Island, Lagos' },
    { name: 'Sheraton Lagos', category: 'Hospitality', location: 'Ikeja, Lagos' },
    { name: 'Radisson Blu', category: 'Hospitality', location: 'Victoria Island, Lagos' },
    { name: 'Oriental Hotel', category: 'Hospitality', location: 'Lekki, Lagos' },
    { name: 'Fraser Suites', category: 'Hospitality', location: 'Central Business District, Abuja' },
    { name: 'Wheatbaker Hotel', category: 'Hospitality', location: 'Ikoyi, Lagos' },
    { name: 'Southern Sun', category: 'Hospitality', location: 'Ikoyi, Lagos' },
    { name: 'Ibom Icon Hotel', category: 'Hospitality', location: 'Uyo, Akwa Ibom' },
    { name: 'Hotel Presidential', category: 'Hospitality', location: 'Port Harcourt, Rivers' },
    { name: 'Protea Hotel', category: 'Hospitality', location: 'Ikeja, Lagos' },
    { name: 'Four Points by Sheraton', category: 'Hospitality', location: 'Victoria Island, Lagos' },
    { name: 'The George', category: 'Hospitality', location: 'Ikoyi, Lagos' },
    { name: 'Nordic Hotel', category: 'Hospitality', location: 'Victoria Island, Lagos' },
    { name: 'Legend Hotel Lagos Airport', category: 'Hospitality', location: 'Ikeja, Lagos' },
    { name: 'Bristol Palace Hotel', category: 'Hospitality', location: 'Kano, Kano' },
    { name: 'Grand Pela Hotel', category: 'Hospitality', location: 'Abuja, FCT' },
    { name: 'BON Hotel', category: 'Hospitality', location: 'Asokoro, Abuja' },
    { name: 'Golden Tulip', category: 'Hospitality', location: 'Festac, Lagos' },
    { name: 'Nike Lake Resort', category: 'Hospitality', location: 'Enugu, Enugu' },

    // --- HEALTH & PHARMACY (35) ---
    { name: 'Lagoon Hospitals', category: 'Health', location: 'Ikoyi, Lagos' },
    { name: 'Reddington Hospital', category: 'Health', location: 'Victoria Island, Lagos' },
    { name: 'Eko Hospital', category: 'Health', location: 'Ikeja, Lagos' },
    { name: 'St. Nicholas Hospital', category: 'Health', location: 'Lagos Island, Lagos' },
    { name: 'Cedarcrest Hospitals', category: 'Health', location: 'Gudu, Abuja' },
    { name: 'Nizamiye Hospital', category: 'Health', location: 'Industrial Layout, Abuja' },
    { name: 'Evercare Hospital', category: 'Health', location: 'Lekki, Lagos' },
    { name: 'Lily Hospitals', category: 'Health', location: 'Warri, Delta' },
    { name: 'Nisa Premier Hospital', category: 'Health', location: 'Jabi, Abuja' },
    { name: 'Bridge Clinic', category: 'Health', location: 'Ikeja, Lagos' },
    { name: 'Medplus Pharmacy', category: 'Health', location: 'Lekki, Lagos' },
    { name: 'HealthPlus Pharmacy', category: 'Health', location: 'Ikeja, Lagos' },
    { name: 'Alpha Pharmacy', category: 'Health', location: 'Ikeja, Lagos' },
    { name: 'Juli Pharmacy', category: 'Health', location: 'Ikeja, Lagos' },
    { name: 'Nett Pharmacy', category: 'Health', location: 'Ikeja, Lagos' },
    { name: 'Mopheth Pharmacy', category: 'Health', location: 'Victoria Island, Lagos' },
    { name: 'Vantage Pharmacy', category: 'Health', location: 'Abuja, FCT' },
    { name: 'H-Medix Pharmacy', category: 'Health', location: 'Wuse, Abuja' },
    { name: 'Synlab', category: 'Health', location: 'Victoria Island, Lagos' },
    { name: 'MeCure Healthcare', category: 'Health', location: 'Oshodi, Lagos' },
    { name: 'Clina-Lancet', category: 'Health', location: 'Victoria Island, Lagos' },
    { name: 'Afcare', category: 'Health', location: 'Lekki, Lagos' },
    { name: 'Reliance HMO', category: 'Health', location: 'Lekki, Lagos' },
    { name: 'Hygeia HMO', category: 'Health', location: 'Lagos Island, Lagos' },
    { name: 'Avon HMO', category: 'Health', location: 'Victoria Island, Lagos' },
    { name: 'LifeBank', category: 'Health', location: 'Yaba, Lagos' },
    { name: 'Helium Health', category: 'Health', location: 'Lekki, Lagos' },
    { name: '54gene', category: 'Health', location: 'Lekki, Lagos' },
    { name: 'mPharma', category: 'Health', location: 'Victoria Island, Lagos' },
    { name: 'DrugStoc', category: 'Health', location: 'Lagos, Lagos' },
    { name: 'Iwosan Lagoon', category: 'Health', location: 'Victoria Island, Lagos' },
    { name: 'Kelina Hospital', category: 'Health', location: 'Gwarinpa, Abuja' },
    { name: 'Limi Hospital', category: 'Health', location: 'Central Area, Abuja' },
    { name: 'Garki Hospital', category: 'Health', location: 'Garki, Abuja' },
    { name: 'Trust Charitos', category: 'Health', location: 'Jabi, Abuja' },

    // --- LOGISTICS (20) ---
    { name: 'GIG Logistics', category: 'Logistics', location: 'Gbagada, Lagos' },
    { name: 'Red Star Express', category: 'Logistics', location: 'Isolo, Lagos' },
    { name: 'DHL Nigeria', category: 'Logistics', location: 'Isolo, Lagos' },
    { name: 'Kobo360', category: 'Logistics', location: 'Yaba, Lagos' },
    { name: 'ABC Transport', category: 'Logistics', location: 'Amuwo Odofin, Lagos' },
    { name: 'GUO Transport', category: 'Logistics', location: 'Alaba, Lagos' },
    { name: 'Sifax Group', category: 'Logistics', location: 'Apapa, Lagos' },
    { name: 'Dangote Transport', category: 'Logistics', location: 'Apapa, Lagos' },
    { name: 'Courier Plus', category: 'Logistics', location: 'Isolo, Lagos' },
    { name: 'Speedaf', category: 'Logistics', location: 'Ikeja, Lagos' },
    { name: 'Kwik Delivery', category: 'Logistics', location: 'Yaba, Lagos' },
    { name: 'Gokada', category: 'Logistics', location: 'Lekki, Lagos' },
    { name: 'Max.ng', category: 'Logistics', location: 'Lekki, Lagos' },
    { name: 'Ace Logistics', category: 'Logistics', location: 'Ikeja, Lagos' },
    { name: 'FedEx Nigeria', category: 'Logistics', location: 'Ikeja, Lagos' },
    { name: 'UPS Nigeria', category: 'Logistics', location: 'Gbagada, Lagos' },
    { name: 'Chisco Transport', category: 'Logistics', location: 'Jibowu, Lagos' },
    { name: 'Young Shall Grow', category: 'Logistics', location: 'Mazamaza, Lagos' },
    { name: 'Peace Mass Transit', category: 'Logistics', location: 'Enugu, Enugu' },
    { name: 'God is Good Motors', category: 'Logistics', location: 'Benin City, Edo' },

    // --- AUTOMOBILES (15) ---
    { name: 'Innoson Vehicles', category: 'Automobiles', location: 'Nnewi, Anambra' },
    { name: 'Coscharis Motors', category: 'Automobiles', location: 'Lekki, Lagos' },
    { name: 'Elizade Motors', category: 'Automobiles', location: 'Ikeja, Lagos' },
    { name: 'Globe Motors', category: 'Automobiles', location: 'Victoria Island, Lagos' },
    { name: 'Stallion Motors', category: 'Automobiles', location: 'Victoria Island, Lagos' },
    { name: 'Lanre Shittu Motors', category: 'Automobiles', location: 'Surulere, Lagos' },
    { name: 'Kia Nigeria', category: 'Automobiles', location: 'Victoria Island, Lagos' },
    { name: 'Honda Manufacturing', category: 'Automobiles', location: 'Ota, Ogun' },
    { name: 'Nord Automobiles', category: 'Automobiles', location: 'Sangotedo, Lagos' },
    { name: 'Jet Systems', category: 'Automobiles', location: 'Gbagada, Lagos' },
    { name: 'Toyota Nigeria', category: 'Automobiles', location: 'Lekki, Lagos' },
    { name: 'Hyundai Nigeria', category: 'Automobiles', location: 'Victoria Island, Lagos' },
    { name: 'Mikano Motors', category: 'Automobiles', location: 'Victoria Island, Lagos' },
    { name: 'Cars45', category: 'Automobiles', location: 'Ikeja, Lagos' },
    { name: 'Autochek', category: 'Automobiles', location: 'Lekki, Lagos' },

    // --- MEDIA & ENTERTAINMENT (30) ---
    { name: 'Channels TV', category: 'Media', location: 'Isheri North, Lagos' },
    { name: 'Arise News', category: 'Media', location: 'Ikoyi, Lagos' },
    { name: 'TVC News', category: 'Media', location: 'Ikosi, Lagos' },
    { name: 'Punch Newspapers', category: 'Media', location: 'Magboro, Ogun' },
    { name: 'ThisDay', category: 'Media', location: 'Apapa, Lagos' },
    { name: 'Vanguard', category: 'Media', location: 'Apapa, Lagos' },
    { name: 'BusinessDay', category: 'Media', location: 'Apapa, Lagos' },
    { name: 'Linda Ikeji Blog', category: 'Media', location: 'Lekki, Lagos' },
    { name: 'Pulse Nigeria', category: 'Media', location: 'Lekki, Lagos' },
    { name: 'NairaLand', category: 'Media', location: 'Ota, Ogun' },
    { name: 'Beat FM', category: 'Media', location: 'Ikoyi, Lagos' },
    { name: 'Cool FM', category: 'Media', location: 'Victoria Island, Lagos' },
    { name: 'Soundcity', category: 'Media', location: 'Lekki, Lagos' },
    { name: 'Wazobia FM', category: 'Media', location: 'Victoria Island, Lagos' },
    { name: 'Nigeria Info', category: 'Media', location: 'Victoria Island, Lagos' },
    { name: 'Inspiration FM', category: 'Media', location: 'Victoria Island, Lagos' },
    { name: 'Classic FM', category: 'Media', location: 'Ikoyi, Lagos' },
    { name: 'Filmhouse Cinemas', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Genesis Cinemas', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Silverbird Cinemas', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Viva Cinemas', category: 'Other', location: 'Iikeja, Lagos' },
    { name: 'Mavin Records', category: 'Media', location: 'Victoria Island, Lagos' },
    { name: 'YBNL Nation', category: 'Media', location: 'Lekki, Lagos' },
    { name: 'DMW', category: 'Media', location: 'Lekki, Lagos' },
    { name: 'Chocolate City', category: 'Media', location: 'Gbagada, Lagos' },
    { name: 'EbonyLife Place', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Landmark Beach', category: 'Travel & Hotels', location: 'Victoria Island, Lagos' },
    { name: 'Hi-Impact Planet', category: 'Other', location: 'Ibafo, Ogun' },
    { name: 'Upbeat Centre', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Rufus & Bee', category: 'Other', location: 'Lekki, Lagos' },

    // --- REAL ESTATE (20) ---
    { name: 'Jide Taiwo & Co', category: 'Real Estate', location: 'Victoria Island, Lagos' },
    { name: 'Diya Fatimilehin', category: 'Real Estate', location: 'Victoria Island, Lagos' },
    { name: 'LandWey', category: 'Real Estate', location: 'Lekki, Lagos' },
    { name: 'Mixta Africa', category: 'Real Estate', location: 'Ikoyi, Lagos' },
    { name: 'Knight Frank', category: 'Real Estate', location: 'Lagos Island, Lagos' },
    { name: 'Fine and Country', category: 'Real Estate', location: 'Ikoyi, Lagos' },
    { name: 'Alpha Mead', category: 'Real Estate', location: 'Ikeja, Lagos' },
    { name: 'UPDC', category: 'Real Estate', location: 'Marina, Lagos' },
    { name: 'RevolutionPlus', category: 'Real Estate', location: 'Ikeja, Lagos' },
    { name: 'Adron Homes', category: 'Real Estate', location: 'Omole, Lagos' },
    { name: 'Brains & Hammers', category: 'Real Estate', location: 'Abuja, FCT' },
    { name: 'Cosgrove', category: 'Real Estate', location: 'Wuse 2, Abuja' },
    { name: 'Urban Shelter', category: 'Real Estate', location: 'Abuja, FCT' },
    { name: 'Broll Nigeria', category: 'Real Estate', location: 'Victoria Island, Lagos' },
    { name: 'Joe Etoniru', category: 'Real Estate', location: 'Lekki, Lagos' },
    { name: 'Ubosi Eleh', category: 'Real Estate', location: 'Ikeja, Lagos' },
    { name: 'Haven Homes', category: 'Real Estate', location: 'Lekki, Lagos' },
    { name: 'Cappa & D\'Alberto', category: 'Real Estate', location: 'Lagos Island, Lagos' },
    { name: 'Elalan Construction', category: 'Real Estate', location: 'Ikoyi, Lagos' },
    { name: 'ITB Nigeria', category: 'Real Estate', location: 'Victoria Island, Lagos' },

    // --- INSURANCE (15) ---
    { name: 'AIICO Insurance', category: 'Insurance', location: 'Victoria Island, Lagos' },
    { name: 'AXA Mansard', category: 'Insurance', location: 'Victoria Island, Lagos' },
    { name: 'Leadway Assurance', category: 'Insurance', location: 'Iponri, Lagos' },
    { name: 'Mutual Benefits', category: 'Insurance', location: 'Ilupeju, Lagos' },
    { name: 'Cornerstone', category: 'Insurance', location: 'Victoria Island, Lagos' },
    { name: 'Custodian', category: 'Insurance', location: 'Yaba, Lagos' },
    { name: 'NEM Insurance', category: 'Insurance', location: 'Obanikoro, Lagos' },
    { name: 'Sovereign Trust', category: 'Insurance', location: 'Victoria Island, Lagos' },
    { name: 'Lasaco Assurance', category: 'Insurance', location: 'Ikeja, Lagos' },
    { name: 'Consolidated Hallmark', category: 'Insurance', location: 'Obanikoro, Lagos' },
    { name: 'Prestige Assurance', category: 'Insurance', location: 'Lagos Island, Lagos' },
    { name: 'Royal Exchange', category: 'Insurance', location: 'Oshodi, Lagos' },
    { name: 'Sunu Assurances', category: 'Insurance', location: 'Victoria Island, Lagos' },
    { name: 'Veritas Kapital', category: 'Insurance', location: 'Abuja, FCT' },
    { name: 'Linkage Assurance', category: 'Insurance', location: 'Lekki, Lagos' },

    // --- EDUCATION (20) ---
    { name: 'Covenant University', category: 'Education', location: 'Ota, Ogun' },
    { name: 'Unilag', category: 'Education', location: 'Akoka, Lagos' },
    { name: 'Afe Babalola', category: 'Education', location: 'Ado-Ekiti, Ekiti' },
    { name: 'Pan-Atlantic', category: 'Education', location: 'Ibeju-Lekki, Lagos' },
    { name: 'Babcock University', category: 'Education', location: 'Ilishan-Remo, Ogun' },
    { name: 'Greensprings', category: 'Education', location: 'Lekki, Lagos' },
    { name: 'Grange School', category: 'Education', location: 'Ikeja, Lagos' },
    { name: 'Daywaterman', category: 'Education', location: 'Abeokuta, Ogun' },
    { name: 'Corona Schools', category: 'Education', location: 'Ikoyi, Lagos' },
    { name: 'Meadow Hall', category: 'Education', location: 'Lekki, Lagos' },
    { name: 'Chrisland Schools', category: 'Education', location: 'Ikeja, Lagos' },
    { name: 'Atlantic Hall', category: 'Education', location: 'Epe, Lagos' },
    { name: 'Loyola Jesuit', category: 'Education', location: 'Abuja, FCT' },
    { name: 'British International', category: 'Education', location: 'Victoria Island, Lagos' },
    { name: 'Lagos Business School', category: 'Education', location: 'Ajah, Lagos' },
    { name: 'NIIT Nigeria', category: 'Education', location: 'Ikeja, Lagos' },
    { name: 'Aptech', category: 'Education', location: 'Victoria Island, Lagos' },
    { name: 'uLesson', category: 'Education', location: 'Jabi, Abuja' },
    { name: 'AltSchool Africa', category: 'Education', location: 'Lekki, Lagos' },
    { name: 'Decagon', category: 'Education', location: 'Lekki, Lagos' },

    // --- AVIATION (10) ---
    { name: 'Air Peace', category: 'Travel & Hotels', location: 'Ikeja, Lagos' },
    { name: 'Ibom Air', category: 'Travel & Hotels', location: 'Uyo, Akwa Ibom' },
    { name: 'Arik Air', category: 'Travel & Hotels', location: 'Ikeja, Lagos' },
    { name: 'Dana Air', category: 'Travel & Hotels', location: 'Ikeja, Lagos' },
    { name: 'Max Air', category: 'Travel & Hotels', location: 'Kano, Kano' },
    { name: 'Green Africa', category: 'Travel & Hotels', location: 'Ikeja, Lagos' },
    { name: 'Overland Airways', category: 'Travel & Hotels', location: 'Ikeja, Lagos' },
    { name: 'ValueJet', category: 'Travel & Hotels', location: 'Ikeja, Lagos' },
    { name: 'United Nigeria', category: 'Travel & Hotels', location: 'Enugu, Enugu' },
    { name: 'Aero Contractors', category: 'Travel & Hotels', location: 'Ikeja, Lagos' },

    // --- LAW & CONSULTING (20) ---
    { name: 'Aluko & Oyebode', category: 'Legal Services', location: 'Ikoyi, Lagos' },
    { name: 'Banwo & Ighodalo', category: 'Legal Services', location: 'Ikoyi, Lagos' },
    { name: 'Templars', category: 'Legal Services', location: 'Victoria Island, Lagos' },
    { name: 'Udo Udoma & Belo-Osagie', category: 'Legal Services', location: 'Lagos Island, Lagos' },
    { name: 'Olaniwun Ajayi', category: 'Legal Services', location: 'Banana Island, Lagos' },
    { name: 'Aelex', category: 'Legal Services', location: 'Ikoyi, Lagos' },
    { name: 'Jackson, Etti & Edu', category: 'Legal Services', location: 'Victoria Island, Lagos' },
    { name: 'G. Elias & Co', category: 'Legal Services', location: 'Lagos Island, Lagos' },
    { name: 'Wole Olanipekun', category: 'Legal Services', location: 'Ikoyi, Lagos' },
    { name: 'Falana & Falana', category: 'Legal Services', location: 'Ikeja, Lagos' },
    { name: 'KPMG Nigeria', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'PwC Nigeria', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Deloitte Nigeria', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'EY Nigeria', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'McKinsey & Company', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: 'Boston Consulting Group', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: 'Accenture Nigeria', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Phillips Consulting', category: 'Other', location: 'Lagos Island, Lagos' },
    { name: 'Verraki Partners', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Andersen Nigeria', category: 'Other', location: 'Ikoyi, Lagos' },

    // --- FASHION & LIFESTYLE (20) ---
    { name: 'Mai Atafo', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Lisa Folawiyo', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: 'Dye Lab', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Orange Culture', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Deola Sagoe', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Tiffany Amber', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: 'Kenneth Ize', category: 'Other', location: 'Lagos Island, Lagos' },
    { name: 'Maki Oh', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Ugo Monye', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Banke Kuku', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: 'Andrea Iyamah', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Lanre Da Silva', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: 'Atafo', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Odio Mimonet', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Ituen Basi', category: 'Other', location: 'Ikeja, Lagos' },
    { name: 'Ejiro Amos Tafiri', category: 'Other', location: 'Ikeja, Lagos' },
    { name: 'Tubo', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Matopeda', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Style Temple', category: 'Other', location: 'Wuse, Abuja' },
    { name: 'Hudayya', category: 'Other', location: 'Wuse 2, Abuja' },

    // --- TECH & STARTUPS (20) ---
    { name: 'Andela', category: 'IT Services', location: 'Epic Tower, Lagos' },
    { name: 'Jobberman', category: 'Jobs', location: 'Victoria Island, Lagos' },
    { name: 'IrokoTV', category: 'Media', location: 'Anthony Village, Lagos' },
    { name: 'Hotels.ng', category: 'Travel & Hotels', location: 'Yaba, Lagos' },
    { name: 'Printivo', category: 'IT Services', location: 'Yaba, Lagos' },
    { name: 'Terragon Group', category: 'IT Services', location: 'Victoria Island, Lagos' },
    { name: 'CcHub', category: 'IT Services', location: 'Yaba, Lagos' },
    { name: 'Ventures Platform', category: 'IT Services', location: 'Abuja, FCT' },
    { name: 'Techpoint', category: 'Media', location: 'Ikotun, Lagos' },
    { name: 'TechCabal', category: 'Media', location: 'Yaba, Lagos' },
    { name: 'Stears', category: 'Media', location: 'Lekki, Lagos' },
    { name: 'Zikoko', category: 'Media', location: 'Yaba, Lagos' },
    { name: 'Eden Life', category: 'Other', location: 'Yaba, Lagos' },
    { name: 'Chowdeck', category: 'Logistics', location: 'Yaba, Lagos' },
    { name: 'FoodCourt', category: 'Food & Drink', location: 'Lekki, Lagos' },
    { name: 'Vendease', category: 'Other', location: 'Ikeja, Lagos' },
    { name: 'TradeDepot', category: 'Other', location: 'Ikeja, Lagos' },
    { name: 'Sabi', category: 'Other', location: 'Ikeja, Lagos' },
    { name: 'Omnibiz', category: 'Other', location: 'Ikeja, Lagos' },
    { name: 'Bature Brewery', category: 'Food & Drink', location: 'Victoria Island, Lagos' },

    // --- MANUFACTURING & INDUSTRIAL (15) ---
    { name: 'Dangote Cement', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: 'Lafarge Africa', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: 'Nestle Nigeria', category: 'Other', location: 'Ilupeju, Lagos' },
    { name: 'Unilever', category: 'Other', location: 'Oregun, Lagos' },
    { name: 'PZ Cussons', category: 'Other', location: 'Ilupeju, Lagos' },
    { name: 'Nigerian Breweries', category: 'Other', location: 'Iganmu, Lagos' },
    { name: 'Guinness Nigeria', category: 'Other', location: 'Ikeja, Lagos' },
    { name: 'Julius Berger', category: 'Other', location: 'Utako, Abuja' },
    { name: 'Reynolds Construction', category: 'Other', location: 'Jabi, Abuja' },
    { name: 'Hitech', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Seven-Up', category: 'Other', location: 'Ijora, Lagos' },
    { name: 'Coca-Cola Hellenic', category: 'Other', location: 'Ebute Metta, Lagos' },
    { name: 'Promasidor', category: 'Other', location: 'Isolo, Lagos' },
    { name: 'Honeywell Flour', category: 'Other', location: 'Apapa, Lagos' },
    { name: 'BUA Group', category: 'Other', location: 'Victoria Island, Lagos' },

    // --- MARKETING & ADVERTISING (15) ---
    { name: 'X3M Ideas', category: 'IT Services', location: 'Ikeja, Lagos' },
    { name: 'Insight Publicis', category: 'IT Services', location: 'Ikeja, Lagos' },
    { name: 'Noah\'s Ark', category: 'IT Services', location: 'Ikeja, Lagos' },
    { name: 'DDB Lagos', category: 'IT Services', location: 'Ikeja, Lagos' },
    { name: 'STB-McCann', category: 'IT Services', location: 'Ikeja, Lagos' },
    { name: 'Centrespread', category: 'IT Services', location: 'Ilupeju, Lagos' },
    { name: '7even Interactive', category: 'IT Services', location: 'Ikeja, Lagos' },
    { name: 'Verdant Zeal', category: 'IT Services', location: 'Ikeja, Lagos' },
    { name: 'SO&U', category: 'IT Services', location: 'Ikeja, Lagos' },
    { name: 'Prima Garnet', category: 'IT Services', location: 'Ilupeju, Lagos' },
    { name: 'Rosabel', category: 'IT Services', location: 'Ikeja, Lagos' },
    { name: 'Yellow Brick Road', category: 'IT Services', location: 'Lekki, Lagos' },
    { name: 'Anakle', category: 'IT Services', location: 'Lekki, Lagos' },
    { name: 'BrandEye', category: 'IT Services', location: 'Ikeja, Lagos' },
    { name: 'Wildflower', category: 'IT Services', location: 'Lekki, Lagos' },

    // --- AGRICULTURE (10) ---
    { name: 'Babban Gona', category: 'Agriculture', location: 'Lagos, Lagos' },
    { name: 'Hello Tractor', category: 'Agriculture', location: 'Abuja, FCT' },
    { name: 'Releaf', category: 'Agriculture', location: 'Uyo, Akwa Ibom' },
    { name: 'Agricorp', category: 'Agriculture', location: 'Lagos, Lagos' },
    { name: 'Crop2Cash', category: 'Agriculture', location: 'Ibadan, Oyo' },
    { name: 'Farm4Me', category: 'Agriculture', location: 'Abuja, FCT' },
    { name: 'EZFarming', category: 'Agriculture', location: 'Lagos, Lagos' },
    { name: 'Menorah Farms', category: 'Agriculture', location: 'Ogun, Ogun' },
    { name: 'Jora Farm', category: 'Agriculture', location: 'Jos, Plateau' },
    { name: 'Olam Agri', category: 'Agriculture', location: 'Lagos, Lagos' },

    // --- EVENTS & ENTERTAINMENT (10) ---
    { name: 'Balmoral Group', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Eventful', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Zapphaire', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Ibidunni Ighodalo', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Newton & David', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Elizabeth R', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Furtulluh', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Rostal Flowers', category: 'Other', location: 'Ikeja, Lagos' },
    { name: 'Aralia By Nature', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Omar Gardens', category: 'Other', location: 'Lekki, Lagos' },

    // --- BEAUTY & SPA (15) ---
    { name: 'House of Tara', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'BMPro', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: 'Zaron', category: 'Other', location: 'Ikeja, Lagos' },
    { name: 'Hegai & Esther', category: 'Other', location: 'Ikeja, Lagos' },
    { name: 'Yanga Beauty', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Nuban Beauty', category: 'Other', location: 'Lagos, Lagos' },
    { name: 'Gazelle', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Belfiore', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Venivici', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Apples & Oranges', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Oriki', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Laserderm', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Clear Essence', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: 'B-Natural', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Montaigne Place', category: 'Other', location: 'Victoria Island, Lagos' },

    // --- RETAIL & FASHION (15) ---
    { name: 'Polo Avenue', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Temple Muse', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Alara', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Zashadu', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: '360 Creative Hub', category: 'Other', location: 'Surulere, Lagos' },
    { name: 'Fashpa', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Grey Velvet', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'L\'Espace', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Meidei', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Zazaii', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Elanred', category: 'Other', location: 'Lekki, Lagos' },
    { name: '41 Luxe', category: 'Other', location: 'Wuse, Abuja' },
    { name: 'Garment Care', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Soo\'s Place', category: 'Other', location: 'Surulere, Lagos' },
    { name: 'Ruff \'n\' Tumble', category: 'Other', location: 'Ikeja, Lagos' },

    // --- FITNESS (10) ---
    { name: 'I-Fitness', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Profit', category: 'Other', location: 'Ikeja, Lagos' },
    { name: 'Bodyline', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: 'K-Fitness', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Lotus Fitness', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Pure grit', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Fit Nigeria', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Zumba with Ezinne', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Adna Barnet', category: 'Other', location: 'Ikeja, Lagos' },
    { name: 'Skyfit', category: 'Other', location: 'Lekki, Lagos' },

    // --- COWORKING (5) ---
    { name: 'Workstation', category: 'Other', location: 'Victoria Island, Lagos' },
    { name: 'Venia', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'CapitalSquare', category: 'Other', location: 'Lekki, Lagos' },
    { name: 'Lagos Garage', category: 'Other', location: 'Ikoyi, Lagos' },
    { name: 'The Village', category: 'Other', location: 'Yaba, Lagos' }
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
        console.log(`   - Adding Real Nigerian Companies...`);

        let addedCount = 0;
        for (const biz of realBusinesses) {
            if (!existingNames.has(biz.name)) {
                // Generate a consistent slug
                const slug = biz.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                newBusinesses.push({
                    name: biz.name,
                    category: biz.category,
                    categories: [biz.category],
                    location: biz.location,
                    description: biz.description || `${biz.name} is a leading organization in the ${biz.category} sector, providing excellent services in Nigeria.`,
                    website: biz.website || `https://www.${slug}.com.ng`,
                    phone: biz.phone || generatePhone(),
                    email: biz.email || `info@${slug}.com.ng`,

                    // TRUST SCORING & REVIEW CONFIG (Per User Request)
                    rating: 5.0,
                    reviewCount: 0,

                    isVerified: Math.random() > 0.6, // 40% verified chance
                    status: 'approved',
                    subscriptionTier: 'basic',
                    subscriptionStatus: 'inactive',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                existingNames.add(biz.name);
                addedCount++;
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
        console.log(`   - Newly Added: ${addedCount}`);
        console.log(`   - Preserved: ${businessesWithOwners.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedMassive();

export const businesses = [
    // Banks
    { id: 101, name: 'Zenith Bank', category: 'Banks', rating: 4.5, reviews: 3200, location: 'Victoria Island, Lagos', verified: true },
    { id: 102, name: 'GTBank', category: 'Banks', rating: 4.2, reviews: 5100, location: 'Victoria Island, Lagos', verified: true },
    { id: 103, name: 'FirstBank', category: 'Banks', rating: 3.9, reviews: 2800, location: 'Marina, Lagos', verified: true },
    { id: 104, name: 'Access Bank', category: 'Banks', rating: 4.0, reviews: 4200, location: 'Victoria Island, Lagos', verified: true },
    { id: 105, name: 'UBA', category: 'Banks', rating: 3.8, reviews: 1900, location: 'Marina, Lagos', verified: true },

    // Ecommerce
    { id: 201, name: 'Jumia Nigeria', category: 'Ecommerce', rating: 3.8, reviews: 15400, location: 'Ogba, Lagos', verified: true },
    { id: 202, name: 'Konga', category: 'Ecommerce', rating: 4.1, reviews: 6200, location: 'Ikeja, Lagos', verified: true },
    { id: 203, name: 'Jiji Nigeria', category: 'Ecommerce', rating: 4.4, reviews: 9800, location: 'Yaba, Lagos', verified: true },
    { id: 204, name: 'Slot Systems', category: 'Ecommerce', rating: 4.6, reviews: 1200, location: 'Ikeja, Lagos', verified: true },
    { id: 205, name: 'PayPorte', category: 'Ecommerce', rating: 3.5, reviews: 850, location: 'Lekki, Lagos', verified: false },

    // Telecom
    { id: 301, name: 'MTN Nigeria', category: 'Telecom', rating: 4.3, reviews: 25000, location: 'Ikoyi, Lagos', verified: true },
    { id: 302, name: 'Airtel Nigeria', category: 'Telecom', rating: 4.1, reviews: 18000, location: 'Banana Island, Lagos', verified: true },
    { id: 303, name: 'Glo (Globacom)', category: 'Telecom', rating: 3.7, reviews: 12000, location: 'Victoria Island, Lagos', verified: true },
    { id: 304, name: '9mobile', category: 'Telecom', rating: 3.5, reviews: 5400, location: 'Banana Island, Lagos', verified: true },
    { id: 305, name: 'Spectranet', category: 'Telecom', rating: 3.9, reviews: 2100, location: 'Ikeja, Lagos', verified: true },

    // Logistics
    { id: 401, name: 'GIG Logistics (GIGL)', category: 'Logistics', rating: 4.0, reviews: 4500, location: 'Gbagada, Lagos', verified: true },
    { id: 402, name: 'RedStar Express', category: 'Logistics', rating: 3.9, reviews: 1100, location: 'Airport, Lagos', verified: true },
    { id: 403, name: 'DHL Nigeria', category: 'Logistics', rating: 4.6, reviews: 3200, location: 'Isolo, Lagos', verified: true },
    { id: 404, name: 'CourierPlus', category: 'Logistics', rating: 3.6, reviews: 750, location: 'Ikeja, Lagos', verified: true },
    { id: 405, name: 'Kwik Delivery', category: 'Logistics', rating: 4.4, reviews: 920, location: 'Victoria Island, Lagos', verified: true },

    // Travel & Hotels
    { id: 501, name: 'Wakanow', category: 'Travel & Hotels', rating: 3.7, reviews: 2400, location: 'Lekki, Lagos', verified: true },
    { id: 502, name: 'Travelstart Nigeria', category: 'Travel & Hotels', rating: 4.2, reviews: 1800, location: 'Ikeja, Lagos', verified: true },
    { id: 503, name: 'Eko Hotels & Suites', category: 'Travel & Hotels', rating: 4.7, reviews: 8500, location: 'Victoria Island, Lagos', verified: true },
    { id: 504, name: 'Transcorp Hilton', category: 'Travel & Hotels', rating: 4.8, reviews: 6200, location: 'Maitama, Abuja', verified: true },
    { id: 505, name: 'Dana Air', category: 'Travel & Hotels', rating: 3.4, reviews: 1500, location: 'Ikeja, Lagos', verified: true },

    // Restaurants
    { id: 601, name: 'Chicken Republic', category: 'Restaurants', rating: 4.1, reviews: 12000, location: 'Nationwide', verified: true },
    { id: 602, name: 'Kilimanjaro', category: 'Restaurants', rating: 3.9, reviews: 4500, location: 'Nationwide', verified: true },
    { id: 603, name: 'The Place Restaurant', category: 'Restaurants', rating: 4.3, reviews: 7800, location: 'Lekki, Lagos', verified: true },
    { id: 604, name: 'Casper & Gambini\'s', category: 'Restaurants', rating: 4.5, reviews: 2100, location: 'VI, Lagos', verified: true },
    { id: 605, name: 'Yellow Chilli', category: 'Restaurants', rating: 4.6, reviews: 1800, location: 'Ikeja, Lagos', verified: true },

    // Health
    { id: 701, name: 'Lagoon Hospitals', category: 'Health', rating: 4.2, reviews: 3100, location: 'Ikoyi, Lagos', verified: true },
    { id: 702, name: 'Reddington Hospital', category: 'Health', rating: 4.5, reviews: 2400, location: 'VI, Lagos', verified: true },
    { id: 703, name: 'St. Nicholas Hospital', category: 'Health', rating: 4.3, reviews: 1900, location: 'Lagos Island', verified: true },
    { id: 704, name: 'HealthPlus Pharmacy', category: 'Health', rating: 4.1, reviews: 5600, location: 'Nationwide', verified: true },
    { id: 705, name: 'Medplus Pharmacy', category: 'Health', rating: 4.2, reviews: 4800, location: 'Nationwide', verified: true },

    // Fintech
    { id: 801, name: 'OPay Nigeria', category: 'Fintech', rating: 4.7, reviews: 45000, location: 'Ikeja, Lagos', verified: true },
    { id: 802, name: 'PalmPay', category: 'Fintech', rating: 4.6, reviews: 38000, location: 'Ikeja, Lagos', verified: true },
    { id: 803, name: 'PiggyVest', category: 'Fintech', rating: 4.8, reviews: 25000, location: 'Victoria Island, Lagos', verified: true },
    { id: 804, name: 'Moniepoint', category: 'Fintech', rating: 4.5, reviews: 12000, location: 'Oyo, Nigeria', verified: true },
    { id: 805, name: 'Carbon', category: 'Fintech', rating: 4.3, reviews: 9500, location: 'Lekki, Lagos', verified: true },

    // Real Estate
    { id: 901, name: 'Jide Taiwo & Co', category: 'Real Estate', rating: 3.9, reviews: 850, location: 'Nationwide', verified: true },
    { id: 902, name: 'PropertyPro.ng', category: 'Real Estate', rating: 4.1, reviews: 2100, location: 'Ikeja, Lagos', verified: true },
    { id: 903, name: 'Private Property Nigeria', category: 'Real Estate', rating: 4.0, reviews: 1500, location: 'Lekki, Lagos', verified: true },
    { id: 904, name: 'LandWey', category: 'Real Estate', rating: 4.4, reviews: 920, location: 'Ajah, Lagos', verified: true },
    { id: 905, name: 'Adron Homes', category: 'Real Estate', rating: 3.6, reviews: 2800, location: 'Magodo, Lagos', verified: true },

    // Insurance
    { id: 1001, name: 'AXA Mansard', category: 'Insurance', rating: 4.4, reviews: 4200, location: 'VI, Lagos', verified: true },
    { id: 1002, name: 'AIICO Insurance', category: 'Insurance', rating: 4.1, reviews: 2100, location: 'VI, Lagos', verified: true },
    { id: 1003, name: 'Leadway Assurance', category: 'Insurance', rating: 4.3, reviews: 3500, location: 'Iponri, Lagos', verified: true },
    { id: 1004, name: 'Custodian Investment', category: 'Insurance', rating: 4.0, reviews: 1200, location: 'Lagos Island', verified: true },
    { id: 1005, name: 'Mutual Benefits', category: 'Insurance', rating: 3.7, reviews: 850, location: 'Amuwo, Lagos', verified: true },
];

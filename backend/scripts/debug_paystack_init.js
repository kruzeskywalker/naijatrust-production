require('dotenv').config();
const Paystack = require('paystack-node');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
console.log('PAYSTACK_SECRET_KEY present:', !!PAYSTACK_SECRET_KEY);

if (!PAYSTACK_SECRET_KEY) {
    console.error('No secret key found');
    process.exit(1);
}

const paystack = new Paystack(PAYSTACK_SECRET_KEY);

async function testInit() {
    try {
        const payload = {
            email: 'admin@naijatrust.com',
            amount: 1500000,
            plan: 'PLN_ldc1tafmetd132f', // Premium Monthly
            callback_url: 'http://localhost:5173/callback'
        };

        console.log('Testing initialization with payload:', payload);

        const response = await paystack.initializeTransaction(payload);

        console.log('Response Status:', response.body?.status);
        console.log('Response Message:', response.body?.message);
        console.log('Response Data:', response.body?.data);

    } catch (error) {
        console.error('Error:', error);
    }
}

testInit();

const nodemailer = require('nodemailer');

console.log('Type of nodemailer:', typeof nodemailer);
console.log('Keys of nodemailer:', Object.keys(nodemailer));

if (typeof nodemailer.createTransporter === 'function') {
    console.log('✅ createTransporter exists and is a function');
} else {
    console.log('❌ createTransporter is NOT a function');
    console.log('nodemailer value:', nodemailer);
}

try {
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: 'test@example.com',
            pass: 'password'
        }
    });
    console.log('Transporter created successfully');
} catch (error) {
    console.error('Error creating transporter:', error.message);
}

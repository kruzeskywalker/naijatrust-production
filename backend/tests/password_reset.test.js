const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

// Mock email service
jest.mock('../utils/emailService', () => ({
    sendEmail: jest.fn(),
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
    emailTemplates: {}
}));

const { sendPasswordResetEmail } = require('../utils/emailService');

describe('Password Reset Flow', () => {
    beforeAll(async () => {
        // Connect to DB if not connected
        if (mongoose.connection.readyState === 0) {
            console.log('Connecting to DB...', process.env.MONGODB_URI || 'NO URI');
            if (process.env.MONGODB_URI) {
                await mongoose.connect(process.env.MONGODB_URI);
                console.log('Connected to DB');
            } else {
                console.warn("No MONGODB_URI found in process.env");
            }
        } else {
            console.log('Already connected to DB');
        }
    });

    afterAll(async () => {
        await User.deleteMany({ email: 'testreset@example.com' });
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        // Ensure clean state
        await User.deleteMany({ email: 'testreset@example.com' });
    });

    it('should complete the full password reset flow', async () => {
        // 1. Create a user
        const userData = {
            name: 'Test Reset User',
            email: 'testreset@example.com',
            password: 'password123'
        };
        const signupRes = await request(app).post('/api/auth/signup').send(userData);
        if (signupRes.statusCode !== 201) {
            console.error('Signup Failed Code:', signupRes.statusCode);
            console.error('Signup Failed Body:', signupRes.body);
            console.error('Signup Failed Text:', signupRes.text);
        }
        expect(signupRes.statusCode).toBe(201);

        // 2. Request Password Reset
        const forgotRes = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: userData.email });

        expect(forgotRes.statusCode).toBe(200);
        expect(sendPasswordResetEmail).toHaveBeenCalled();

        // 3. Extract Token from mock call
        // access args of the first call: [email, resetUrl, name]
        const emailCall = sendPasswordResetEmail.mock.calls[0];
        const resetUrl = emailCall[1];
        // resetUrl format: .../reset-password/<token>
        const token = resetUrl.split('/').pop();
        expect(token).toBeDefined();

        console.log('Extracted Reset Token:', token);

        // 4. Reset Password
        const newPassword = 'newpassword456';
        const resetRes = await request(app)
            .patch(`/api/auth/reset-password/${token}`)
            .send({ password: newPassword });

        expect(resetRes.statusCode).toBe(200);

        // 5. Login with OLD password (should fail)
        const failLoginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: userData.email, password: 'password123' });
        expect(failLoginRes.statusCode).toBe(401);

        // 6. Login with NEW password (should success)
        const successLoginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: userData.email, password: newPassword });

        expect(successLoginRes.statusCode).toBe(200);
        expect(successLoginRes.body).toHaveProperty('token');
    });
});

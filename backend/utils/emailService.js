const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    // Check if we have email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('Email credentials not configured. Emails will be logged to console.');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD // App Password for Gmail
        }
    });
};

// Generic send email function
const sendEmail = async ({ to, subject, html, text }) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"NaijaTrust" <${process.env.EMAIL_USER || 'noreply@naijatrust.com'}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '')
    };

    try {
        if (transporter) {
            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${to}:`, info.messageId);
            return { success: true, messageId: info.messageId };
        } else {
            // Development mode - log the email
            console.log('\n📧 ===== EMAIL (DEV MODE) =====');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body:\n${text || html}`);
            console.log('==============================\n');
            return { success: true, devMode: true };
        }
    } catch (error) {
        console.error('❌ Error sending email:', error);
        // In dev mode, don't fail
        if (!transporter) {
            return { success: false, devMode: true, error: error.message };
        }
        throw error;
    }
};

const sendWelcomeEmail = async (email, name) => {
    return sendEmail({
        to: email,
        subject: 'Welcome to NaijaTrust!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #00A86B 0%, #008854 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to NaijaTrust!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>Thank you for signing up for NaijaTrust! We're excited to have you join our community.</p>
                        <p>Your account has been successfully created and verified. You can now start exploring businesses, writing reviews, and helping other Nigerians make better choices.</p>
                        <p>Best regards,<br>The NaijaTrust Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 NaijaTrust. Building trust in Nigerian businesses.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    });
};

const sendVerificationEmail = async (email, name, verificationToken) => {
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://www.naijatrust.ng' : (process.env.FRONTEND_URL || 'http://localhost:5173');
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    return sendEmail({
        to: email,
        subject: 'Verify Your NaijaTrust Account',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #00A86B 0%, #008854 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: #00A86B; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to NaijaTrust!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>Thank you for signing up for NaijaTrust! We're excited to have you join our community.</p>
                        <p>To complete your registration, please verify your email address:</p>
                        <div style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </div>
                        <p>Or copy and paste this link: ${verificationUrl}</p>
                        <p><strong>This link will expire in 24 hours.</strong></p>
                        <p>Best regards,<br>The NaijaTrust Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 NaijaTrust. Building trust in Nigerian businesses.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    });
};

const sendOtpEmail = async (email, name, otp) => {
    return sendEmail({
        to: email,
        subject: 'Your Verification Code - NaijaTrust',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #00A86B 0%, #008854 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: #e8f5e9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #00A86B; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Verification Code</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>Thank you for signing up with NaijaTrust. Please use the following One-Time Password (OTP) to verify your email address:</p>
                        <div class="otp-box">${otp}</div>
                        <p>This code is valid for 10 minutes. Do not share this code with anyone.</p>
                        <p>If you didn't request this code, please ignore this email.</p>
                        <p>Best regards,<br>The NaijaTrust Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 NaijaTrust. Building trust in Nigerian businesses.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    });
};

const sendPasswordResetEmail = async (email, resetUrl, name) => {
    return sendEmail({
        to: email,
        subject: 'Password Reset Request - NaijaTrust',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #00A86B 0%, #008854 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: #00A86B; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>You received this email because we received a request for a password reset for your account.</p>
                        <div style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </div>
                        <p>Or copy and paste this link: ${resetUrl}</p>
                        <p><strong>This link will expire in 10 minutes.</strong></p>
                        <p>If you didn't request a password reset, please ignore this email.</p>
                        <p>Best regards,<br>The NaijaTrust Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 NaijaTrust. Building trust in Nigerian businesses.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    });
};

// Email templates
const emailTemplates = {
    claimReceived: (userName, businessName, claimId) => ({
        subject: 'Claim Request Received - NaijaTrust',
        html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Claim Request Received</h2>
                    <p>Hi ${userName},</p>
                    <p>We've received your claim request for <strong>${businessName}</strong>.</p>
                    <p>Our admin team will review your request and get back to you within 2-3 business days.</p>
                    <p>Claim ID: ${claimId}</p>
                    <p>Best regards,<br>The NaijaTrust Team</p>
                </div>
            </body>
            </html>
        `
    }),
    claimApproved: (userName, businessName, dashboardUrl) => ({
        subject: 'Claim Approved - NaijaTrust',
        html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #00A86B;">Claim Approved!</h2>
                    <p>Hi ${userName},</p>
                    <p>Great news! Your claim for <strong>${businessName}</strong> has been approved.</p>
                    <p>Your business is now verified and you can manage it from your dashboard.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${dashboardUrl}" style="display: inline-block; padding: 15px 30px; background: #00A86B; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
                    </div>
                    <p>Best regards,<br>The NaijaTrust Team</p>
                </div>
            </body>
            </html>
        `
    }),
    claimRejected: (userName, businessName, reason) => ({
        subject: 'Claim Request Update - NaijaTrust',
        html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Claim Request Update</h2>
                    <p>Hi ${userName},</p>
                    <p>Unfortunately, we were unable to approve your claim for <strong>${businessName}</strong>.</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p>If you believe this is an error or would like to provide additional information, please contact our support team.</p>
                    <p>Best regards,<br>The NaijaTrust Team</p>
                </div>
            </body>
            </html>
        `
    })
};

module.exports = { sendEmail, sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendOtpEmail, emailTemplates };

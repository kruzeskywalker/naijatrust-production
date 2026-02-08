# NaijaTrust - Nigerian Consumer Review Platform

A trusted review platform empowering Nigerians to make better choices through transparent business reviews.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (free tier available)
- Gmail account (for email verification)
- Google Cloud account (for OAuth)

### Setup

1. **Clone and Install Dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Configure Environment Variables**
   
   Follow the comprehensive [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions on:
   - Setting up MongoDB Atlas (5 minutes)
   - Configuring Gmail for email verification (3 minutes)
   - Setting up Google OAuth (5 minutes)
   
   Or quickly create your `.env` file:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start the Application**
   
   **Option 1: Use the quick start script**
   ```bash
   ./start.sh
   ```
   
   **Option 2: Start manually**
   ```bash
   # Terminal 1 - Backend
   cd backend
   node server.js
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## ✨ Features

### Implemented
- ✅ User registration with email verification
- ✅ Google OAuth authentication
- ✅ JWT-based authentication
- ✅ Email verification with 24-hour token expiration
- ✅ User dashboard with verification status
- ✅ Resend verification email functionality
- ✅ Business search and discovery
- ✅ Review writing and rating system
- ✅ Category browsing
- ✅ Responsive design

### Authentication Flow
1. **Email Registration**: Users sign up with email and receive verification link
2. **Email Verification**: Click link to verify account (24-hour expiration)
3. **Google OAuth**: One-click signup/login with Google account
4. **Dashboard Access**: Verified users can write reviews and manage their profile

## 📁 Project Structure

```
naija-trust-2/
├── backend/
│   ├── config/
│   │   └── passport.js          # Google OAuth configuration
│   ├── models/
│   │   ├── User.js              # User model with verification
│   │   ├── Business.js
│   │   └── Review.js
│   ├── routes/
│   │   └── authRoutes.js        # Authentication endpoints
│   ├── utils/
│   │   └── emailService.js      # Email verification service
│   ├── server.js                # Express server
│   ├── .env                     # Environment variables (create this)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state management
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Signup.jsx       # Registration with Google OAuth
│   │   │   ├── Login.jsx        # Login with Google OAuth
│   │   │   ├── VerifyEmail.jsx  # Email verification handler
│   │   │   ├── Dashboard.jsx    # User dashboard
│   │   │   ├── Search.jsx
│   │   │   ├── BusinessProfile.jsx
│   │   │   └── WriteReview.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── SETUP_GUIDE.md              # Detailed setup instructions
├── start.sh                    # Quick start script
└── README.md                   # This file
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user (requires auth)

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Passport.js (Google OAuth)
- Nodemailer (Email verification)
- JWT (Authentication)
- bcrypt (Password hashing)

### Frontend
- React + Vite
- React Router
- Context API (State management)
- Lucide React (Icons)
- CSS3 (Styling)

## 📧 Email Verification

The platform uses email verification to ensure authentic users:

- **Development Mode**: Verification URLs are logged to console when email credentials are not configured
- **Production Mode**: Emails are sent via Gmail SMTP (or your configured email service)
- **Token Expiration**: Verification links expire after 24 hours
- **Resend Option**: Users can request new verification emails from their dashboard

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ JWT tokens with 30-day expiration
- ✅ Verification tokens with 24-hour expiration
- ✅ HTTP-only cookies in production
- ✅ CORS protection
- ✅ OAuth state parameter validation
- ✅ Environment variable protection

## 🧪 Testing

### Manual Testing Checklist

1. **Email Registration**
   - Sign up with email
   - Receive verification email
   - Click verification link
   - Login with credentials

2. **Google OAuth**
   - Click "Continue with Google"
   - Authorize application
   - Auto-login to dashboard

3. **Verification Status**
   - Unverified users see banner
   - Resend email functionality works
   - Verified users have full access

## 📚 Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup instructions
- [walkthrough.md](./brain/walkthrough.md) - Implementation walkthrough

## 🚀 Deployment

### Production Checklist
- [ ] Set up production MongoDB cluster
- [ ] Configure production email service (SendGrid/Mailgun recommended)
- [ ] Update Google OAuth with production domain
- [ ] Generate strong JWT_SECRET and SESSION_SECRET
- [ ] Enable HTTPS
- [ ] Update CORS settings
- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB IP whitelist

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

All rights reserved © 2026 NaijaTrust

## 🆘 Support

For setup help:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review error messages in console
3. Verify all environment variables are set correctly

Common issues:
- **MongoDB connection failed**: Check connection string and network access
- **Email not sending**: Verify Gmail app password and 2FA
- **Google OAuth error**: Check redirect URI matches exactly
- **Verification link expired**: Use "Resend Email" button in dashboard

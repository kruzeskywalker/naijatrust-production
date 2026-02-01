# NaijaTrust - Production Version

**🚀 This is the PRODUCTION copy of NaijaTrust**

This directory contains the production-ready version of the NaijaTrust platform, configured for deployment to live environments.

## ⚠️ Important Differences from Development

This production copy has been configured with:
- **Separate environment variables** (`.env.production` files)
- **Strong, randomly generated secrets** for JWT and sessions
- **Production-optimized settings** for security and performance
- **No Git history** (allows independent version control)

## 📋 Pre-Deployment Checklist

Before deploying this production copy, you MUST:

### 1. Configure Environment Variables

#### Backend (`backend/.env.production`)
- [ ] Set production MongoDB URI (create separate production database)
- [ ] Configure production email service (Gmail or dedicated service like SendGrid)
- [ ] Update Google OAuth credentials with production redirect URIs
- [ ] Set production frontend URL
- [ ] Set production backend URL

#### Frontend (`frontend/.env.production`)
- [ ] Set production backend API URL

### 2. MongoDB Production Setup
- [ ] Create production database in MongoDB Atlas
- [ ] Configure IP whitelist for production servers
- [ ] Set up database backups
- [ ] Create production database user with appropriate permissions

### 3. Google OAuth Configuration
- [ ] Update Google Cloud Console with production redirect URIs
  - Backend callback: `https://your-backend.com/api/auth/google/callback`
  - Frontend redirect: `https://your-frontend.com`
- [ ] Add production domains to authorized JavaScript origins

### 4. Email Service Setup
- [ ] Configure production email service
- [ ] Test email delivery in production environment
- [ ] Set up email templates if using dedicated service

## 🚀 Deployment Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Backend deployment (Render, Railway, Heroku)
- Frontend deployment (Vercel, Netlify)
- Environment variable configuration
- Post-deployment verification

## 📁 Project Structure

```
naija-trust-2-production/
├── backend/
│   ├── .env.production          # Production environment variables (FILL THIS IN!)
│   ├── .env.example             # Example environment file
│   ├── server.js                # Express server with production checks
│   └── ...
├── frontend/
│   ├── .env.production          # Production frontend config (FILL THIS IN!)
│   ├── .env.example             # Example environment file
│   └── ...
├── README.md                    # This file
├── DEPLOYMENT.md                # Deployment instructions
└── ...
```

## 🔒 Security Features

Production-specific security enhancements:
- ✅ Strong, randomly generated JWT and session secrets
- ✅ Secure cookies (HTTPS-only in production)
- ✅ Helmet security headers
- ✅ Rate limiting on API endpoints
- ✅ CORS configured for production domains
- ✅ XSS protection
- ✅ Environment variable validation

## 🛠️ Tech Stack

Same as development version:
- **Backend**: Node.js, Express, MongoDB, Passport.js
- **Frontend**: React, Vite, React Router
- **Authentication**: JWT, Google OAuth
- **Email**: Nodemailer (or production email service)

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Step-by-step deployment guide
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Original setup guide (for reference)
- [README.md](./README.md) - This file

## ⚡ Quick Start (Local Production Testing)

To test the production build locally:

1. **Configure environment variables**:
   ```bash
   # Backend
   cd backend
   cp .env.production .env
   # Edit .env with your production values
   
   # Frontend
   cd ../frontend
   cp .env.production .env
   # Edit .env with your production values
   ```

2. **Install dependencies**:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```

4. **Start backend**:
   ```bash
   cd backend
   npm run start:prod
   ```

5. **Preview frontend**:
   ```bash
   cd frontend
   npm run preview
   ```

## 🔄 Relationship to Development Copy

- **Development**: `/Users/skywalker/Desktop/Devs/Naija Trust 2`
- **Production**: `/Users/skywalker/Desktop/Devs/Naija Trust 2 - Production`

These are completely separate copies. Changes to one do NOT affect the other.

## 📞 Support

For deployment issues:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Verify all environment variables are set correctly
3. Check deployment platform logs
4. Ensure MongoDB production database is accessible

## 📄 License

All rights reserved © 2026 NaijaTrust

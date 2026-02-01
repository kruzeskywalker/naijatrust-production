# Deployment Guide - NaijaTrust Production

This guide walks you through deploying the NaijaTrust platform to production using popular hosting platforms.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Production Setup](#mongodb-atlas-production-setup)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Google OAuth Configuration](#google-oauth-configuration)
6. [Email Service Configuration](#email-service-configuration)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Alternative Platforms](#alternative-platforms)

---

## Prerequisites

Before deploying, ensure you have:
- [ ] GitHub account (for code hosting)
- [ ] MongoDB Atlas account (free tier available)
- [ ] Render account (for backend) - https://render.com
- [ ] Vercel account (for frontend) - https://vercel.com
- [ ] Google Cloud Console access (for OAuth)
- [ ] Email service credentials (Gmail or SendGrid)

---

## MongoDB Atlas Production Setup

### 1. Create Production Database

1. **Log in to MongoDB Atlas**: https://cloud.mongodb.com
2. **Select your cluster** (or create a new one for production)
3. **Create a new database**:
   - Click "Browse Collections"
   - Click "Create Database"
   - Database name: `naijatrust_production`
   - Collection name: `users` (initial collection)

### 2. Create Database User

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `naijatrust_prod_user` (or your choice)
5. **Auto-generate a secure password** (save it securely!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### 3. Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. For production deployment:
   - Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Or add specific IPs of your hosting platform
4. Click **Confirm**

### 4. Get Connection String

1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Driver: **Node.js**, Version: **4.1 or later**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your credentials
6. Add database name: `/naijatrust_production` before the `?`
   ```
   mongodb+srv://naijatrust_prod_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/naijatrust_production?retryWrites=true&w=majority
   ```

---

## Backend Deployment (Render)

### 1. Prepare Code for Deployment

#### Option A: Push to GitHub (Recommended)

1. **Initialize Git** (if not already done):
   ```bash
   cd "/Users/skywalker/Desktop/Devs/Naija Trust 2 - Production"
   git init
   git add .
   git commit -m "Initial production commit"
   ```

2. **Create GitHub repository**:
   - Go to https://github.com/new
   - Repository name: `naijatrust-production` (or your choice)
   - Keep it **Private**
   - Don't initialize with README (we already have one)
   - Click **Create repository**

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/naijatrust-production.git
   git branch -M main
   git push -u origin main
   ```

#### Option B: Deploy from Local Directory
- Render also supports deploying from a local directory using Render CLI

### 2. Deploy Backend on Render

1. **Log in to Render**: https://dashboard.render.com

2. **Create New Web Service**:
   - Click **New +** → **Web Service**
   - Connect your GitHub repository (or use Render CLI)
   - Select the `naijatrust-production` repository

3. **Configure Web Service**:
   - **Name**: `naijatrust-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: `Free` (or paid for better performance)

4. **Add Environment Variables**:
   Click **Advanced** → **Add Environment Variable** and add:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Your MongoDB connection string from above |
   | `JWT_SECRET` | `hTf0pWuVOPokJ5NhLRi5L3jq7t5BS42Kw4WpSrUmvcobc4c9rWCI1Nlr0psgVpZkp1ZYmL5rD87jjfukCjCOdQ==` |
   | `SESSION_SECRET` | `SojrD7RgWpCeqZCFYP1BMVYLvKftA4qNe0BxKkPstdiSsZpU9acDpqSiRJkIh/LUiDf0OEy0ols46rVAmkwy3A==` |
   | `EMAIL_USER` | Your production email |
   | `EMAIL_PASSWORD` | Your email app password |
   | `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID (update later) |
   | `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret (update later) |
   | `FRONTEND_URL` | `https://your-app.vercel.app` (update after frontend deployment) |
   | `PORT` | `5001` |

5. **Create Web Service**:
   - Click **Create Web Service**
   - Render will build and deploy your backend
   - Wait for deployment to complete (usually 2-5 minutes)

6. **Get Backend URL**:
   - Once deployed, you'll see your backend URL: `https://naijatrust-backend.onrender.com`
   - **Save this URL** - you'll need it for frontend configuration

---

## Frontend Deployment (Vercel)

### 1. Deploy Frontend on Vercel

1. **Log in to Vercel**: https://vercel.com/dashboard

2. **Import Project**:
   - Click **Add New** → **Project**
   - Import your GitHub repository: `naijatrust-production`
   - Click **Import**

3. **Configure Project**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables**:
   Click **Environment Variables** and add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://naijatrust-backend.onrender.com/api/auth` |

   Replace `naijatrust-backend.onrender.com` with your actual Render backend URL.

5. **Deploy**:
   - Click **Deploy**
   - Vercel will build and deploy your frontend
   - Wait for deployment to complete (usually 1-2 minutes)

6. **Get Frontend URL**:
   - Once deployed, you'll see your frontend URL: `https://naijatrust.vercel.app`
   - **Save this URL**

### 2. Update Backend Environment Variables

1. **Go back to Render dashboard**
2. Select your backend web service
3. Go to **Environment** tab
4. Update `FRONTEND_URL`:
   - Change from placeholder to your actual Vercel URL: `https://naijatrust.vercel.app`
5. Click **Save Changes**
6. Render will automatically redeploy with the new environment variable

---

## Google OAuth Configuration

### 1. Update OAuth Redirect URIs

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID

5. **Add Authorized JavaScript Origins**:
   - `https://naijatrust.vercel.app` (your frontend URL)
   - `https://naijatrust-backend.onrender.com` (your backend URL)

6. **Add Authorized Redirect URIs**:
   - `https://naijatrust-backend.onrender.com/api/auth/google/callback`

7. **Save changes**

### 2. Test OAuth Flow

1. Visit your production frontend: `https://naijatrust.vercel.app`
2. Try signing up with Google
3. Verify you're redirected correctly

---

## Email Service Configuration

### Option 1: Gmail (Simple, for testing)

Use the same Gmail configuration from development:
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASSWORD`: Your Gmail app password

**Note**: Gmail has sending limits. For production, consider a dedicated service.

### Option 2: SendGrid (Recommended for Production)

1. **Sign up for SendGrid**: https://sendgrid.com
2. **Create API Key**:
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permissions
   - Save the API key securely

3. **Update Backend Code** (if using SendGrid):
   - Modify `backend/utils/emailService.js` to use SendGrid
   - Or use Nodemailer with SendGrid SMTP:
     - `EMAIL_USER`: `apikey`
     - `EMAIL_PASSWORD`: Your SendGrid API key
     - SMTP Host: `smtp.sendgrid.net`
     - SMTP Port: `587`

4. **Update Environment Variables on Render**:
   - Update `EMAIL_USER` and `EMAIL_PASSWORD` with SendGrid credentials

---

## Post-Deployment Verification

### 1. Health Check

Test backend health endpoint:
```bash
curl https://naijatrust-backend.onrender.com/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-02-01T..."}
```

### 2. Frontend Access

1. Visit your frontend: `https://naijatrust.vercel.app`
2. Verify the homepage loads correctly
3. Check that all assets (images, CSS) load properly

### 3. Test Authentication

1. **Email Signup**:
   - Sign up with a test email
   - Verify you receive the verification email
   - Click the verification link
   - Verify you can log in

2. **Google OAuth**:
   - Click "Continue with Google"
   - Authorize the application
   - Verify you're logged in to the dashboard

### 4. Test Core Features

- [ ] Search for businesses
- [ ] View business profiles
- [ ] Write a review (requires verified account)
- [ ] View user dashboard
- [ ] Test business portal login
- [ ] Test admin portal login

### 5. Monitor Logs

**Render Backend Logs**:
- Go to Render dashboard → Your service → Logs
- Monitor for any errors or warnings

**Vercel Frontend Logs**:
- Go to Vercel dashboard → Your project → Deployments → View Function Logs

---

## Alternative Platforms

### Backend Alternatives

#### Railway
- Similar to Render
- Deployment: https://railway.app
- Connect GitHub repo, set root directory to `backend`
- Add same environment variables

#### Heroku
- More expensive but reliable
- Deployment: https://heroku.com
- Use Heroku CLI or GitHub integration

### Frontend Alternatives

#### Netlify
- Similar to Vercel
- Deployment: https://netlify.com
- Connect GitHub repo, set base directory to `frontend`
- Build command: `npm run build`
- Publish directory: `dist`

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Failed**:
- Verify connection string is correct
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Ensure database user has correct permissions

**CORS Errors**:
- Verify `FRONTEND_URL` environment variable matches your Vercel URL exactly
- Check browser console for specific CORS error messages

**Google OAuth Not Working**:
- Verify redirect URIs in Google Cloud Console match exactly
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly

### Frontend Issues

**API Calls Failing**:
- Verify `VITE_API_URL` environment variable is correct
- Check browser network tab for failed requests
- Ensure backend is running and accessible

**Build Failures**:
- Check Vercel build logs for specific errors
- Verify all dependencies are in `package.json`
- Ensure `vite.config.js` is properly configured

---

## Security Checklist

Before going live:
- [ ] All environment variables are set correctly
- [ ] JWT and session secrets are strong and unique
- [ ] MongoDB production database is separate from development
- [ ] HTTPS is enabled (automatic on Render and Vercel)
- [ ] CORS is configured for production domains only
- [ ] Google OAuth redirect URIs are production URLs only
- [ ] Email service is configured and tested
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are active

---

## Maintenance

### Updating Production

1. **Make changes in development copy**
2. **Test thoroughly**
3. **Copy changes to production directory**:
   ```bash
   # Example: copy specific files
   cp "/Users/skywalker/Desktop/Devs/Naija Trust 2/backend/routes/authRoutes.js" \
      "/Users/skywalker/Desktop/Devs/Naija Trust 2 - Production/backend/routes/authRoutes.js"
   ```
4. **Commit and push to GitHub**:
   ```bash
   cd "/Users/skywalker/Desktop/Devs/Naija Trust 2 - Production"
   git add .
   git commit -m "Update: description of changes"
   git push
   ```
5. **Render and Vercel will auto-deploy** (if auto-deploy is enabled)

### Monitoring

- **Render**: Monitor logs and metrics in dashboard
- **Vercel**: Monitor analytics and logs in dashboard
- **MongoDB Atlas**: Monitor database performance and usage

---

## Support

For deployment issues:
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

**🎉 Congratulations! Your NaijaTrust platform is now live in production!**

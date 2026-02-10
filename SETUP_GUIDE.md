# NaijaTrust Setup Guide - MongoDB Atlas & Configuration

This guide will walk you through setting up MongoDB Atlas, Gmail for email verification, and Google OAuth.

---

## Step 1: MongoDB Atlas Setup (5 minutes)

### 1.1 Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email or Google account
3. Choose the **FREE** tier (M0 Sandbox - Perfect for development)

### 1.2 Create a Cluster

1. After signing in, click **"Build a Database"**
2. Choose **M0 FREE** tier
3. Select a cloud provider (AWS recommended) and region closest to you
4. Name your cluster (e.g., "NaijaTrust")
5. Click **"Create"** (takes 1-3 minutes to provision)

### 1.3 Create Database User

1. Click **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `naijatrust_admin`
5. Password: Click **"Autogenerate Secure Password"** and **SAVE IT**
6. Database User Privileges: Select **"Read and write to any database"**
7. Click **"Add User"**

### 1.4 Whitelist Your IP Address

1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, use specific IP addresses
4. Click **"Confirm"**

### 1.5 Get Connection String

1. Click **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://naijatrust_admin:<password>@naijatrust.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you saved earlier
7. Add database name before the `?`: 
   ```
   mongodb+srv://naijatrust_admin:YOUR_PASSWORD@naijatrust.xxxxx.mongodb.net/naijatrust?retryWrites=true&w=majority
   ```

---

## Step 2: Gmail App Password Setup (3 minutes)

### 2.1 Enable 2-Factor Authentication

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **"2-Step Verification"**
3. Follow the prompts to enable 2FA if not already enabled

### 2.2 Generate App Password

1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select app: **"Mail"**
3. Select device: **"Other (Custom name)"**
4. Enter: **"NaijaTrust"**
5. Click **"Generate"**
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
7. **SAVE THIS PASSWORD** - you won't see it again

---

## Step 3: Google OAuth Setup (5 minutes)

### 3.1 Create Google Cloud Project

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Project name: **"NaijaTrust"**
4. Click **"Create"**

### 3.2 Enable Google+ API

1. In the search bar, type **"Google+ API"**
2. Click on **"Google+ API"**
3. Click **"Enable"**

### 3.3 Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. User Type: Select **"External"**
3. Click **"Create"**
4. Fill in:
   - App name: **NaijaTrust**
   - User support email: Your email
   - Developer contact: Your email
5. Click **"Save and Continue"**
6. Scopes: Click **"Save and Continue"** (use defaults)
7. Test users: Add your email for testing
8. Click **"Save and Continue"**

### 3.4 Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Application type: **"Web application"**
4. Name: **"NaijaTrust Web Client"**
5. Authorized redirect URIs:
   - Click **"Add URI"**
   - Add: `http://localhost:5001/api/auth/google/callback`
   - For production, also add: `https://yourdomain.com/api/auth/google/callback`
6. Click **"Create"**
7. **SAVE** the Client ID and Client Secret

---

## Step 4: Configure Environment Variables

Create a `.env` file in the `backend` folder:

```bash
cd backend
touch .env
```

Open `.env` and add:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://naijatrust_admin:YOUR_PASSWORD@naijatrust.xxxxx.mongodb.net/naijatrust?retryWrites=true&w=majority

# JWT & Session Secrets
JWT_SECRET=naijatrust-super-secret-jwt-key-2026-change-in-production
SESSION_SECRET=naijatrust-super-secret-session-key-2026-change-in-production

# Gmail Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# URLs
FRONTEND_URL=http://localhost:5173
PORT=5001
```

**Replace:**
- `YOUR_PASSWORD` - MongoDB Atlas password
- `your-email@gmail.com` - Your Gmail address
- `your-16-char-app-password` - Gmail app password (remove spaces)
- `your-client-id.apps.googleusercontent.com` - Google OAuth Client ID
- `your-client-secret` - Google OAuth Client Secret

---

## Step 5: Test the Setup

### 5.1 Start Backend Server

```bash
cd backend
node server.js
```

You should see:
```
Connected to MongoDB
Server running on port 5001
```

### 5.2 Start Frontend Server

```bash
cd frontend
npm run dev
```

### 5.3 Test Email Registration

1. Go to `http://localhost:5173/signup`
2. Fill in name, email, and password
3. Click "Get Started"
4. Check your email for verification link
5. Click the verification link
6. Login with your credentials

### 5.4 Test Google OAuth

1. Go to `http://localhost:5173/login`
2. Click "Continue with Google"
3. Sign in with your Google account
4. Authorize the app
5. You should be redirected to the dashboard

---

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoServerError: bad auth"**
- Check that password in connection string is correct
- Ensure no special characters need URL encoding

**Error: "MongooseServerSelectionError"**
- Check Network Access whitelist includes your IP
- Verify connection string format

### Email Not Sending

**Error: "Invalid login"**
- Ensure 2FA is enabled on Gmail
- Use App Password, not regular password
- Remove spaces from app password

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- Verify redirect URI in Google Console matches exactly: `http://localhost:5001/api/auth/google/callback`
- Check for trailing slashes

**Error: "Access blocked"**
- Add your email as a test user in OAuth consent screen
- App must be in "Testing" mode for external users

---

## Production Deployment Checklist

When deploying to production:

- [ ] Update `FRONTEND_URL` to production domain
- [ ] Update Google OAuth redirect URI to production URL
- [ ] Change `JWT_SECRET` and `SESSION_SECRET` to strong random values
- [ ] Update MongoDB Network Access to specific IP addresses
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Update CORS settings in `server.js`
- [ ] Consider using SendGrid or Mailgun instead of Gmail

---

## Quick Reference

### MongoDB Atlas Dashboard
[https://cloud.mongodb.com/](https://cloud.mongodb.com/)

### Google Cloud Console
[https://console.cloud.google.com/](https://console.cloud.google.com/)

### Gmail App Passwords
[https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

---

## Need Help?

- MongoDB Atlas Docs: [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)
- Google OAuth Docs: [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
- Nodemailer Gmail: [https://nodemailer.com/usage/using-gmail/](https://nodemailer.com/usage/using-gmail/)

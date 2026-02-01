# Production Environment Setup - Quick Reference

## 🔑 Environment Variables to Configure

### Backend (.env.production)

Copy these to your hosting platform (Render, Railway, etc.):

```bash
# MongoDB Production
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/naijatrust_production?retryWrites=true&w=majority

# Security (Already generated - use these!)
JWT_SECRET=hTf0pWuVOPokJ5NhLRi5L3jq7t5BS42Kw4WpSrUmvcobc4c9rWCI1Nlr0psgVpZkp1ZYmL5rD87jjfukCjCOdQ==
SESSION_SECRET=SojrD7RgWpCeqZCFYP1BMVYLvKftA4qNe0BxKkPstdiSsZpU9acDpqSiRJkIh/LUiDf0OEy0ols46rVAmkwy3A==

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google OAuth (update with production credentials)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# URLs (update after deployment)
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-backend.onrender.com

# Other
PORT=5001
NODE_ENV=production
```

### Frontend (.env.production)

Copy to Vercel environment variables:

```bash
VITE_API_URL=https://your-backend.onrender.com/api/auth
```

---

## 📋 Deployment Checklist

### Before Deployment
- [ ] Create production MongoDB database
- [ ] Get MongoDB connection string
- [ ] Configure email service (Gmail or SendGrid)
- [ ] Update Google OAuth with production URLs

### Deploy Backend (Render)
- [ ] Push code to GitHub
- [ ] Create Render web service
- [ ] Set root directory: `backend`
- [ ] Add all environment variables
- [ ] Deploy and get backend URL

### Deploy Frontend (Vercel)
- [ ] Import GitHub repository
- [ ] Set root directory: `frontend`
- [ ] Add `VITE_API_URL` environment variable
- [ ] Deploy and get frontend URL

### After Deployment
- [ ] Update `FRONTEND_URL` in Render
- [ ] Update Google OAuth redirect URIs
- [ ] Test authentication flow
- [ ] Test email verification
- [ ] Test core features

---

## 🔗 Important URLs

**Development**:
- Dev Directory: `/Users/skywalker/Desktop/Devs/Naija Trust 2`
- Frontend: http://localhost:5173
- Backend: http://localhost:5001

**Production** (update after deployment):
- Prod Directory: `/Users/skywalker/Desktop/Devs/Naija Trust 2 - Production`
- Frontend: https://your-app.vercel.app
- Backend: https://your-backend.onrender.com

---

## 📖 Documentation Files

- **README.PRODUCTION.md** - Production-specific overview
- **DEPLOYMENT.md** - Complete deployment guide
- **README.md** - General project documentation
- **SETUP_GUIDE.md** - Original setup guide

---

## 🆘 Quick Troubleshooting

**MongoDB Connection Failed**:
- Check connection string format
- Verify network access (0.0.0.0/0)
- Ensure database user exists

**CORS Errors**:
- Verify `FRONTEND_URL` matches exactly
- Check browser console for details

**OAuth Not Working**:
- Update redirect URIs in Google Console
- Verify client ID and secret are correct

**Email Not Sending**:
- Check email credentials
- Verify app password (not regular password)
- Consider using SendGrid for production

---

## 🔄 Updating Production

1. Make changes in dev copy
2. Test thoroughly
3. Copy changes to production directory
4. Commit and push to GitHub
5. Hosting platforms auto-deploy

---

**Need help? See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.**

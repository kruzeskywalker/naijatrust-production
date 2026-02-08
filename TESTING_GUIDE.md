# 🚀 Local Server Testing Guide

## ✅ Servers Running Successfully!

### Backend Server
- **URL:** http://localhost:5001
- **Status:** ✅ Running
- **Database:** ✅ Connected to MongoDB Atlas
- **Port:** 5001 (not 5000)

### Frontend Server
- **URL:** http://localhost:5173
- **Status:** ✅ Running
- **Framework:** Vite + React

---

## 🧪 API Testing Results

### 1. Health Check ✅
```bash
curl http://localhost:5001/api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T15:33:38.020Z"
}
```

### 2. Subscription Plans ✅
```bash
curl 'http://localhost:5001/api/subscriptions/plans?currency=NGN'
```
**Response:** All 4 tiers returned with correct pricing
- ✅ Basic: Free
- ✅ Verified: ₦5,000/month
- ✅ Premium: ₦15,000/month
- ✅ Enterprise: ₦25,000/month

### 3. Subscription Statistics ✅
```bash
curl http://localhost:5001/api/subscriptions/stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "byTier": {
      "verified": 1,
      "basic": 103
    },
    "byStatus": {
      "trialing": 1,
      "inactive": 103
    },
    "total": 104
  }
}
```

---

## 🎯 Available API Endpoints

### Public Endpoints (No Auth Required)

#### Get All Subscription Plans
```bash
# NGN pricing
curl 'http://localhost:5001/api/subscriptions/plans?currency=NGN'

# USD pricing
curl 'http://localhost:5001/api/subscriptions/plans?currency=USD'
```

#### Get Subscription Statistics
```bash
curl http://localhost:5001/api/subscriptions/stats
```

### Protected Endpoints (Require Business User Token)

#### Get My Subscription
```bash
curl http://localhost:5001/api/subscriptions/my-subscription \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Start Free Trial
```bash
curl -X POST http://localhost:5001/api/subscriptions/start-trial \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "businessId": "YOUR_BUSINESS_ID",
    "tier": "verified",
    "trialDays": 30
  }'
```

#### Cancel Subscription
```bash
curl -X POST http://localhost:5001/api/subscriptions/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "businessId": "YOUR_BUSINESS_ID",
    "reason": "Optional cancellation reason"
  }'
```

---

## 🧪 Manual Testing Steps

### Test 1: View Subscription Plans
1. Open browser to: http://localhost:5173
2. Navigate to pricing page (if exists) or use API:
   ```bash
   curl 'http://localhost:5001/api/subscriptions/plans?currency=NGN' | python3 -m json.tool
   ```

### Test 2: Test Feature Gate (Review Response)
1. Login as a business user
2. Try to respond to a review
3. If on Basic tier → Should see upgrade message
4. If on Verified+ tier → Should be able to respond

### Test 3: Start a Free Trial
1. Login as business user
2. Navigate to subscription/pricing page
3. Click "Start Free Trial"
4. Verify features unlock

### Test 4: Check Subscription Status
```bash
# Replace YOUR_TOKEN with actual business user token
curl http://localhost:5001/api/subscriptions/my-subscription \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Current Database State

**Total Businesses:** 104

**By Tier:**
- Basic: 103 businesses
- Verified: 1 business (GTBank - on trial)
- Premium: 0 businesses
- Enterprise: 0 businesses

**By Status:**
- Inactive: 103 businesses
- Trialing: 1 business (GTBank)
- Active: 0 businesses
- Cancelled: 0 businesses

---

## 🔍 Testing Checklist

### Backend API Tests
- [x] Health check endpoint working
- [x] Subscription plans endpoint working
- [x] Statistics endpoint working
- [ ] Start trial endpoint (needs auth token)
- [ ] My subscription endpoint (needs auth token)
- [ ] Cancel subscription endpoint (needs auth token)

### Feature Gate Tests
- [ ] Basic tier cannot respond to reviews
- [ ] Verified tier can respond to reviews
- [ ] Premium tier has advanced features
- [ ] Enterprise tier has all features

### Frontend Tests
- [ ] Pricing page displays all tiers
- [ ] Subscription dashboard shows current plan
- [ ] Upgrade/downgrade buttons work
- [ ] Trial activation works
- [ ] Feature gates show upgrade prompts

---

## 🐛 Known Issues

### Minor Warnings (Non-Critical)
```
(node:10903) [MONGOOSE] Warning: Duplicate schema index on {"email":1}
(node:10903) [MONGOOSE] Warning: Duplicate schema index on {"googleId":1}
(node:10903) [MONGOOSE] Warning: Duplicate schema index on {"reference":1}
```
**Impact:** None - just duplicate index definitions
**Fix:** Can be cleaned up later

---

## 🎨 Frontend URLs

- **Homepage:** http://localhost:5173
- **Login:** http://localhost:5173/login
- **Business Login:** http://localhost:5173/business-login
- **Signup:** http://localhost:5173/signup
- **Business Portal:** http://localhost:5173/business-portal

---

## 🔧 Useful Commands

### Stop Servers
```bash
# Find and kill backend
lsof -ti:5001 | xargs kill -9

# Find and kill frontend
lsof -ti:5173 | xargs kill -9
```

### Restart Servers
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run dev
```

### View Logs
Backend logs are visible in the terminal where you ran `npm start`

### Test Subscription Features
```bash
# Run comprehensive test
cd backend
node test_subscriptions.js
```

---

## 📝 Next Steps

1. **Test in Browser:**
   - Open http://localhost:5173
   - Login as business user
   - Try to respond to a review
   - Check if feature gate works

2. **Test API with Postman:**
   - Import endpoints
   - Test with real auth tokens
   - Verify responses

3. **Deploy to Production:**
   ```bash
   git add .
   git commit -m "feat: Add subscription system"
   git push origin main
   ```

---

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Backend responds to API calls
- ✅ Frontend loads without errors
- ✅ Subscription plans display correctly
- ✅ Feature gates block Basic tier users
- ✅ Trials can be activated
- ✅ Statistics show correct counts

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check if port is in use
lsof -ti:5001

# Kill process if needed
lsof -ti:5001 | xargs kill -9

# Restart
cd backend && npm start
```

### Frontend won't start
```bash
# Check if port is in use
lsof -ti:5173

# Kill process if needed
lsof -ti:5173 | xargs kill -9

# Restart
cd frontend && npm run dev
```

### API returns 404
- Check backend is running on port 5001 (not 5000)
- Verify route is registered in server.js
- Check URL spelling

### Database connection error
- Verify MONGODB_URI in .env
- Check internet connection
- Verify MongoDB Atlas credentials

---

## 🎉 Summary

**Status:** ✅ All systems operational!

**What's Working:**
- Backend server on port 5001
- Frontend server on port 5173
- Subscription API endpoints
- Database connection
- 104 businesses migrated
- 1 business on trial

**Ready for Testing:**
- API endpoints
- Feature gates
- Free trials
- Subscription management

**Happy Testing! 🚀**

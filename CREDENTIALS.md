# 🔐 Business User Login Credentials

## Test Account (Ready to Use) ✅

**Created:** Just now  
**Purpose:** Testing subscription features

```
Email:    test_user_sky@example.com
Password: password123
```

**Login URL:** http://localhost:5173/business-login

**Status:**
- ✅ Email Verified
- ✅ Admin Verified  
- ✅ Ready to use immediately

**Features:**
- Can claim businesses
- Can test subscription features
- Can start free trials
- Can test feature gates

---

## All Business Users in Database

### 1. Demo Owner
```
Email:    demo@naijatrust.com
Password: [Unknown - Password was set during initial setup]
Phone:    +2348012345678
Position: Owner
```

**Status:**
- ✅ Email Verified
- ❌ Admin NOT Verified

**Claimed Businesses:**
1. **GTBank** - Verified tier (trialing) ✅
2. **Kuda Bank** - Basic tier (inactive)
3. **Chicken Republic** - Basic tier (inactive)

**Note:** This account has 3 claimed businesses, including one on a Verified trial!

---

## How to Login

### Option 1: Use Test Account (Recommended)

1. Open browser: http://localhost:5173/business-login
2. Enter email: `test_user_sky@example.com`
3. Enter password: `password123`
4. Click "Login"
5. You're in! 🎉

### Option 2: Use Demo Account

**Problem:** Password is unknown (hashed in database)

**Solutions:**
- Use password reset feature (if implemented)
- Create a new account
- Use the test account instead

---

## What You Can Test

### With Test Account (test_user_sky@example.com)

1. **Claim a Business**
   - Browse available businesses
   - Submit claim request
   - Test verification flow

2. **Start Free Trial**
   - Navigate to subscription/pricing
   - Click "Start 30-Day Trial"
   - Verify features unlock

3. **Test Feature Gates**
   - Try to respond to reviews (should prompt for upgrade if Basic)
   - Access analytics (should require Verified+)
   - Test other premium features

4. **Subscription Management**
   - View current plan
   - Check trial status
   - Test upgrade/downgrade flows

### With Demo Account (demo@naijatrust.com)

**If you can login:**

1. **GTBank (Verified - Trialing)**
   - ✅ Can respond to reviews
   - ✅ Can access analytics
   - ✅ Has verified badge
   - Trial ends: ~30 days from when it was started

2. **Kuda Bank (Basic - Inactive)**
   - ❌ Cannot respond to reviews
   - ❌ Cannot access analytics
   - Can start free trial

3. **Chicken Republic (Basic - Inactive)**
   - ❌ Cannot respond to reviews
   - ❌ Cannot access analytics
   - Can start free trial

---

## Testing Subscription Features

### Test 1: Feature Gate (Review Response)

**With Basic Tier Business:**
```
1. Login with test account
2. Claim a Basic tier business (or use Kuda Bank if you have demo password)
3. Navigate to a review
4. Try to respond as business
5. Expected: "Upgrade to Verified" message
```

**With Verified+ Tier Business:**
```
1. Login with demo account (if you have password)
2. Select GTBank (on Verified trial)
3. Navigate to a review
4. Try to respond as business
5. Expected: Response form appears ✅
```

### Test 2: Start Free Trial

```
1. Login with test account
2. Claim a Basic tier business
3. Navigate to subscription/pricing page
4. Click "Start 30-Day Trial" for Verified tier
5. Expected: Trial starts, features unlock
```

### Test 3: View Subscription Status

```
1. Login with any account
2. Navigate to business dashboard
3. Look for subscription section
4. Expected: Shows current tier, status, features
```

---

## API Testing with Auth Token

### Get Auth Token

After logging in, check browser DevTools:
- **Console:** Look for token in localStorage
- **Network:** Check login response for JWT token
- **Application:** localStorage → look for `token` or `authToken`

### Test API Endpoints

```bash
# Replace YOUR_TOKEN with actual token from browser

# Get my subscription
curl http://localhost:5001/api/subscriptions/my-subscription \
  -H "Authorization: Bearer YOUR_TOKEN"

# Start trial
curl -X POST http://localhost:5001/api/subscriptions/start-trial \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "businessId": "BUSINESS_ID_HERE",
    "tier": "verified",
    "trialDays": 30
  }'
```

---

## Creating Additional Test Users

If you need more test accounts:

```bash
cd backend
node create_test_user.js
```

This will create a new test user with known credentials.

---

## Password Reset (If Needed)

If you need to reset password for demo@naijatrust.com:

### Option 1: Use Password Reset Feature
1. Go to login page
2. Click "Forgot Password"
3. Enter email: demo@naijatrust.com
4. Follow reset instructions

### Option 2: Update in Database (Dev Only)
```bash
cd backend
node -e "
const mongoose = require('mongoose');
const BusinessUser = require('./models/BusinessUser');
require('dotenv').config();

async function resetPassword() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await BusinessUser.findOne({ email: 'demo@naijatrust.com' });
    user.password = 'NewPassword123!';
    await user.save();
    console.log('Password updated to: NewPassword123!');
    await mongoose.connection.close();
}
resetPassword();
"
```

---

## Summary

### ✅ Ready to Use Now

**Test Account:**
- Email: test_user_sky@example.com
- Password: password123
- Status: Fully verified, ready to test

**Login URL:** http://localhost:5173/business-login

### 📊 Database Stats

- Total Business Users: 1 (demo) + 1 (test) = 2
- Claimed Businesses: 3 (all by demo account)
- Businesses on Trial: 1 (GTBank - Verified)
- Total Businesses: 104

### 🎯 What to Test

1. ✅ Login with test account
2. ✅ Claim a business
3. ✅ Start free trial
4. ✅ Test feature gates
5. ✅ View subscription status
6. ✅ Test API endpoints

---

## Need Help?

**Can't login?**
- Verify email/password exactly as shown
- Check backend server is running (port 5001)
- Check frontend server is running (port 5173)
- Check browser console for errors

**Need more test users?**
- Run: `node create_test_user.js`
- Or create via signup page

**Forgot demo password?**
- Use test account instead
- Or reset password using method above

---

**Happy Testing! 🚀**

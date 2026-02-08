# Paystack Payment Integration - Complete Guide

## 🎯 Overview

Paystack payment integration has been successfully implemented for the tier upgrade system. Businesses can now pay for tier upgrades using Paystack, with automatic tier activation upon successful payment.

---

## 📋 Setup Instructions

### 1. Get Paystack API Keys

1. Sign up at [Paystack](https://paystack.com/)
2. Complete business verification
3. Go to [Settings > API Keys & Webhooks](https://dashboard.paystack.com/#/settings/developer)
4. Copy your **Test Keys** (for development) or **Live Keys** (for production)

### 2. Configure Backend Environment Variables

Add to `/backend/.env`:

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

### 3. Configure Frontend Environment Variables

Add to `/frontend/.env`:

```bash
# Paystack Public Key
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

### 4. Configure Webhook URL

In your Paystack Dashboard:
1. Go to Settings > API Keys & Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Copy the webhook secret (optional, for additional security)

---

## 🔄 Payment Flow

### User Journey:

1. **Business User** clicks "Upgrade Plan" on dashboard
2. Selects desired tier (Verified/Premium)
3. Chooses payment option "Pay Now"
4. System creates upgrade request with status "pending"
5. **Paystack modal** opens with payment details
6. User enters card details and completes payment
7. **Paystack** processes payment
8. **Webhook** notifies backend of successful payment
9. Backend **auto-approves** upgrade request
10. Business tier is **upgraded immediately**
11. Features are **unlocked**
12. **Confirmation email** sent to business

---

## 🛠️ Technical Implementation

### Backend Files Created:

1. **`/backend/utils/paystackService.js`**
   - Payment initialization
   - Payment verification
   - Webhook handling
   - Refund processing

2. **`/backend/routes/paymentRoutes.js`**
   - `POST /api/payments/initialize` - Start payment
   - `GET /api/payments/verify/:reference` - Verify payment
   - `POST /api/payments/webhook` - Paystack webhook
   - `GET /api/payments/details/:reference` - Get payment info

### Frontend Files Created:

1. **`/frontend/src/hooks/usePaystack.js`**
   - Custom React hook for Paystack integration
   - Compatible with React 19
   - Handles payment modal

2. **Updated `/frontend/src/components/UpgradeModal.jsx`**
   - Integrated payment flow
   - Trial vs Payment selection
   - Paystack modal integration

3. **Updated `/frontend/index.html`**
   - Added Paystack Inline JS script

---

## 💳 Supported Payment Methods

Paystack supports:
- ✅ **Visa/Mastercard** (Nigerian & International)
- ✅ **Verve Cards**
- ✅ **Bank Transfer** (instant)
- ✅ **USSD**
- ✅ **Mobile Money**
- ✅ **QR Code**

---

## 💰 Pricing & Fees

### Paystack Transaction Fees:

- **Local Cards**: 1.5% + ₦100 (capped at ₦2,000)
- **International Cards**: 3.9% + ₦100
- **Bank Transfer**: ₦50 flat fee
- **No setup fees**
- **No monthly fees**

### Settlement:

- **Timeline**: T+1 (next business day)
- **Currency**: NGN → USD conversion available
- **Account**: Settles to domiciliary account

---

## 🔐 Security Features

### Payment Security:
- ✅ PCI-DSS Level 1 Certified
- ✅ 3D Secure authentication
- ✅ Fraud detection
- ✅ Webhook signature verification
- ✅ SSL/TLS encryption

### Implementation Security:
- ✅ JWT token verification
- ✅ Business ownership validation
- ✅ Duplicate payment prevention
- ✅ Webhook signature validation
- ✅ Idempotent payment processing

---

## 🧪 Testing

### Test Cards (Paystack):

**Successful Payment:**
```
Card Number: 5061 0201 9000 0000 108
CVV: 123
Expiry: Any future date
PIN: 1234
OTP: 123456
```

**Failed Payment:**
```
Card Number: 5060 9902 0000 0000 04
CVV: 123
Expiry: Any future date
```

### Testing Flow:

1. Use test API keys
2. Create upgrade request
3. Use test card above
4. Verify payment completes
5. Check tier upgraded
6. Verify email sent

---

## 📊 Webhook Events

Paystack sends these events:

- `charge.success` - Payment successful (auto-approves upgrade)
- `charge.failed` - Payment failed (marks request as failed)
- `transfer.success` - Settlement completed
- `transfer.failed` - Settlement failed

---

## 🔄 Refund Process

If needed, refunds can be processed:

```javascript
const paystackService = require('./utils/paystackService');

await paystackService.refundPayment(reference, amount);
```

---

## 🚨 Error Handling

### Common Errors:

1. **"Paystack script not loaded"**
   - Solution: Check internet connection, Paystack CDN accessible

2. **"Payment initialization failed"**
   - Solution: Verify API keys, check upgrade request exists

3. **"Payment verification failed"**
   - Solution: Check webhook configuration, verify reference

4. **"Invalid signature"**
   - Solution: Verify webhook secret matches Paystack dashboard

---

## 📈 Monitoring & Analytics

### Track in Paystack Dashboard:
- Total transactions
- Success rate
- Revenue
- Failed payments
- Settlement status

### Track in Application:
- Upgrade requests by payment status
- Revenue by tier
- Conversion rate
- Failed payment reasons

---

## 🌍 Multi-Currency Support

### Current Setup:
- **Accept**: NGN (Nigerian Naira)
- **Settle**: NGN or USD (to domiciliary account)

### To Enable USD Payments:
1. Update plan pricing to include USD
2. Pass currency in payment initialization
3. Paystack handles conversion

---

## 🔧 Troubleshooting

### Payment Modal Not Opening:
- Check Paystack script loaded in browser console
- Verify public key in frontend .env
- Check browser console for errors

### Webhook Not Receiving Events:
- Verify webhook URL is publicly accessible
- Check webhook URL in Paystack dashboard
- Test webhook with Paystack dashboard tool
- Verify signature validation

### Tier Not Upgrading After Payment:
- Check webhook received and processed
- Verify auto-approval logic in paystackService
- Check upgrade request status in database
- Review server logs for errors

---

## 📝 API Examples

### Initialize Payment:

```javascript
POST /api/payments/initialize
Authorization: Bearer <business_token>

{
  "upgradeRequestId": "64abc123..."
}

Response:
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "abc123",
    "reference": "TIER_64abc123_1234567890"
  }
}
```

### Verify Payment:

```javascript
GET /api/payments/verify/TIER_64abc123_1234567890
Authorization: Bearer <business_token>

Response:
{
  "success": true,
  "message": "Payment verified and tier upgraded successfully",
  "data": {
    "upgradeRequest": {...},
    "business": {...}
  }
}
```

---

## ✅ Production Checklist

Before going live:

- [ ] Replace test keys with live keys
- [ ] Update webhook URL to production domain
- [ ] Test with real (small amount) transaction
- [ ] Verify email notifications working
- [ ] Test refund process
- [ ] Monitor first few transactions closely
- [ ] Set up Paystack dashboard alerts
- [ ] Document support process for payment issues

---

## 📞 Support

### Paystack Support:
- Email: support@paystack.com
- Phone: +234 1 888 8888
- Docs: https://paystack.com/docs

### Implementation Support:
- Check server logs for errors
- Review Paystack dashboard for transaction details
- Test webhook with Paystack testing tool
- Verify environment variables set correctly

---

## 🎉 Success!

Your Paystack integration is complete and ready for testing! 

**Next Steps:**
1. Add test API keys to .env files
2. Test payment flow end-to-end
3. Verify webhook handling
4. Test with different payment methods
5. Switch to live keys when ready for production

# Tier Upgrade System - Backend Implementation Summary

## ✅ Completed Components

### 1. Database Model

**File:** `backend/models/TierUpgradeRequest.js`

**Features:**
- Tracks tier upgrade requests from businesses
- Stores payment information (method, reference, status, amount)
- Admin review fields (reviewer, notes, rejection reason)
- Request status tracking (pending, approved, rejected, cancelled)
- Helper methods for status checking
- Static methods for querying and statistics

**Key Fields:**
- `business` - Reference to Business
- `businessUser` - Reference to BusinessUser
- `currentTier` / `requestedTier` - Tier progression
- `requestType` - trial, payment, or manual
- `status` - pending, approved, rejected, cancelled
- `paymentMethod` / `paymentStatus` - Payment tracking
- `reviewedBy` / `reviewedAt` - Admin review tracking

---

### 2. Utility Functions

**File:** `backend/utils/tierUpgradeUtils.js`

**Functions:**

1. **`processUpgradeRequest()`**
   - Validates business ownership
   - Checks for existing pending requests
   - Validates tier progression (no downgrades)
   - Creates upgrade request
   - Sends notification email

2. **`approveUpgrade()`**
   - Updates business tier and features
   - Sets subscription dates (trial or paid)
   - Creates/updates Subscription record
   - Marks request as approved
   - Sends approval notification

3. **`rejectUpgrade()`**
   - Marks request as rejected
   - Records rejection reason
   - Sends rejection notification

4. **`manuallyChangeTier()`**
   - Admin-only tier changes
   - Bypasses payment requirements
   - Creates audit log
   - Supports temporary (trial) or permanent changes

5. **`cancelUpgradeRequest()`**
   - Business user can cancel pending requests
   - Verifies ownership

**Notification Functions:**
- `sendUpgradeRequestNotification()` - On request submission
- `sendApprovalNotification()` - On approval
- `sendRejectionNotification()` - On rejection
- `sendManualTierChangeNotification()` - On admin tier change

---

### 3. Business User API Routes

**File:** `backend/routes/subscriptionRoutes.js`

#### POST `/api/subscriptions/request-upgrade`
**Purpose:** Submit tier upgrade request  
**Auth:** Business user token required  
**Body:**
```json
{
  "businessId": "...",
  "requestedTier": "premium",
  "requestType": "trial" | "payment" | "manual",
  "paymentMethod": "paystack" | "flutterwave",
  "paymentReference": "...",
  "amount": 1500000,
  "currency": "NGN",
  "billingCycle": "monthly" | "annual",
  "businessNotes": "Optional notes"
}
```

#### GET `/api/subscriptions/my-upgrade-requests?businessId=...`
**Purpose:** Get all upgrade requests for a business  
**Auth:** Business user token required  
**Returns:** Array of upgrade requests

#### POST `/api/subscriptions/cancel-upgrade-request`
**Purpose:** Cancel a pending upgrade request  
**Auth:** Business user token required  
**Body:**
```json
{
  "requestId": "..."
}
```

---

### 4. Admin API Routes

**File:** `backend/routes/adminTierRoutes.js`

#### GET `/api/admin/tier-requests`
**Purpose:** Get all tier upgrade requests with filtering  
**Auth:** Admin token required  
**Query Params:**
- `status` - Filter by status (pending, approved, rejected)
- `tier` - Filter by requested tier
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search by business name

**Returns:**
```json
{
  "success": true,
  "data": {
    "requests": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 3,
      "limit": 20
    }
  }
}
```

#### GET `/api/admin/tier-requests/stats`
**Purpose:** Get tier request statistics  
**Returns:**
```json
{
  "byStatus": {
    "pending": 10,
    "approved": 25,
    "rejected": 5
  },
  "byTier": {
    "verified": 8,
    "premium": 2
  },
  "pendingCount": 10,
  "recentCount": 15
}
```

#### GET `/api/admin/tier-requests/:id`
**Purpose:** Get single tier request details  
**Returns:** Full request details with populated business and user data

#### POST `/api/admin/tier-requests/:id/approve`
**Purpose:** Approve a tier upgrade request  
**Body:**
```json
{
  "adminNotes": "Approved for verified business"
}
```

**Actions:**
- Updates business tier and features
- Sets subscription dates
- Creates/updates Subscription record
- Sends approval email to business

#### POST `/api/admin/tier-requests/:id/reject`
**Purpose:** Reject a tier upgrade request  
**Body:**
```json
{
  "rejectionReason": "Insufficient documentation",
  "adminNotes": "Internal notes"
}
```

#### POST `/api/admin/businesses/:id/change-tier`
**Purpose:** Manually change business tier (bypass request flow)  
**Body:**
```json
{
  "newTier": "premium",
  "reason": "Manual upgrade by admin",
  "duration": 30  // Optional: days for trial
}
```

**Use Cases:**
- Grant complimentary upgrades
- Fix tier issues
- Temporary tier changes
- Special promotions

#### POST `/api/admin/tier-requests/bulk-approve`
**Purpose:** Approve multiple requests at once  
**Body:**
```json
{
  "requestIds": ["id1", "id2", "id3"],
  "adminNotes": "Bulk approval"
}
```

---

## API Testing Examples

### Test Tier Upgrade Request (Business User)

```bash
# Get auth token first (login as business user)
TOKEN="your_business_user_token"
BUSINESS_ID="your_business_id"

# Request upgrade to Verified tier (trial)
curl -X POST http://localhost:5001/api/subscriptions/request-upgrade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "businessId": "'$BUSINESS_ID'",
    "requestedTier": "verified",
    "requestType": "trial",
    "businessNotes": "Would like to try verified features"
  }'

# View my upgrade requests
curl http://localhost:5001/api/subscriptions/my-upgrade-requests?businessId=$BUSINESS_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Test Admin Approval

```bash
# Get admin token first (login as admin)
ADMIN_TOKEN="your_admin_token"
REQUEST_ID="tier_request_id"

# View all pending requests
curl http://localhost:5001/api/admin/tier-requests?status=pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Approve a request
curl -X POST http://localhost:5001/api/admin/tier-requests/$REQUEST_ID/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "adminNotes": "Approved - business verified"
  }'

# Manually change tier
curl -X POST http://localhost:5001/api/admin/businesses/$BUSINESS_ID/change-tier \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "newTier": "premium",
    "reason": "Promotional upgrade",
    "duration": 30
  }'
```

---

## Request Flow Examples

### Flow 1: Free Trial Request (Auto-Approved)

1. Business user requests Verified trial
2. System creates request with status "pending"
3. System auto-approves (no payment needed)
4. Business tier updated to "verified"
5. Trial end date set (30 days)
6. Features unlocked
7. Email sent to business user

### Flow 2: Paid Upgrade (Manual Approval)

1. Business user requests Premium tier
2. Selects "manual" request type
3. System creates request with status "pending"
4. Admin receives notification
5. Admin reviews request
6. Admin approves request
7. Business tier updated to "premium"
8. Features unlocked
9. Email sent to business user

### Flow 3: Admin Manual Tier Change

1. Admin navigates to business management
2. Selects business to upgrade
3. Chooses new tier and reason
4. System immediately updates tier
5. Creates audit log entry
6. Email sent to business user

---

## Email Notifications

### Request Submitted
- **To:** Business user
- **Subject:** "Tier Upgrade Request Received"
- **Content:** Confirmation with request details

### Request Approved
- **To:** Business user
- **Subject:** "Tier Upgrade Approved! 🎉"
- **Content:** New tier, features unlocked, trial end date (if applicable)

### Request Rejected
- **To:** Business user
- **Subject:** "Tier Upgrade Request Update"
- **Content:** Rejection reason, support contact info

### Manual Tier Change
- **To:** Business user
- **Subject:** "Your Subscription Tier Has Been Updated"
- **Content:** Old tier, new tier, reason

---

## Database Indexes

For optimal query performance:

```javascript
// TierUpgradeRequest indexes
{ business: 1, status: 1 }
{ status: 1, createdAt: -1 }
{ requestedTier: 1, status: 1 }
{ paymentReference: 1 } // sparse
```

---

## Security Features

### Business User Permissions
- ✅ Can only request upgrades for owned businesses
- ✅ Can only view own requests
- ✅ Can only cancel own pending requests
- ✅ Cannot approve own requests
- ✅ Cannot change tier directly

### Admin Permissions
- ✅ Can view all requests
- ✅ Can approve/reject any request
- ✅ Can manually change any tier
- ✅ All actions logged with admin ID
- ✅ Audit trail maintained

### Validation
- ✅ Business ownership verification
- ✅ Tier progression validation (no downgrades via request)
- ✅ Duplicate request prevention
- ✅ Payment status verification before approval
- ✅ Request status validation

---

## Next Steps

### Phase 4: Frontend - Business Portal
- [ ] Create `SubscriptionCard` component
- [ ] Create `UpgradeModal` component
- [ ] Update `BusinessDashboard` to show tier
- [ ] Create subscription management page

### Phase 5: Frontend - Admin Portal
- [ ] Create `TierRequests` page
- [ ] Create `TierRequestCard` component
- [ ] Update `ManageBusinesses` with tier change option
- [ ] Update `AdminDashboard` with pending count

### Phase 6: Payment Integration
- [ ] Integrate Paystack for paid upgrades
- [ ] Handle payment callbacks
- [ ] Auto-approve on successful payment

---

## Files Created

1. ✅ `backend/models/TierUpgradeRequest.js` - Database model
2. ✅ `backend/utils/tierUpgradeUtils.js` - Utility functions
3. ✅ `backend/routes/adminTierRoutes.js` - Admin API routes
4. ✅ Updated `backend/routes/subscriptionRoutes.js` - Business API routes
5. ✅ Updated `backend/server.js` - Route registration

**Total Lines Added:** ~1,200 lines of code

---

## Ready for Testing! 🚀

The backend tier upgrade system is fully implemented and ready for testing. All API endpoints are live and functional.

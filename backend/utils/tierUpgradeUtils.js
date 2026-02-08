const TierUpgradeRequest = require('../models/TierUpgradeRequest');
const Business = require('../models/Business');
const Subscription = require('../models/Subscription');
const { sendEmail } = require('./emailService');
const { getPlan, getFeatures } = require('../config/subscriptionPlans');

/**
 * Process a tier upgrade request
 */
async function processUpgradeRequest(requestData) {
    const {
        businessId,
        businessUserId,
        requestedTier,
        requestType,
        paymentMethod,
        paymentReference,
        amount,
        currency,
        billingCycle,
        businessNotes
    } = requestData;

    // Validate business exists
    const business = await Business.findById(businessId);
    if (!business) {
        throw new Error('Business not found');
    }

    // Check for existing pending request
    const hasPending = await TierUpgradeRequest.hasActivePendingRequest(businessId);
    if (hasPending) {
        throw new Error('You already have a pending upgrade request');
    }

    // Validate tier progression (can't request same or lower tier)
    const tierOrder = ['basic', 'verified', 'premium', 'enterprise'];
    const currentIndex = tierOrder.indexOf(business.subscriptionTier);
    const requestedIndex = tierOrder.indexOf(requestedTier);

    if (requestedIndex <= currentIndex) {
        throw new Error('Cannot request same or lower tier. Please contact support for downgrades.');
    }

    // Calculate amount if not provided (for payment requests)
    let finalAmount = amount || 0;
    let finalCurrency = currency || 'NGN';
    let finalBillingCycle = billingCycle || 'monthly';

    if (requestType === 'payment' && !amount) {
        const plan = getPlan(requestedTier);
        if (plan && plan.price && plan.price[finalCurrency]) {
            // Amount is in kobo/cents, convert to main currency unit
            finalAmount = plan.price[finalCurrency][finalBillingCycle] / 100;
        }
    }

    // Create upgrade request
    const upgradeRequest = await TierUpgradeRequest.create({
        business: businessId,
        businessUser: businessUserId,
        currentTier: business.subscriptionTier,
        requestedTier,
        requestType,
        paymentMethod: paymentMethod || 'none',
        paymentReference,
        paymentStatus: requestType === 'payment' ? 'pending' : 'none',
        amount: finalAmount,
        currency: finalCurrency,
        billingCycle: finalBillingCycle,
        businessNotes,
        status: 'pending'
    });

    // Send notification email ONLY for non-payment requests
    // For payment requests, email is sent after successful payment verification
    if (requestType !== 'payment') {
        await sendUpgradeRequestNotification(upgradeRequest, business);
    }

    return upgradeRequest;
}

/**
 * Approve a tier upgrade request
 */
async function approveUpgrade(requestId, adminId, adminNotes) {
    const request = await TierUpgradeRequest.findById(requestId)
        .populate('business')
        .populate('businessUser');

    if (!request) {
        throw new Error('Upgrade request not found');
    }

    if (!request.canBeApproved()) {
        throw new Error('Request cannot be approved. Check status and payment.');
    }

    const business = request.business;
    const plan = getPlan(request.requestedTier);

    // Update business tier and features
    business.subscriptionTier = request.requestedTier;
    business.subscriptionStatus = request.requestType === 'trial' ? 'trialing' : 'active';
    business.features = getFeatures(request.requestedTier);

    // Automatically verify business if moving above basic tier
    if (request.requestedTier !== 'basic') {
        business.isVerified = true;
        business.verifiedAt = new Date();
    }

    // Set subscription dates
    const now = new Date();
    business.subscriptionStartDate = now;

    if (request.requestType === 'trial') {
        // Set trial end date
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() + (request.trialDuration || 30));
        business.trialEndsAt = trialEnd;
        business.isTrialing = true;
        business.subscriptionEndDate = trialEnd;
    } else {
        // Set renewal date based on billing cycle
        const renewalDate = new Date(now);
        if (request.billingCycle === 'annual') {
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        } else {
            renewalDate.setMonth(renewalDate.getMonth() + 1);
        }
        business.subscriptionRenewalDate = renewalDate;
        business.subscriptionEndDate = renewalDate;
    }

    // Update payment info if applicable
    if (request.requestType === 'payment') {
        business.paymentMethod = request.paymentMethod;
        business.lastPaymentDate = now;
        business.lastPaymentAmount = request.amount;
        business.currency = request.currency;
    }

    await business.save();

    // Create or update subscription record
    let subscription = await Subscription.findOne({ business: business._id });

    if (subscription) {
        subscription.tier = request.requestedTier;
        subscription.status = business.subscriptionStatus;
        subscription.amount = request.amount;
        subscription.currency = request.currency;
        subscription.billingCycle = request.billingCycle;
        subscription.startDate = now;
        subscription.endDate = business.subscriptionEndDate;
        subscription.renewalDate = business.subscriptionRenewalDate;
        subscription.isTrialing = business.isTrialing;
        subscription.trialEndsAt = business.trialEndsAt;
    } else {
        subscription = await Subscription.create({
            business: business._id,
            businessUser: request.businessUser,
            tier: request.requestedTier,
            status: business.subscriptionStatus,
            amount: request.amount,
            currency: request.currency,
            billingCycle: request.billingCycle,
            startDate: now,
            endDate: business.subscriptionEndDate,
            renewalDate: business.subscriptionRenewalDate,
            paymentProvider: request.paymentMethod !== 'none' ? request.paymentMethod : 'manual',
            isTrialing: business.isTrialing,
            trialEndsAt: business.trialEndsAt
        });
    }

    await subscription.save();

    // Update request status
    request.status = 'approved';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    request.adminNotes = adminNotes;
    await request.save();

    // Send approval notification
    await sendApprovalNotification(request, business);

    return { request, business, subscription };
}

/**
 * Reject a tier upgrade request
 */
async function rejectUpgrade(requestId, adminId, rejectionReason, adminNotes) {
    const request = await TierUpgradeRequest.findById(requestId)
        .populate('business')
        .populate('businessUser');

    if (!request) {
        throw new Error('Upgrade request not found');
    }

    if (request.status !== 'pending') {
        throw new Error('Only pending requests can be rejected');
    }

    // Update request status
    request.status = 'rejected';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    request.adminNotes = adminNotes;
    await request.save();

    // Send rejection notification
    await sendRejectionNotification(request);

    return request;
}

/**
 * Manually change business tier (admin only)
 */
async function manuallyChangeTier(businessId, newTier, adminId, reason, duration) {
    const business = await Business.findById(businessId);
    if (!business) {
        throw new Error('Business not found');
    }

    const plan = getPlan(newTier);
    if (!plan) {
        throw new Error('Invalid tier');
    }

    // Update business tier and features
    const oldTier = business.subscriptionTier;
    business.subscriptionTier = newTier;
    business.features = getFeatures(newTier);

    // Sync verification status with tier
    if (newTier === 'basic') {
        business.isVerified = false;
        business.verifiedAt = undefined;
    } else {
        business.isVerified = true;
        if (!business.verifiedAt) {
            business.verifiedAt = new Date();
        }
    }

    const now = new Date();
    business.subscriptionStartDate = now;

    // Set subscription status and dates
    if (duration) {
        // Temporary tier change (like a trial)
        business.subscriptionStatus = 'trialing';
        business.isTrialing = true;
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + duration);
        business.trialEndsAt = endDate;
        business.subscriptionEndDate = endDate;
    } else {
        // Permanent tier change
        business.subscriptionStatus = 'active';
        business.isTrialing = false;
        business.trialEndsAt = null;
        // Set renewal to 1 month from now
        const renewalDate = new Date(now);
        renewalDate.setMonth(renewalDate.getMonth() + 1);
        business.subscriptionRenewalDate = renewalDate;
        business.subscriptionEndDate = renewalDate;
    }

    await business.save();

    // Create audit log entry as a tier upgrade request
    const auditLog = await TierUpgradeRequest.create({
        business: businessId,
        businessUser: business.owner || business.claimedBy,
        currentTier: oldTier,
        requestedTier: newTier,
        requestType: 'manual',
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: now,
        adminNotes: reason || 'Manual tier change by admin',
        trialDuration: duration
    });

    // Send notification
    await sendManualTierChangeNotification(business, oldTier, newTier, reason);

    return { business, auditLog };
}

/**
 * Cancel a pending upgrade request
 */
async function cancelUpgradeRequest(requestId, businessUserId) {
    const request = await TierUpgradeRequest.findById(requestId)
        .populate('business');

    if (!request) {
        throw new Error('Upgrade request not found');
    }

    // Verify ownership: Check if the requesting user is the owner of the business
    // or the user who created the request.
    const isCreator = request.businessUser && request.businessUser.toString() === businessUserId.toString();

    // Check if user is business owner
    const Business = require('../models/Business');
    // We already populated 'business', but it might be just the object if populate worked, or ID if not?
    // Mongoose populate replaces the ID with the object.

    let isOwner = false;
    if (request.business && request.business.owner) {
        isOwner = request.business.owner.toString() === businessUserId.toString();
    } else {
        // Fallback if not populated or structure differs, though populate('business') should work.
        // If business is null, something is wrong with data integrity.
        if (!request.business) throw new Error('Request has no associated business');

        // If owner is not loaded (schema definition might need checking if owner is in default selection)
        // Business schema has owner. populating 'business' should include it unless selected out.
        // Let's rely on checking the business document directly if needed to be safe.
        const businessParams = await Business.findById(request.business._id || request.business);
        if (businessParams && businessParams.owner.toString() === businessUserId.toString()) {
            isOwner = true;
        }
    }

    if (!isCreator && !isOwner) {
        throw new Error('Unauthorized to cancel this request');
    }

    if (request.status !== 'pending') {
        throw new Error('Only pending requests can be cancelled');
    }

    request.status = 'cancelled';
    await request.save();

    return request;
}

// Notification Functions

async function sendUpgradeRequestNotification(request, business) {
    const plan = getPlan(request.requestedTier);

    try {
        await sendEmail({
            to: request.businessUser?.email || business.email,
            subject: 'Tier Upgrade Request Received - NaijaTrust',
            html: `
                <h2>Tier Upgrade Request Received</h2>
                <p>We've received your request to upgrade <strong>${business.name}</strong>.</p>
                <p><strong>Current Tier:</strong> ${request.currentTier}</p>
                <p><strong>Requested Tier:</strong> ${request.requestedTier}</p>
                <p><strong>Request Type:</strong> ${request.requestType}</p>
                ${request.requestType === 'manual' ? '<p><strong>Status:</strong> Pending admin review</p>' : ''}
                ${request.requestType === 'trial' ? '<p><strong>Status:</strong> Processing (auto-approved)</p>' : ''}
                <p>We'll notify you once your request has been reviewed.</p>
                <p>Best regards,<br>NaijaTrust Team</p>
            `
        });
    } catch (error) {
        console.error('Error sending upgrade request notification:', error);
    }
}

async function sendApprovalNotification(request, business) {
    const plan = getPlan(request.requestedTier);
    const features = Object.entries(plan.features)
        .filter(([key, value]) => value === true)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
        .join(', ');

    try {
        await sendEmail({
            to: request.businessUser?.email || business.email,
            subject: 'Tier Upgrade Approved! 🎉 - NaijaTrust',
            html: `
                <h2 style="color: #00A86B;">Tier Upgrade Approved!</h2>
                <p>Great news! Your tier upgrade request has been approved.</p>
                <p><strong>Business:</strong> ${business.name}</p>
                <p><strong>New Tier:</strong> ${plan.displayName}</p>
                <p><strong>Status:</strong> ${business.subscriptionStatus}</p>
                ${business.isTrialing ? `<p><strong>Trial Ends:</strong> ${business.trialEndsAt?.toLocaleDateString()}</p>` : ''}
                <h3>Features Now Available:</h3>
                <p>${features}</p>
                <p>Visit your dashboard to explore your new features!</p>
                <p>Best regards,<br>NaijaTrust Team</p>
            `
        });
    } catch (error) {
        console.error('Error sending approval notification:', error);
    }
}

async function sendRejectionNotification(request) {
    try {
        await sendEmail({
            to: request.businessUser?.email,
            subject: 'Tier Upgrade Request Update - NaijaTrust',
            html: `
                <h2>Tier Upgrade Request Update</h2>
                <p>We've reviewed your tier upgrade request for <strong>${request.business?.name}</strong>.</p>
                <p><strong>Status:</strong> Not Approved</p>
                ${request.rejectionReason ? `<p><strong>Reason:</strong> ${request.rejectionReason}</p>` : ''}
                <p>If you have questions or would like to provide additional information, please contact our support team.</p>
                <p>Best regards,<br>NaijaTrust Team</p>
            `
        });
    } catch (error) {
        console.error('Error sending rejection notification:', error);
    }
}

async function sendManualTierChangeNotification(business, oldTier, newTier, reason) {
    try {
        const plan = getPlan(newTier);
        await sendEmail({
            to: business.email,
            subject: 'Your Subscription Tier Has Been Updated - NaijaTrust',
            html: `
                <h2>Subscription Tier Updated</h2>
                <p>Your subscription tier for <strong>${business.name}</strong> has been updated by our admin team.</p>
                <p><strong>Previous Tier:</strong> ${oldTier}</p>
                <p><strong>New Tier:</strong> ${plan.displayName}</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                <p>Visit your dashboard to see your updated features.</p>
                <p>Best regards,<br>NaijaTrust Team</p>
            `
        });
    } catch (error) {
        console.error('Error sending manual tier change notification:', error);
    }
}

/**
 * Send payment success notification email
 */
async function sendPaymentSuccessNotification(request, business, paymentReference) {
    try {
        const plan = getPlan(request.requestedTier);
        const features = Object.entries(plan.features)
            .filter(([_, value]) => value === true)
            .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
            .join(', ');

        await sendEmail({
            to: request.businessUser?.email || business.email,
            subject: '🎉 Payment Successful - Subscription Upgraded! - NaijaTrust',
            html: `
                <h2>Payment Successful!</h2>
                <p>Your payment has been successfully processed and your subscription has been upgraded.</p>
                <hr>
                <h3>Upgrade Details</h3>
                <p><strong>Business:</strong> ${business.name}</p>
                <p><strong>Previous Tier:</strong> ${request.currentTier}</p>
                <p><strong>New Tier:</strong> ${plan.displayName}</p>
                <p><strong>Amount Paid:</strong> ₦${request.amount?.toLocaleString() || '0'}</p>
                <p><strong>Payment Reference:</strong> ${paymentReference || request.paymentReference || 'N/A'}</p>
                <hr>
                <h3>Your New Features</h3>
                <p>${features || 'Access to all tier features'}</p>
                <hr>
                <p>Thank you for your subscription! You can now enjoy all the features of your new tier.</p>
                <p>Visit your <a href="${process.env.FRONTEND_URL}/business/dashboard">business dashboard</a> to explore your upgraded account.</p>
                <p>Best regards,<br>NaijaTrust Team</p>
            `
        });
        console.log('Payment success notification email sent to:', request.businessUser?.email || business.email);
    } catch (error) {
        console.error('Error sending payment success notification:', error);
    }
}

module.exports = {
    processUpgradeRequest,
    approveUpgrade,
    rejectUpgrade,
    manuallyChangeTier,
    cancelUpgradeRequest,
    sendPaymentSuccessNotification
};

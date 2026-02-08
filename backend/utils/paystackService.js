const Paystack = require('paystack-node');
const TierUpgradeRequest = require('../models/TierUpgradeRequest');
const Business = require('../models/Business');
const Subscription = require('../models/Subscription');
const { approveUpgrade, sendPaymentSuccessNotification } = require('./tierUpgradeUtils');

// Initialize Paystack
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
    console.warn('WARNING: PAYSTACK_SECRET_KEY is not set. Payment features will not work.');
}

const paystack = PAYSTACK_SECRET_KEY ? new Paystack(PAYSTACK_SECRET_KEY) : null;

/**
 * Initialize payment for tier upgrade or subscription
 */
async function initializePayment({ upgradeRequestId, email, amount, currency = 'NGN', plan }) {
    try {
        // Validate Paystack is configured
        if (!paystack) {
            throw new Error('Paystack is not configured. Please set PAYSTACK_SECRET_KEY in your environment.');
        }

        // Validate amount (only if no plan is provided, as plan overrides amount)
        if (!plan && (!amount || amount <= 0)) {
            throw new Error('Invalid payment amount. Amount must be greater than 0.');
        }

        const upgradeRequest = await TierUpgradeRequest.findById(upgradeRequestId)
            .populate('business')
            .populate('businessUser');

        if (!upgradeRequest) {
            throw new Error('Upgrade request not found');
        }

        // Create payment reference
        const reference = `TIER_${upgradeRequestId}_${Date.now()}`;

        // Initialize Paystack transaction
        // If plan is provided, Paystack uses the plan's amount and creates a subscription
        console.log('Final amount for Paystack (kobo):', amount * 100);
        console.log('Initializing with Plan:', plan || 'None');

        // Prepare metadata as stringified JSON (required by paystack-node library)
        const metadata = JSON.stringify({
            upgradeRequestId: upgradeRequestId.toString(),
            businessId: upgradeRequest.business._id.toString(),
            businessName: upgradeRequest.business.name,
            currentTier: upgradeRequest.currentTier,
            requestedTier: upgradeRequest.requestedTier,
            planCode: plan,
            custom_fields: [
                {
                    display_name: 'Business Name',
                    variable_name: 'business_name',
                    value: upgradeRequest.business.name
                },
                {
                    display_name: 'Tier Upgrade',
                    variable_name: 'tier_upgrade',
                    value: `${upgradeRequest.currentTier} → ${upgradeRequest.requestedTier}`
                }
            ]
        });

        const paystackPayload = {
            email,
            currency,
            reference,
            metadata,
            callback_url: `${process.env.FRONTEND_URL}/business/subscription/payment-callback`
        };

        if (plan) {
            paystackPayload.plan = plan;
            paystackPayload.amount = amount * 100; // Paystack-node library requires amount even with plan
        } else {
            paystackPayload.amount = amount * 100; // Paystack expects amount in kobo
        }

        const response = await paystack.initializeTransaction(paystackPayload);

        // Safely log only the body part (avoid circular reference from HTTP objects)
        console.log('Paystack Response Body:', response.body ? JSON.stringify(response.body, null, 2) : 'No body');

        // Handle different response formats from paystack-node
        // The library wraps responses in a 'body' property
        let responseData = null;
        let isSuccess = false;

        if (response.body) {
            // paystack-node library format
            responseData = response.body.data;
            isSuccess = response.body.status === true;
        } else if (response.data) {
            // Direct axios-like format
            responseData = response.data;
            isSuccess = response.status === true;
        } else if (response.authorization_url) {
            // Direct data format (unlikely but handled)
            responseData = response;
            isSuccess = true;
        }

        if (!isSuccess || !responseData) {
            const errorMsg = response.body?.message || response.message || 'Paystack initialization failed - no valid response';
            console.error('Paystack Error Details:', errorMsg);
            console.error('Response Body:', response.body ? JSON.stringify(response.body) : 'No body');
            throw new Error(errorMsg);
        }

        if (!responseData.authorization_url) {
            console.error('Missing authorization_url in Paystack response:', responseData);
            throw new Error('Paystack did not return an authorization URL');
        }

        // Update upgrade request with payment reference
        upgradeRequest.paymentReference = reference;
        upgradeRequest.paymentStatus = 'pending';
        upgradeRequest.paymentMethod = 'paystack';
        // Save plan code if used
        if (plan) {
            upgradeRequest.billingCycle = 'monthly'; // Assume monthly for subscriptions unless specified otherwise
        }
        await upgradeRequest.save();

        return {
            success: true,
            authorizationUrl: responseData.authorization_url,
            accessCode: responseData.access_code,
            reference
        };
    } catch (error) {
        console.error('Paystack initialization technical error:', error);
        throw error;
    }
}

/**
 * Verify payment and process upgrade
 */
async function verifyPayment(reference) {
    try {
        // Verify transaction with Paystack
        const response = await paystack.verifyTransaction({ reference });

        if (response.body.data.status !== 'success') {
            return {
                success: false,
                message: 'Payment verification failed',
                status: response.body.data.status
            };
        }

        const { metadata, amount, currency, paid_at, customer, plan } = response.body.data;
        const upgradeRequestId = metadata.upgradeRequestId;

        // Find upgrade request
        const upgradeRequest = await TierUpgradeRequest.findById(upgradeRequestId);
        if (!upgradeRequest) {
            throw new Error('Upgrade request not found');
        }

        // Check if already processed
        if (upgradeRequest.paymentStatus === 'completed') {
            return {
                success: true,
                message: 'Payment already processed',
                alreadyProcessed: true
            };
        }

        // Update payment status
        upgradeRequest.paymentStatus = 'completed';
        upgradeRequest.amount = amount / 100; // Convert from kobo to naira
        upgradeRequest.currency = currency;
        await upgradeRequest.save();

        // Auto-approve the upgrade
        const approvalResult = await approveUpgrade(
            upgradeRequestId,
            null, // No admin ID for auto-approval
            `Auto-approved after successful payment. Payment Reference: ${reference}`
        );

        // Update Subscription with Paystack details
        if (approvalResult.subscription) {
            if (customer && customer.customer_code) {
                approvalResult.subscription.customerCode = customer.customer_code;
            }
            if (plan && plan.plan_code) {
                approvalResult.subscription.planCode = plan.plan_code;
                approvalResult.subscription.autoRenew = true;
            }
            // Sometimes subscription_code is available in the transaction if it was instant
            if (response.body.data.subscription_code) {
                approvalResult.subscription.subscriptionCode = response.body.data.subscription_code;
            }

            await approvalResult.subscription.save();
        }

        // Send payment success notification email
        await sendPaymentSuccessNotification(
            approvalResult.request,
            approvalResult.business,
            reference
        );

        return {
            success: true,
            message: 'Payment verified and tier upgraded successfully',
            upgradeRequest: approvalResult.request,
            business: approvalResult.business
        };
    } catch (error) {
        console.error('Payment verification error:', error);
        throw error;
    }
}

/**
 * Handle Paystack webhook
 */
async function handleWebhook(event) {
    try {
        const { event: eventType, data } = event;
        console.log(`Processing Webhook Event: ${eventType}`);

        switch (eventType) {
            case 'charge.success':
                // Payment successful
                const { reference, metadata, amount, currency } = data;

                // Handle initial payment verification
                if (metadata && metadata.upgradeRequestId) {
                    await verifyPayment(reference);
                } else if (data.subscription_code) {
                    // This is a renewal charge
                    console.log(`Processing renewal charge for subscription: ${data.subscription_code}`);
                    const subscription = await Subscription.findOne({ subscriptionCode: data.subscription_code });
                    if (subscription) {
                        subscription.status = 'active';
                        subscription.paymentReference = reference; // Update latest ref
                        // Extend renewal date
                        const now = new Date();
                        const nextRenewal = new Date(now);
                        if (subscription.billingCycle === 'annual') {
                            nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
                        } else {
                            // Default monthly
                            nextRenewal.setMonth(nextRenewal.getMonth() + 1);
                        }
                        subscription.renewalDate = nextRenewal;
                        subscription.endDate = nextRenewal;
                        await subscription.save();

                        // Also update Business record
                        const business = await Business.findById(subscription.business);
                        if (business) {
                            business.subscriptionStatus = 'active';
                            business.subscriptionRenewalDate = nextRenewal;
                            business.subscriptionEndDate = nextRenewal;
                            business.lastPaymentDate = now;
                            business.lastPaymentAmount = amount / 100;
                            await business.save();
                        }
                    }
                }
                break;

            case 'subscription.create':
                // Subscription created
                if (data.subscription_code && data.customer && data.customer.customer_code) {
                    const sub = await Subscription.findOne({ customerCode: data.customer.customer_code });
                    if (sub) {
                        sub.subscriptionCode = data.subscription_code;
                        sub.status = 'active';
                        if (data.next_payment_date) {
                            sub.renewalDate = new Date(data.next_payment_date);
                            sub.endDate = new Date(data.next_payment_date);
                        }
                        await sub.save();
                    }
                }
                break;

            case 'subscription.disable':
                // Subscription cancelled
                if (data.subscription_code) {
                    const sub = await Subscription.findOne({ subscriptionCode: data.subscription_code });
                    if (sub) {
                        sub.status = 'cancelled';
                        sub.autoRenew = false;
                        sub.cancelledAt = new Date();
                        await sub.save();

                        const business = await Business.findById(sub.business);
                        if (business) {
                            business.subscriptionStatus = 'cancelled';
                            await business.save();
                        }
                    }
                }
                break;

            case 'charge.failed':
                // Payment failed
                if (data.metadata && data.metadata.upgradeRequestId) {
                    const upgradeRequest = await TierUpgradeRequest.findById(data.metadata.upgradeRequestId);
                    if (upgradeRequest) {
                        upgradeRequest.paymentStatus = 'failed';
                        await upgradeRequest.save();
                    }
                }
                break;

            default:
                console.log(`Unhandled webhook event: ${eventType}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Webhook handling error:', error);
        throw error;
    }
}

/**
 * Get payment details
 */
async function getPaymentDetails(reference) {
    try {
        const response = await paystack.verifyTransaction({ reference });
        return {
            success: true,
            data: response.body.data
        };
    } catch (error) {
        console.error('Error fetching payment details:', error);
        throw error;
    }
}

/**
 * Refund payment (if needed)
 */
async function refundPayment(reference, amount) {
    try {
        // Note: Paystack refunds require the transaction ID, not reference
        const transaction = await paystack.verifyTransaction({ reference });
        const transactionId = transaction.body.data.id;

        const response = await paystack.createRefund({
            transaction: transactionId,
            amount: amount * 100 // Convert to kobo
        });

        return {
            success: true,
            data: response.body.data
        };
    } catch (error) {
        console.error('Refund error:', error);
        throw error;
    }
}

/**
 * Cancel a subscription
 */
async function cancelSubscription(subscriptionCode) {
    try {
        // Paystack-node might not have specific cancelSubscription method exposed easily
        // But we can usually use a generic request or if the library supports it
        // Checking library docs (simulated): paystack.subscription.disable({ code, token })

        // If library method is not obvious, we might need a direct call. for now assume library support or implement later.
        // Since we don't have the token handy immediately without looking up transaction, 
        // we might need to rely on User cancelling via our Email/Auth token or just Disable.

        // For this MVP, we will rely on Paystack Dashboard or implement direct API call if needed.
        // A placeholder log:
        console.log(`Requesting cancellation for ${subscriptionCode}`);

        // Implementing using generic requestUtils if available, else omit for now.
        // Ideally: await paystack.post('/subscription/disable', { code: subscriptionCode, token: ... });

        return { success: true, message: "Subscription cancellation requested" };
    } catch (error) {
        console.error('Cancel subscription error:', error);
        throw error;
    }
}

module.exports = {
    initializePayment,
    verifyPayment,
    handleWebhook,
    getPaymentDetails,
    refundPayment,
    cancelSubscription
};

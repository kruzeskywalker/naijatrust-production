const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    businessUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessUser',
        required: true
    },

    // Subscription Details
    tier: {
        type: String,
        enum: ['basic', 'verified', 'premium', 'enterprise'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
        default: 'inactive'
    },

    // Pricing
    amount: { type: Number, required: true }, // in kobo (NGN) or cents (USD)
    currency: { type: String, default: 'NGN', enum: ['NGN', 'USD'] },
    billingCycle: {
        type: String,
        enum: ['monthly', 'annual'],
        default: 'monthly'
    },

    // Dates
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    renewalDate: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },

    // Payment Integration
    paymentProvider: {
        type: String,
        enum: ['paystack', 'flutterwave', 'manual'],
        required: true
    },
    paymentReference: { type: String },
    subscriptionCode: { type: String }, // Paystack/Flutterwave subscription code
    customerCode: { type: String }, // Payment provider customer code
    planCode: { type: String }, // Paystack Plan Code (PLN_xxx)

    // Trial
    isTrialing: { type: Boolean, default: false },
    trialEndsAt: { type: Date },

    // Auto-renewal
    autoRenew: { type: Boolean, default: true },

    // Metadata
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Indexes for efficient queries
subscriptionSchema.index({ business: 1, status: 1 });
subscriptionSchema.index({ businessUser: 1 });
subscriptionSchema.index({ renewalDate: 1, status: 1 });
subscriptionSchema.index({ status: 1, tier: 1 });
subscriptionSchema.index({ paymentProvider: 1, subscriptionCode: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function () {
    return this.status === 'active' || this.status === 'trialing';
};

// Method to check if subscription needs renewal
subscriptionSchema.methods.needsRenewal = function () {
    if (!this.renewalDate) return false;
    return new Date() >= this.renewalDate && this.status === 'active';
};

// Method to check if trial has expired
subscriptionSchema.methods.isTrialExpired = function () {
    if (!this.isTrialing || !this.trialEndsAt) return false;
    return new Date() >= this.trialEndsAt;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);

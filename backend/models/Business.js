const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: { type: String, required: true },

    category: { type: String }, // Deprecated, keeping for temporary backward compat
    categories: [{ type: String }], // New multi-category support
    location: { type: String, required: true },
    description: { type: String },
    website: { type: String },
    phone: { type: String },
    email: { type: String },
    logo: { type: String },

    // Ownership and claiming
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessUser' },
    isClaimed: { type: Boolean, default: false },
    claimStatus: {
        type: String,
        enum: ['unclaimed', 'pending', 'claimed'],
        default: 'unclaimed'
    },
    claimedAt: { type: Date },

    // Verification
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    verifiedAt: { type: Date },

    // Reviews and ratings
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    // Analytics (Aggregated)
    viewCount: { type: Number, default: 0 },
    websiteClickCount: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },

    // Subscription Management
    subscriptionTier: {
        type: String,
        enum: ['basic', 'verified', 'premium', 'enterprise'],
        default: 'basic'
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
        default: 'inactive'
    },
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date },
    subscriptionRenewalDate: { type: Date },

    // Payment Tracking
    paymentMethod: { type: String }, // 'paystack', 'flutterwave', 'bank_transfer'
    lastPaymentDate: { type: Date },
    lastPaymentAmount: { type: Number },
    currency: { type: String, default: 'NGN' }, // 'NGN' or 'USD'

    // Feature Flags (based on subscription tier)
    features: {
        canRespondToReviews: { type: Boolean, default: false },
        canAccessAnalytics: { type: Boolean, default: false },
        canAccessAdvancedAnalytics: { type: Boolean, default: false },
        canBeFeatured: { type: Boolean, default: false },
        maxLocations: { type: Number, default: 1 },
        hasAPIAccess: { type: Boolean, default: false },
        hasDedicatedSupport: { type: Boolean, default: false },
        verifiedBadge: { type: Boolean, default: false },
        prioritySupport: { type: Boolean, default: false },
        customIntegrations: { type: Boolean, default: false },
        whiteLabel: { type: Boolean, default: false }
    },

    // Billing Information
    billingEmail: { type: String },
    billingPhone: { type: String },

    // Trial
    isTrialing: { type: Boolean, default: false },
    trialEndsAt: { type: Date },

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient searches and queries
businessSchema.index({ name: 'text', description: 'text' }); // Text search
businessSchema.index({ category: 1, location: 1 }); // Category + location filtering
businessSchema.index({ category: 1, rating: -1 }); // Category with top-rated sorting
businessSchema.index({ rating: -1, reviewCount: -1 }); // Top-rated businesses
businessSchema.index({ claimStatus: 1 }); // Claim status filtering
businessSchema.index({ isVerified: 1 }); // Verified businesses
businessSchema.index({ createdAt: -1 }); // Newest businesses
businessSchema.index({ subscriptionTier: 1, subscriptionStatus: 1 }); // Subscription filtering
businessSchema.index({ subscriptionRenewalDate: 1 }); // Renewal processing


module.exports = mongoose.model('Business', businessSchema);

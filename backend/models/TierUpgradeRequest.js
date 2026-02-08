const mongoose = require('mongoose');

const tierUpgradeRequestSchema = new mongoose.Schema({
    // Business and User References
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true
    },
    businessUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessUser',
        required: false,
        index: true
    },

    // Tier Information
    currentTier: {
        type: String,
        enum: ['basic', 'verified', 'premium', 'enterprise'],
        required: true
    },
    requestedTier: {
        type: String,
        enum: ['basic', 'verified', 'premium', 'enterprise'],
        required: true
    },

    // Request Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending',
        index: true
    },

    // Request Type
    requestType: {
        type: String,
        enum: ['trial', 'payment', 'manual'],
        required: true
    },

    // Payment Details (if applicable)
    paymentMethod: {
        type: String,
        enum: ['paystack', 'flutterwave', 'manual', 'none'],
        default: 'none'
    },
    paymentReference: {
        type: String,
        sparse: true,
        index: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'none'],
        default: 'none'
    },
    amount: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        enum: ['NGN', 'USD'],
        default: 'NGN'
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'annual'],
        default: 'monthly'
    },

    // Admin Review
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    },
    reviewedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    adminNotes: {
        type: String
    },

    // Additional Information
    businessNotes: {
        type: String // Business can add notes with their request
    },

    // Trial Information (if trial request)
    trialDuration: {
        type: Number, // in days
        default: 30
    },

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
tierUpgradeRequestSchema.index({ business: 1, status: 1 });
tierUpgradeRequestSchema.index({ status: 1, createdAt: -1 });
tierUpgradeRequestSchema.index({ requestedTier: 1, status: 1 });
tierUpgradeRequestSchema.index({ paymentReference: 1 }, { sparse: true });

// Helper Methods
tierUpgradeRequestSchema.methods.isPending = function () {
    return this.status === 'pending';
};

tierUpgradeRequestSchema.methods.isApproved = function () {
    return this.status === 'approved';
};

tierUpgradeRequestSchema.methods.isRejected = function () {
    return this.status === 'rejected';
};

tierUpgradeRequestSchema.methods.requiresPayment = function () {
    return this.requestType === 'payment' && this.paymentStatus !== 'completed';
};

tierUpgradeRequestSchema.methods.canBeApproved = function () {
    if (this.status !== 'pending') return false;
    if (this.requestType === 'payment' && this.paymentStatus !== 'completed') return false;
    return true;
};

// Static Methods
tierUpgradeRequestSchema.statics.getPendingRequests = function () {
    return this.find({ status: 'pending' })
        .populate('business', 'name category location subscriptionTier')
        .populate('businessUser', 'name email')
        .sort('-createdAt');
};

tierUpgradeRequestSchema.statics.getRequestsByBusiness = function (businessId) {
    return this.find({ business: businessId })
        .sort('-createdAt');
};

tierUpgradeRequestSchema.statics.hasActivePendingRequest = async function (businessId) {
    const count = await this.countDocuments({
        business: businessId,
        status: 'pending'
    });
    return count > 0;
};

tierUpgradeRequestSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const tierStats = await this.aggregate([
        {
            $match: { status: 'pending' }
        },
        {
            $group: {
                _id: '$requestedTier',
                count: { $sum: 1 }
            }
        }
    ]);

    return {
        byStatus: stats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        byTier: tierStats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {})
    };
};

const TierUpgradeRequest = mongoose.model('TierUpgradeRequest', tierUpgradeRequestSchema);

module.exports = TierUpgradeRequest;

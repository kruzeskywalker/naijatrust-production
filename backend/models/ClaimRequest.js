const mongoose = require('mongoose');

const claimRequestSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessUser',
        required: true
    },

    // Claim details
    businessEmail: { type: String },
    phone: { type: String, required: true },
    position: { type: String, required: true },

    // Documents
    documents: [{
        type: {
            type: String,
            enum: ['business_license', 'tax_id', 'utility_bill', 'government_id', 'authorization_letter'],
            required: true
        },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
    }],

    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    // Review information
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    adminNotes: { type: String },
    rejectionReason: { type: String },

    // Additional info
    additionalInfo: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
claimRequestSchema.index({ business: 1, user: 1 });
claimRequestSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('ClaimRequest', claimRequestSchema);

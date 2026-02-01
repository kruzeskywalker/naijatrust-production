const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
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

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index for efficient searches
businessSchema.index({ name: 'text', description: 'text' });
businessSchema.index({ category: 1, location: 1 });
businessSchema.index({ claimStatus: 1 });

module.exports = mongoose.model('Business', businessSchema);

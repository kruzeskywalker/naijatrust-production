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

// Indexes for efficient searches and queries
businessSchema.index({ name: 'text', description: 'text' }); // Text search
businessSchema.index({ category: 1, location: 1 }); // Category + location filtering
businessSchema.index({ category: 1, rating: -1 }); // Category with top-rated sorting
businessSchema.index({ rating: -1, reviewCount: -1 }); // Top-rated businesses
businessSchema.index({ claimStatus: 1 }); // Claim status filtering
businessSchema.index({ isVerified: 1 }); // Verified businesses
businessSchema.index({ createdAt: -1 }); // Newest businesses


module.exports = mongoose.model('Business', businessSchema);

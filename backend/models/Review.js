const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    content: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    replies: [{
        user: { type: mongoose.Schema.Types.ObjectId, refPath: 'replies.onModel' },
        onModel: { type: String, required: true, enum: ['User', 'BusinessUser'], default: 'User' },
        content: { type: String, required: true },
        isBusiness: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    isHidden: { type: Boolean, default: false }, // For moderation
    disputeStatus: { type: String, enum: ['none', 'pending', 'accepted', 'rejected'], default: 'none' },
    disputeReason: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
reviewSchema.index({ business: 1, createdAt: -1 }); // Business reviews sorted by date
reviewSchema.index({ user: 1, createdAt: -1 }); // User reviews sorted by date
reviewSchema.index({ rating: -1 }); // Sort by rating
reviewSchema.index({ isHidden: 1 }); // Filter hidden reviews
reviewSchema.index({ disputeStatus: 1 }); // Filter disputed reviews

module.exports = mongoose.model('Review', reviewSchema);

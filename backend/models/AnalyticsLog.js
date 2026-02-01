const mongoose = require('mongoose');

const analyticsLogSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    eventType: {
        type: String,
        enum: ['view', 'website_click', 'call_click'],
        required: true
    },
    // Optional: track visitor IP or user ID to prevent spam/duplicate counts in short windows
    visitorIp: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If logged in

    timestamp: { type: Date, default: Date.now },
    metadata: { type: Object } // Browser info, source, etc.
});

// Indexes for aggregation efficiency
analyticsLogSchema.index({ businessId: 1, eventType: 1, timestamp: -1 });

module.exports = mongoose.model('AnalyticsLog', analyticsLogSchema);

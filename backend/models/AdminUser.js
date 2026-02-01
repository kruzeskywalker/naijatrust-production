const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    role: {
        type: String,
        enum: ['admin', 'super_admin'],
        default: 'admin'
    },

    // Permissions
    permissions: [{
        type: String,
        enum: [
            'review_claims',
            'approve_claims',
            'reject_claims',
            'manage_businesses',
            'manage_users',
            'view_analytics',
            'manage_admins'
        ]
    }],

    // Status
    isActive: { type: Boolean, default: true },

    // Activity tracking
    lastLogin: { type: Date },
    loginHistory: [{
        timestamp: { type: Date, default: Date.now },
        ipAddress: { type: String },
        userAgent: { type: String }
    }],

    // Audit trail
    actionsPerformed: [{
        action: { type: String },
        targetType: { type: String }, // 'claim', 'business', 'user'
        targetId: { type: mongoose.Schema.Types.ObjectId },
        details: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],

    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
});

// Hash password before saving
adminUserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare passwords
adminUserSchema.methods.comparePassword = async function (candidatePassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to log admin action
adminUserSchema.methods.logAction = function (action, targetType, targetId, details) {
    this.actionsPerformed.push({
        action,
        targetType,
        targetId,
        details,
        timestamp: new Date()
    });

    // Keep only last 1000 actions
    if (this.actionsPerformed.length > 1000) {
        this.actionsPerformed = this.actionsPerformed.slice(-1000);
    }

    return this.save();
};

module.exports = mongoose.model('AdminUser', adminUserSchema);

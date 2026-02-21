const mongoose = require('mongoose');

const businessUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: 'business', enum: ['business'] },

    // Verification status
    isEmailVerified: { type: Boolean, default: false },
    isAdminVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },

    // Business information
    businessEmail: { type: String },
    phone: { type: String, required: true },
    position: { type: String, required: true }, // Owner, Manager, etc.
    companyName: { type: String },

    // Claimed businesses
    claimedBusinesses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }],

    // Verification documents
    verificationDocuments: [{
        type: { type: String }, // 'id', 'authorization_letter', etc.
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now }
    }],

    // Account status
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String },

    // Deletion Request
    deletionRequest: {
        status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
        reason: { type: String },
        requestedAt: { type: Date }
    },

    // Metadata
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    // Password Reset
    passwordResetToken: String,
    passwordResetExpires: Date
});

// Hash password before saving
businessUserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare passwords
businessUserSchema.methods.comparePassword = async function (candidatePassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
};

businessUserSchema.methods.createPasswordResetToken = function () {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Token expires in 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('BusinessUser', businessUserSchema);

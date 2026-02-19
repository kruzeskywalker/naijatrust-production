const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function () { return !this.googleId; } },
    role: { type: String, enum: ['user', 'business', 'admin'], default: 'user' },
    avatar: { type: String },
    isBlocked: { type: Boolean, default: false }, // Admin block status
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    googleId: { type: String, unique: true, sparse: true },
    passwordResetToken: String,
    passwordResetExpires: Date,
    likedBusinesses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }],
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateVerificationToken = function () {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    this.verificationToken = token;
    this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return token;
};

userSchema.methods.isVerificationTokenValid = function (token) {
    return this.verificationToken === token && this.verificationTokenExpires > Date.now();
};

userSchema.methods.createPasswordResetToken = function () {
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

// Indexes for efficient queries
userSchema.index({ isVerified: 1 }); // Filter verified users

module.exports = mongoose.model('User', userSchema);

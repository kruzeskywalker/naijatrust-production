const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    businessUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessUser',
        required: true
    },

    // Payment Details
    amount: { type: Number, required: true }, // in kobo (NGN) or cents (USD)
    currency: { type: String, default: 'NGN', enum: ['NGN', 'USD'] },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'refunded', 'abandoned'],
        default: 'pending'
    },

    // Payment Provider
    provider: {
        type: String,
        enum: ['paystack', 'flutterwave', 'manual'],
        required: true
    },
    reference: { type: String, required: true, unique: true },
    providerReference: { type: String }, // Provider's transaction reference
    authorizationCode: { type: String }, // For card tokenization

    // Payment Method
    paymentMethod: { type: String }, // 'card', 'bank_transfer', 'ussd', 'mobile_money'
    channel: { type: String }, // Specific channel used

    // Card Details (if applicable)
    cardType: { type: String }, // 'visa', 'mastercard', etc.
    cardLast4: { type: String },
    cardExpiry: { type: String },
    bank: { type: String },

    // Transaction Info
    description: { type: String },
    fees: { type: Number }, // Transaction fees
    paidAt: { type: Date },
    failureReason: { type: String },

    // Refund Info
    refundedAt: { type: Date },
    refundReason: { type: String },
    refundAmount: { type: Number },

    // Metadata
    metadata: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Indexes for efficient queries
paymentSchema.index({ providerReference: 1 });
paymentSchema.index({ subscription: 1, createdAt: -1 });
paymentSchema.index({ business: 1, status: 1 });
paymentSchema.index({ businessUser: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Method to check if payment is successful
paymentSchema.methods.isSuccessful = function () {
    return this.status === 'success';
};

// Method to mark payment as successful
paymentSchema.methods.markAsSuccessful = function (providerData) {
    this.status = 'success';
    this.paidAt = new Date();
    if (providerData) {
        this.providerReference = providerData.reference || this.providerReference;
        this.paymentMethod = providerData.paymentMethod || this.paymentMethod;
        this.channel = providerData.channel || this.channel;
        this.cardType = providerData.cardType;
        this.cardLast4 = providerData.cardLast4;
        this.bank = providerData.bank;
        this.authorizationCode = providerData.authorizationCode;
    }
    return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function (reason) {
    this.status = 'failed';
    this.failureReason = reason;
    return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);

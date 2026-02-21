const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { verifyBusinessToken } = require('../middleware/businessAuth');
const paystackService = require('../utils/paystackService');
const TierUpgradeRequest = require('../models/TierUpgradeRequest');

/**
 * Initialize payment for tier upgrade
 * POST /api/payments/initialize
 */
router.post('/initialize', verifyBusinessToken, async (req, res) => {
    try {
        const { upgradeRequestId, plan } = req.body;
        const businessUserId = req.user._id;

        console.log('--- PAYMENT INITIALIZE REQUEST ---');
        console.log('Upgrade Request ID:', upgradeRequestId);
        console.log('Business User ID:', businessUserId);
        console.log('Plan Code:', plan);
        console.log('User Email:', req.user.email);

        // Verify upgrade request belongs to user
        const upgradeRequest = await TierUpgradeRequest.findById(upgradeRequestId)
            .populate('business');

        if (!upgradeRequest) {
            console.log('Upgrade request not found');
            return res.status(404).json({
                success: false,
                message: 'Upgrade request not found'
            });
        }

        console.log('Upgrade Request Amount:', upgradeRequest.amount);
        console.log('Upgrade Request Tier:', upgradeRequest.requestedTier);

        if (upgradeRequest.businessUser.toString() !== businessUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to this upgrade request'
            });
        }

        if (upgradeRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This upgrade request has already been processed'
            });
        }

        console.log('Payment initialization starting for request:', upgradeRequestId);

        // Initialize payment
        const paymentData = await paystackService.initializePayment({
            upgradeRequestId,
            email: req.user.email,
            amount: upgradeRequest.amount,
            currency: upgradeRequest.currency,
            plan // Pass plan code
        });

        console.log('Payment initialization successful, sending response');

        res.status(200).json({
            success: true,
            message: 'Payment initialized successfully',
            data: paymentData
        });
    } catch (error) {
        console.error('--- PAYMENT INITIALIZE ERROR ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to initialize payment',
            error: error.message
        });
    }
});

/**
 * Verify payment
 * GET /api/payments/verify/:reference
 */
router.get('/verify/:reference', verifyBusinessToken, async (req, res) => {
    try {
        const { reference } = req.params;

        const result = await paystackService.verifyPayment(reference);

        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                upgradeRequest: result.upgradeRequest,
                business: result.business,
                alreadyProcessed: result.alreadyProcessed
            }
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message
        });
    }
});

/**
 * Paystack webhook endpoint
 * POST /api/payments/webhook
 */
router.post('/webhook', async (req, res) => {
    try {
        // Verify webhook signature
        const hash = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(401).json({
                success: false,
                message: 'Invalid signature'
            });
        }

        // Process webhook
        await paystackService.handleWebhook(req.body);

        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed',
            error: error.message
        });
    }
});

/**
 * Get payment details
 * GET /api/payments/details/:reference
 */
router.get('/details/:reference', verifyBusinessToken, async (req, res) => {
    try {
        const { reference } = req.params;

        const result = await paystackService.getPaymentDetails(reference);

        res.status(200).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment details',
            error: error.message
        });
    }
});

module.exports = router;

import React, { useState, useEffect } from 'react';
import { X, Check, Crown, Star, Zap, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import usePaystack from '../hooks/usePaystack';
import { useBusinessAuth } from '../context/BusinessAuthContext';
import './UpgradeModal.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001/api' : 'https://naijatrust-production-api.onrender.com/api');

const UpgradeModal = ({ isOpen, onClose, currentTier, businessId, onSuccess }) => {
    const [plans, setPlans] = useState([]);
    const [selectedTier, setSelectedTier] = useState(null);
    const [requestType, setRequestType] = useState('trial'); // trial, payment
    const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, annual
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [pendingRequest, setPendingRequest] = useState(null);
    const { initializePayment } = usePaystack();
    const { businessUser } = useBusinessAuth();

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
            checkPendingRequest();
        }
    }, [isOpen]);

    const checkPendingRequest = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/subscriptions/my-upgrade-requests?businessId=${businessId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('businessToken')}`
                }
            });
            const data = await response.json();
            if (data.success && data.data.requests) {
                const pending = data.data.requests.find(r => r.status === 'pending');
                if (pending) {
                    setPendingRequest(pending);
                    setSelectedTier(pending.requestedTier);
                    setBillingCycle(pending.billingCycle || 'monthly');
                }
            }
        } catch (error) {
            console.error('Error checking pending requests:', error);
        }
    };

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/subscriptions/plans?currency=NGN`);
            const data = await response.json();
            if (data.success) {
                // Filter out current tier and lower tiers
                const tierOrder = ['basic', 'verified', 'premium', 'enterprise'];
                const currentIndex = tierOrder.indexOf(currentTier);
                const availablePlans = data.data.plans.filter(plan => {
                    const planIndex = tierOrder.indexOf(plan.tier);
                    return planIndex > currentIndex;
                });
                setPlans(availablePlans);

                // Auto-select first available tier if not already selected via pending
                if (availablePlans.length > 0 && !selectedTier) {
                    setSelectedTier(availablePlans[0].tier);
                }
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
            toast.error('Failed to load subscription plans');
        } finally {
            setLoading(false);
        }
    };

    const cancelPendingRequest = async () => {
        if (!pendingRequest) return;
        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/subscriptions/cancel-upgrade-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('businessToken')}`
                },
                body: JSON.stringify({
                    requestId: pendingRequest._id
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Pending request cancelled');
                setPendingRequest(null);
                // Reset to defaults
                if (plans.length > 0) setSelectedTier(plans[0].tier);
            } else {
                toast.error(data.message || 'Failed to cancel request');
            }
        } catch (error) {
            console.error('Error cancelling request:', error);
            toast.error('Failed to cancel request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('businessToken');
            let upgradeRequest = pendingRequest;

            // Only create new request if no pending request exists
            if (!upgradeRequest) {
                if (!selectedTier) {
                    toast.error('Please select a tier');
                    setSubmitting(false);
                    return;
                }

                // If trial request, start immediately using the start-trial endpoint
                if (requestType === 'trial') {
                    const response = await fetch(`${API_BASE_URL}/subscriptions/start-trial`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            businessId,
                            tier: selectedTier,
                            trialDays: 30
                        })
                    });

                    const data = await response.json();

                    if (!data.success) {
                        toast.error(data.message || 'Failed to start free trial');
                        setSubmitting(false);
                        return;
                    }

                    toast.success('Free trial activated successfully!');
                    onSuccess && onSuccess();
                    onClose();
                    setSubmitting(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/subscriptions/request-upgrade`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        businessId,
                        requestedTier: selectedTier,
                        requestType,
                        billingCycle
                    })
                });

                const data = await response.json();

                if (!data.success) {
                    toast.error(data.message || 'Failed to submit upgrade request');
                    setSubmitting(false);
                    return;
                }
                upgradeRequest = data.data.request;
            }

            // If payment type, initialize Paystack
            if (requestType === 'payment' || (upgradeRequest && upgradeRequest.requestType === 'payment')) {
                // Get Plan Code based on billing cycle from request or state
                const cycle = upgradeRequest ? upgradeRequest.billingCycle : billingCycle;
                const tier = upgradeRequest ? upgradeRequest.requestedTier : selectedTier;

                const selectedPlanObj = plans.find(p => p.tier === tier);
                const planCode = selectedPlanObj?.paystackPlanCode?.NGN?.[cycle];

                if (!planCode) {
                    toast.error(`No ${cycle} plan code available for this tier`);
                    setSubmitting(false);
                    return;
                }

                console.log('Initiating payment for upgradeRequest:', upgradeRequest._id);
                console.log('Selected Plan Code:', planCode);

                const paymentResponse = await fetch(`${API_BASE_URL}/payments/initialize`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        upgradeRequestId: upgradeRequest._id,
                        plan: planCode // Pass the plan code
                    })
                });

                const paymentData = await paymentResponse.json();
                console.log('Payment init response:', paymentData);

                if (!paymentData.success) {
                    toast.error(paymentData.message || 'Failed to initialize payment');
                    setSubmitting(false);
                    return;
                }

                // Get user email from context
                const userEmail = businessUser?.email;

                if (!userEmail) {
                    toast.error('User email not found. Please log in again.');
                    setSubmitting(false);
                    return;
                }

                initializePayment({
                    email: userEmail,
                    amount: upgradeRequest.amount,
                    reference: paymentData.data.reference,
                    accessCode: paymentData.data.accessCode,
                    metadata: {
                        upgradeRequestId: upgradeRequest._id,
                        businessId,
                        tier: tier,
                        billingCycle: cycle
                    },
                    onSuccess: async (response) => {
                        console.log('Paystack onSuccess callback:', response);
                        // Verify payment
                        const verifyResponse = await fetch(
                            `${API_BASE_URL}/payments/verify/${response.reference}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            }
                        );

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            toast.success('Payment successful! Your tier has been upgraded.');
                            onSuccess && onSuccess();
                            onClose();
                        } else {
                            toast.error('Payment verification failed');
                        }
                        setSubmitting(false);
                    },
                    onClose: () => {
                        setSubmitting(false);
                        toast.info('Payment cancelled');
                    }
                });
            } else {
                // Trial request fallback string if for some reason the trial bypass above wasn't hit
                toast.success('Free trial activated!');
                onSuccess && onSuccess();
                onClose();
                setSubmitting(false);
            }
        } catch (error) {
            console.error('Error submitting upgrade request:', error);
            toast.error('Failed to submit upgrade request');
            setSubmitting(false);
        }
    };


    const selectedPlan = plans.find(p => p.tier === selectedTier);

    if (!isOpen) return null;

    return (
        <div className="upgrade-modal-overlay" onClick={onClose}>
            <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Upgrade Your Plan</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="modal-loading">
                        <Loader2 className="spinner" size={32} />
                        <p>Loading plans...</p>
                    </div>
                ) : pendingRequest ? (
                    <div className="modal-body">
                        <div className="pending-request-alert">
                            <AlertCircle size={40} className="text-amber-500 mb-2" />
                            <h3>Pending Upgrade Request</h3>
                            <p>
                                You have a pending request to upgrade to <strong>{pendingRequest.requestedTier?.toUpperCase()}</strong> ({pendingRequest.billingCycle || 'monthly'}).
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Amount: ₦{pendingRequest.amount.toLocaleString()}
                            </p>
                            <div className="pending-actions">
                                <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? 'Processing...' : 'Complete Payment'}
                                </button>
                                <button className="btn-text-danger mt-2" onClick={cancelPendingRequest} disabled={submitting}>
                                    Cancel Request & Start Over
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="modal-body">
                            {/* Billing Cycle Toggle */}
                            <div className="billing-cycle-toggle-container">
                                <div className="billing-cycle-toggle">
                                    <button
                                        className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                                        onClick={() => setBillingCycle('monthly')}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        className={`toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
                                        onClick={() => setBillingCycle('annual')}
                                    >
                                        Annual <span className="save-badge">Save up to 20%</span>
                                    </button>
                                </div>
                            </div>

                            {/* Plan Selection */}
                            <div className="plans-grid">
                                {plans.map(plan => (
                                    <div
                                        key={plan.tier}
                                        className={`plan-card ${selectedTier === plan.tier ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                                        onClick={() => setSelectedTier(plan.tier)}
                                    >
                                        {plan.popular && <div className="popular-badge">Most Popular</div>}

                                        <div className="plan-icon">
                                            {plan.tier === 'verified' && <Check size={24} />}
                                            {plan.tier === 'premium' && <Star size={24} />}
                                            {plan.tier === 'enterprise' && <Crown size={24} />}
                                        </div>

                                        <h3>{plan.displayName}</h3>
                                        <p className="plan-description">{plan.description}</p>

                                        <div className="plan-price">
                                            {plan.customPricing ? (
                                                <span className="custom-price">Custom Pricing</span>
                                            ) : (
                                                <>
                                                    <span className="price-amount">
                                                        {billingCycle === 'monthly'
                                                            ? plan.pricing.monthly.formatted
                                                            : plan.pricing.annual.formatted}
                                                    </span>
                                                    <span className="price-period">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="plan-features">
                                            {getDisplayFeatures(plan.features).map((feature) => (
                                                <div key={feature.key} className="feature">
                                                    <Check size={14} />
                                                    <span>{feature.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {selectedTier === plan.tier && (
                                            <div className="selected-indicator">
                                                <Check size={16} />
                                                Selected
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Request Type Selection */}
                            {selectedPlan && (
                                <div className="request-type-section">
                                    <h3>How would you like to proceed?</h3>

                                    <div className="request-options">
                                        {selectedTier === 'verified' && (
                                            <label className={`request-option ${requestType === 'trial' ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="requestType"
                                                    value="trial"
                                                    checked={requestType === 'trial'}
                                                    onChange={(e) => setRequestType(e.target.value)}
                                                />
                                                <div className="option-content">
                                                    <Zap size={20} />
                                                    <div>
                                                        <strong>Start 30-Day Free Trial</strong>
                                                        <p>Try all features risk-free</p>
                                                    </div>
                                                </div>
                                            </label>
                                        )}

                                        {!selectedPlan.customPricing && (
                                            <label className={`request-option ${requestType === 'payment' ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="requestType"
                                                    value="payment"
                                                    checked={requestType === 'payment'}
                                                    onChange={(e) => setRequestType(e.target.value)}
                                                />
                                                <div className="option-content">
                                                    <Crown size={20} />
                                                    <div>
                                                        <strong>Pay Now</strong>
                                                        <p>Instant activation with Paystack</p>
                                                    </div>
                                                </div>
                                            </label>
                                        )}

                                        {selectedPlan.customPricing && (
                                            <div className="custom-pricing-notice">
                                                <AlertCircle size={20} />
                                                <div>
                                                    <strong>Enterprise Plan</strong>
                                                    <p>Please contact our sales team for custom pricing and features tailored to your needs.</p>
                                                    <a href="mailto:support@naijatrust.ng" className="contact-sales-btn">
                                                        Contact Sales
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {!pendingRequest && (
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={onClose} disabled={submitting}>
                                    Cancel
                                </button>
                                {!selectedPlan?.customPricing && (
                                    <button
                                        className="btn-primary"
                                        onClick={handleSubmit}
                                        disabled={!selectedTier || submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="spinner" size={16} />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                {requestType === 'trial' && 'Start Free Trial'}
                                                {requestType === 'payment' && 'Proceed to Payment'}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Feature priority and labels for display
const FEATURE_CONFIG = {
    verifiedBadge: { label: 'Verified Badge', priority: 1 },
    canRespondToReviews: { label: 'Respond to Reviews', priority: 2 },
    canAccessAnalytics: { label: 'Access Analytics', priority: 3 },
    canAccessAdvancedAnalytics: { label: 'Advanced Analytics', priority: 4 },
    prioritySupport: { label: 'Priority Support', priority: 5 },
    canBeFeatured: { label: 'Featured Listings', priority: 6 },
    hasAPIAccess: { label: 'API Access', priority: 7 },
    hasDedicatedSupport: { label: 'Dedicated Support', priority: 8 },
    customIntegrations: { label: 'Custom Integrations', priority: 9 },
    whiteLabel: { label: 'White Label', priority: 10 },
    maxLocations: { label: 'Multiple Locations', priority: 11 }
};

// Get prioritized and formatted features for display
const getDisplayFeatures = (features) => {
    const enabledFeatures = Object.entries(features)
        .filter(([key, value]) => value === true && FEATURE_CONFIG[key])
        .map(([key]) => ({
            key,
            label: FEATURE_CONFIG[key]?.label || formatFeatureName(key),
            priority: FEATURE_CONFIG[key]?.priority || 99
        }))
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 5); // Show top 5 prioritized features

    return enabledFeatures;
};

// Helper function to format feature names
const formatFeatureName = (key) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace('can', '')
        .replace('has', '')
        .replace('is', '')
        .trim();
};

export default UpgradeModal;

import React, { useState, useEffect } from 'react';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { CreditCard, Calendar, CheckCircle, AlertTriangle, XCircle, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import UpgradeModal from '../../components/UpgradeModal';
import './SubscriptionManagement.css'; // We'll create this locally or reuse settings css

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const SubscriptionManagement = () => {
    const { token } = useBusinessAuth();
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/subscriptions/my-subscription`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setSubscriptionData(data.data);
            } else {
                toast.error('Failed to load subscription details');
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
            toast.error('Error load subscription');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing cycle.')) {
            return;
        }

        setCancelling(true);
        try {
            const response = await fetch(`${API_BASE_URL}/subscriptions/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    businessId: subscriptionData.business.id,
                    reason: 'User requested cancellation'
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Subscription cancelled successfully');
                fetchSubscription(); // Refresh data
            } else {
                toast.error(data.message || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error cancelling:', error);
            toast.error('Failed to cancel subscription');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading subscription details...</div>;
    }

    if (!subscriptionData) {
        return <div className="p-4 text-center">Unable to load subscription info.</div>;
    }

    const { business, subscription, payments } = subscriptionData;
    const isFree = business.subscriptionTier === 'basic';
    const isActive = business.subscriptionStatus === 'active' || business.subscriptionStatus === 'trialing';

    return (
        <div className="subscription-management">
            <div className="settings-card">
                <div className="card-header-flex">
                    <h2>Current Plan</h2>
                    {isActive ? (
                        <span className={`status-badge ${business.subscriptionStatus}`}>
                            {business.subscriptionStatus.toUpperCase()}
                        </span>
                    ) : (
                        <span className="status-badge inactive">INACTIVE</span>
                    )}
                </div>

                <div className="current-plan-details">
                    <div className="plan-info">
                        <h3>{business.subscriptionTier.charAt(0).toUpperCase() + business.subscriptionTier.slice(1)} Tier</h3>
                        {business.isTrialing && (
                            <p className="trial-text">Free Trial Ends: {new Date(business.trialEndsAt).toLocaleDateString()}</p>
                        )}
                        {!isFree && !business.isTrialing && (
                            <p className="price-text">
                                {subscription?.amount ? `₦${subscription.amount.toLocaleString()}` : 'Free'}
                                <span className="cycle">/{subscription?.billingCycle || 'month'}</span>
                            </p>
                        )}
                    </div>

                    <div className="plan-actions">
                        <button className="btn-primary" onClick={() => setShowUpgradeModal(true)}>
                            {isFree ? 'Upgrade Plan' : 'Change Plan'}
                        </button>
                    </div>
                </div>

                {isActive && !isFree && (
                    <div className="renewal-info">
                        <Calendar size={18} />
                        <span>
                            {subscription?.autoRenew ? 'Renews on ' : 'Expires on '}
                            <strong>{new Date(business.renewalDate || business.subscriptionEndDate).toLocaleDateString()}</strong>
                        </span>
                    </div>
                )}

                {isActive && !isFree && subscription?.autoRenew && (
                    <div className="cancel-section">
                        <button
                            className="btn-text-danger"
                            onClick={handleCancelSubscription}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                        </button>
                        <p className="cancel-hint">Your features will remain active until the end of the billing period.</p>
                    </div>
                )}
            </div>

            {/* Payment History */}
            {payments && payments.length > 0 && (
                <div className="settings-card">
                    <h2>Payment History</h2>
                    <div className="payments-list">
                        {payments.map(payment => (
                            <div key={payment._id} className="payment-item">
                                <div className="payment-left">
                                    <div className={`payment-icon ${payment.status}`}>
                                        {payment.status === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                    </div>
                                    <div className="payment-meta">
                                        <span className="payment-amount">₦{payment.amount.toLocaleString()}</span>
                                        <span className="payment-date">{new Date(payment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="payment-right">
                                    <span className={`payment-status ${payment.status}`}>{payment.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                currentTier={business.subscriptionTier}
                businessId={business.id}
                onSuccess={() => {
                    fetchSubscription();
                    toast.success('Plan updated successfully!');
                }}
            />
        </div>
    );
};

export default SubscriptionManagement;

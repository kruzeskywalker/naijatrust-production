import React from 'react';
import { Crown, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './SubscriptionCard.css';

const SubscriptionCard = ({ business, onUpgrade }) => {
    const tierInfo = {
        basic: {
            name: 'Basic (Free)',
            color: '#6B7280',
            icon: '🆓'
        },
        verified: {
            name: 'Verified Business',
            color: '#10B981',
            icon: '✓'
        },
        premium: {
            name: 'Premium Business',
            color: '#8B5CF6',
            icon: '⭐'
        },
        enterprise: {
            name: 'Enterprise',
            color: '#F59E0B',
            icon: '👑'
        }
    };

    const currentTier = business?.subscriptionTier || 'basic';
    const tier = tierInfo[currentTier];
    const isTrialing = business?.isTrialing;
    const trialEndsAt = business?.trialEndsAt ? new Date(business.trialEndsAt) : null;
    const daysLeft = trialEndsAt ? Math.ceil((trialEndsAt - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    const features = business?.features || {};
    const featureList = [
        { key: 'canRespondToReviews', label: 'Respond to Reviews', enabled: features.canRespondToReviews },
        { key: 'canAccessAnalytics', label: 'Analytics Dashboard', enabled: features.canAccessAnalytics },
        { key: 'verifiedBadge', label: 'Verified Badge', enabled: features.verifiedBadge },
        { key: 'canAccessAdvancedAnalytics', label: 'Advanced Analytics', enabled: features.canAccessAdvancedAnalytics },
        { key: 'canBeFeatured', label: 'Featured Listings', enabled: features.canBeFeatured }
    ];

    return (
        <div className="subscription-card-v2">
            <div className="sub-header-v2">
                <div className="sub-title-info">
                    <span className="sub-label">Current Plan</span>
                    <div className="tier-pill" style={{ color: tier.color, borderColor: `${tier.color}33`, backgroundColor: `${tier.color}0D` }}>
                        <span className="tier-icon">{tier.icon}</span>
                        <span className="tier-name">{tier.name}</span>
                    </div>
                </div>
                {currentTier !== 'enterprise' && (
                    <button className="upgrade-btn-premium" onClick={onUpgrade}>
                        <TrendingUp size={16} />
                        Upgrade
                    </button>
                )}
            </div>

            <div className="sub-content-v2">
                <div className="status-banner">
                    <div className="status-indicator">
                        <div className={`status-dot ${business?.subscriptionStatus || 'inactive'}`}></div>
                        <span className="status-text">{business?.subscriptionStatus || 'Inactive'}</span>
                    </div>
                    {business?.subscriptionRenewalDate && !isTrialing && (
                        <div className="renewal-info">
                            <Clock size={12} />
                            <span>Renews: {new Date(business.subscriptionRenewalDate).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>

                {isTrialing && trialEndsAt && (
                    <div className="trial-badge-inline">
                        <Clock size={14} />
                        <span>{daysLeft} days left in trial</span>
                    </div>
                )}

                <div className="features-grid-v2">
                    {featureList.map(feature => (
                        <div key={feature.key} className={`feature-row-v2 ${feature.enabled ? 'active' : 'inactive'}`}>
                            {feature.enabled ? (
                                <CheckCircle size={14} className="icon-check" />
                            ) : (
                                <div className="icon-cross">✕</div>
                            )}
                            <span className="feature-label">{feature.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {currentTier === 'basic' && (
                <div className="premium-upsell">
                    <Crown size={18} />
                    <span>Unlock professional tools</span>
                </div>
            )}
        </div>
    );
};

export default SubscriptionCard;

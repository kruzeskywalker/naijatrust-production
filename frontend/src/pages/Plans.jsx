import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import './Plans.css';

const Plans = () => {
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

    const plans = [
        {
            id: 'basic',
            name: 'Basic',
            description: 'Essential visibility for small businesses just starting out.',
            price: { monthly: 0, annual: 0 },
            features: [
                'Basic Business Profile',
                'Response to 0 Reviews',
                'Listed in 1 Category',
                'Standard Support'
            ],
            cta: 'Get Started',
            ctaLink: '/business/signup',
            popular: false
        },
        {
            id: 'verified',
            name: 'Verified',
            description: 'Build trust and engage with your customers effectively. Perfect for SMEs.',
            price: { monthly: 5000, annual: 50000 },
            features: [
                'Verified Badge ✓',
                'Respond to Unlimited Reviews',
                'Access to Analytics',
                'Priority Support',
                'Listed in Multiple Categories'
            ],
            cta: 'Start Free Trial',
            ctaLink: '/business/signup?plan=verified',
            popular: true,
            savings: 'Save 17%'
        },
        {
            id: 'premium',
            name: 'Premium',
            description: 'Advanced tools for growing businesses and multi-location brands.',
            price: { monthly: 15000, annual: 150000 },
            features: [
                'Everything in Verified',
                'Featured in Search Results',
                'Advanced Competitor Analytics',
                'Up to 5 Locations',
                'Dedicated Account Manager'
            ],
            cta: 'Go Premium',
            ctaLink: '/business/signup?plan=premium',
            popular: false,
            savings: 'Save 17%'
        }
    ];

    return (
        <div className="plans-page-wrapper">
            <div className="plans-page">
                <main className="plans-container">
                    <div className="plans-header">
                        <h1>Choose the plan that fits you</h1>
                        <p>Unlock premium features to grow your business, manage your reputation, and reach more customers on Naija Trust.</p>

                        <div className="billing-toggle">
                            <div
                                className={`toggle-option ${billingCycle === 'monthly' ? 'active' : ''}`}
                                onClick={() => setBillingCycle('monthly')}
                            >
                                Monthly
                            </div>
                            <div
                                className={`toggle-option ${billingCycle === 'annual' ? 'active' : ''}`}
                                onClick={() => setBillingCycle('annual')}
                            >
                                Annually <span className="save-badge-toggle">Save 17%</span>
                            </div>
                        </div>
                    </div>

                    <div className="pricing-grid">
                        {plans.map(plan => (
                            <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                                <div className="card-label">
                                    {plan.popular ? 'Recommended' : plan.name}
                                </div>
                                <div className="card-header">
                                    <h3>{plan.name}</h3>
                                    <div className="price-container">
                                        <span className="currency">₦</span>
                                        <span className="price">
                                            {plan.price[billingCycle] === 0
                                                ? '0'
                                                : (plan.price[billingCycle]).toLocaleString()}
                                        </span>
                                        {plan.price[billingCycle] > 0 && <span className="period">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>}
                                    </div>

                                    {billingCycle === 'annual' && plan.savings ? (
                                        <span className="discount-text">{plan.savings} with annual payment</span>
                                    ) : (
                                        <span className="discount-text" style={{ opacity: 0 }}>Save with annual</span> /* Spacer */
                                    )}

                                    <p className="pricing-desc">{plan.description}</p>
                                </div>

                                <Link
                                    to={plan.ctaLink}
                                    className="cta-button"
                                >
                                    {plan.cta}
                                </Link>

                                <div className="features-separator"></div>

                                <div className="features-list">
                                    <ul>
                                        {plan.features.map((feature, index) => (
                                            <li key={index}>
                                                <Check size={20} className="check-icon" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="comparison-section">
                        <h2>Compare all features and limits</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="comparison-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '1rem' }}>Feature</th>
                                        <th style={{ padding: '1rem' }}>Basic</th>
                                        <th style={{ padding: '1rem' }}>Verified</th>
                                        <th style={{ padding: '1rem' }}>Premium</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>Business Profile</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>Standard</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>Enhanced</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>Premium</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>Verified Badge</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>—</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>✓</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>✓</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>Respond to Reviews</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>—</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>Unlimited</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>Unlimited</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>Analytics</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>—</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>Basic Insights</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>Competitor Analysis</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Plans;

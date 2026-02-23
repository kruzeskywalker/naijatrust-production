import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../App';

const Terms = () => {
    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
            <SEO title="Terms of Use" />
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>NaijaTrust Terms of Use</h1>
                <p style={{ color: 'var(--text-light)' }}>Effective Date: [Insert Date]</p>
            </div>

            <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: 'var(--radius)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid var(--border-color)',
                lineHeight: '1.8'
            }}>
                <p style={{ color: 'var(--text-dark)', marginBottom: '2rem' }}>
                    Welcome to NaijaTrust, a digital platform owned and operated by Black Legacy Limited (“Company”, “we”, “us”, or “our”). By accessing or using NaijaTrust, you agree to be bound by these Terms.
                </p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        By registering, accessing, or using NaijaTrust, you confirm that you are at least 18 years old and legally capable of entering a binding agreement.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>2. Platform Purpose</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        NaijaTrust provides a platform where users can:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        <li>Search and verify businesses</li>
                        <li>Share reviews and experiences</li>
                        <li>List and promote verified businesses</li>
                        <li>Improve transparency and trust in the Nigerian marketplace</li>
                    </ul>
                    <p style={{ color: 'var(--text-dark)' }}>We do not guarantee the accuracy of user-generated content.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>3. User Responsibilities</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        You agree to:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Provide truthful, accurate, and lawful content</li>
                        <li>Not post defamatory, misleading, or false information</li>
                        <li>Respect privacy and intellectual property rights</li>
                        <li>Not use the platform for fraud, harassment, or illegal activity</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>4. Business Listings</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        Businesses must:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        <li>Provide accurate business details</li>
                        <li>Comply with Nigerian laws</li>
                        <li>Not misrepresent their services or identity</li>
                    </ul>
                    <p style={{ color: 'var(--text-dark)' }}>NaijaTrust reserves the right to remove listings.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>5. Reviews and Content</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        All reviews must be:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        <li>Based on real experiences</li>
                        <li>Free from hate, threats, or illegal content</li>
                        <li>Non-manipulated or incentivised</li>
                    </ul>
                    <p style={{ color: 'var(--text-dark)' }}>We may moderate, edit, or remove content.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>6. Intellectual Property</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        All platform content, trademarks, and design belong to Black Legacy Limited.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>7. Limitation of Liability</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        NaijaTrust is not responsible for:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Transactions between users and businesses</li>
                        <li>Loss or damages arising from reliance on reviews</li>
                        <li>Service interruptions</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>8. Suspension and Termination</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We may suspend or terminate accounts for violations.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>9. Governing Law</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        These Terms are governed by the laws of the Federal Republic of Nigeria.
                    </p>
                </section>

                <section>
                    <h2 style={{ marginBottom: '1rem' }}>10. Updates</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We may update these Terms periodically.
                    </p>
                </section>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/" className="btn btn-outline">
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default Terms;

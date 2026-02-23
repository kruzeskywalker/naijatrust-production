import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../App';

const Privacy = () => {
    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
            <SEO title="Privacy Policy" />
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>NaijaTrust Privacy Policy</h1>
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
                    This Policy explains how we collect, use, and protect your personal data in compliance with the Nigeria Data Protection Regulation (NDPR).
                </p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>1. Data We Collect</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We may collect:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Name, email, phone</li>
                        <li>Business information</li>
                        <li>Reviews and user-generated content</li>
                        <li>Device and usage data</li>
                        <li>Location (optional)</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>2. Legal Basis</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We process data based on:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Consent</li>
                        <li>Contractual necessity</li>
                        <li>Legal obligations</li>
                        <li>Legitimate interest</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>3. How We Use Data</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        Your data is used to:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Provide services</li>
                        <li>Verify businesses</li>
                        <li>Improve security and trust</li>
                        <li>Communicate updates</li>
                        <li>Prevent fraud</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>4. Data Sharing</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We may share data with:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        <li>Regulatory authorities</li>
                        <li>Verification partners</li>
                        <li>Law enforcement</li>
                        <li>Payment providers</li>
                    </ul>
                    <p style={{ color: 'var(--text-dark)' }}>We do not sell personal data.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>5. Data Security</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We implement:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Encryption</li>
                        <li>Secure hosting</li>
                        <li>Access control</li>
                        <li>Monitoring and audit</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>6. Your Rights</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        You have the right to:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Access your data</li>
                        <li>Request correction</li>
                        <li>Withdraw consent</li>
                        <li>Request deletion</li>
                        <li>Object to processing</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>7. Data Retention</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We retain data only as long as necessary.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>8. Cookies</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We use cookies for performance and analytics.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>9. Contact</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        For complaints: <a href="mailto:support@naijatrust.ng" style={{ color: 'var(--primary-color)' }}>support@naijatrust.ng</a>
                    </p>
                </section>

                <section>
                    <h2 style={{ marginBottom: '1rem' }}>10. International Transfers</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        Where data is stored outside Nigeria, safeguards will apply.
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

export default Privacy;

import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../App';

const ContentModeration = () => {
    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
            <SEO title="Content Moderation Policy" />
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>NaijaTrust Content Moderation Policy</h1>
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
                    NaijaTrust promotes transparency while ensuring fairness and legal compliance.
                </p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>1. Prohibited Content</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We do not allow:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Defamation or false allegations</li>
                        <li>Hate speech</li>
                        <li>Harassment or threats</li>
                        <li>Fraud or impersonation</li>
                        <li>Personal or sensitive data exposure</li>
                        <li>Spam or misleading promotions</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>2. Moderation Methods</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We use:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>AI screening</li>
                        <li>Human review</li>
                        <li>Community reporting</li>
                        <li>Risk scoring</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>3. Review Validation</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We may request:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Evidence of transactions</li>
                        <li>Receipts or communication</li>
                        <li>Identity confirmation</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>4. Enforcement</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        Violations may result in:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Content removal</li>
                        <li>Warnings</li>
                        <li>Account suspension</li>
                        <li>Legal reporting</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ marginBottom: '1rem' }}>5. Transparency</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We strive to maintain fairness and neutrality.
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

export default ContentModeration;

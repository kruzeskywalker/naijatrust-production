import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../App';

const AntiDefamation = () => {
    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
            <SEO title="Anti-Defamation Framework" />
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>NaijaTrust Anti-Defamation Framework</h1>
            </div>

            <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: 'var(--radius)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid var(--border-color)',
                lineHeight: '1.8'
            }}>
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>1. Commitment</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We balance freedom of expression with protection against false harm.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>2. Safeguards</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We require:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Real user accounts</li>
                        <li>Evidence-based reviews</li>
                        <li>Structured complaint workflows</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>3. Verification</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We may verify:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Transactions</li>
                        <li>Identity</li>
                        <li>Supporting documents</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>4. Risk-Based Review</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        High-risk content receives enhanced scrutiny.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>5. Legal Compliance</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We comply with Nigerian defamation laws.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>6. Business Protection</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        Businesses may:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Respond to reviews</li>
                        <li>Submit counter-evidence</li>
                        <li>Request investigations</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>7. User Accountability</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        False or malicious users may face:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Suspension</li>
                        <li>Legal reporting</li>
                        <li>Permanent bans</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ marginBottom: '1rem' }}>8. Transparency</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We maintain audit trails and decision records.
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

export default AntiDefamation;

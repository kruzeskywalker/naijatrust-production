import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../App';

const ContentTakeDown = () => {
    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
            <SEO title="Content Take-Down Policy" />
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>NaijaTrust Content Take-Down Policy</h1>
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
                    <h2 style={{ marginBottom: '1rem' }}>1. Grounds for Removal</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We may remove content that:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Is false or defamatory</li>
                        <li>Violates laws</li>
                        <li>Infringes rights</li>
                        <li>Contains sensitive personal data</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>2. Notice and Action</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We aim to:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Review within 48–72 hours</li>
                        <li>Notify relevant parties</li>
                        <li>Remove or restrict content</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>3. Counter-Notice</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        Users may submit evidence to restore content.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>4. Urgent Cases</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We may act immediately in cases involving:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Fraud</li>
                        <li>Legal risks</li>
                        <li>Public safety</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ marginBottom: '1rem' }}>5. Appeals</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        Appeals must be submitted within 7 days.
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

export default ContentTakeDown;

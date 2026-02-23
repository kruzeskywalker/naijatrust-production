import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../App';

const DisputeResolution = () => {
    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
            <SEO title="Dispute Resolution Policy" />
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>NaijaTrust Dispute Resolution Policy</h1>
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
                    <h2 style={{ marginBottom: '1rem' }}>1. Objective</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        To fairly resolve disputes between users and businesses.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>2. Complaint Process</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        The process follows these steps:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Step 1: User submits complaint</li>
                        <li>Step 2: Business notified</li>
                        <li>Step 3: Response required within 7 days</li>
                        <li>Step 4: Evidence review</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>3. Mediation</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        NaijaTrust may:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Facilitate dialogue</li>
                        <li>Recommend solutions</li>
                        <li>Provide non-binding outcomes</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>4. Escalation</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        Unresolved disputes may be referred to:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Arbitration</li>
                        <li>Regulatory agencies</li>
                        <li>Courts in Nigeria</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ marginBottom: '1rem' }}>5. Neutrality</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        NaijaTrust does not take sides but promotes fairness.
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

export default DisputeResolution;

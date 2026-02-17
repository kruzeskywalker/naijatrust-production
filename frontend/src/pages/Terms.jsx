import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Terms of Service</h1>
                <p style={{ color: 'var(--text-light)' }}>Last updated: January 30, 2026</p>
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
                    <h2 style={{ marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        By accessing and using NaijaTrust, you accept and agree to be bound by the terms and
                        provisions of this agreement. If you do not agree to these terms, please do not use our service.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>2. Use of Service</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        NaijaTrust provides a platform for users to share and read reviews about businesses
                        operating in Nigeria. You agree to:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Provide accurate and truthful information in your reviews</li>
                        <li>Not post defamatory, abusive, or misleading content</li>
                        <li>Respect the intellectual property rights of others</li>
                        <li>Not use the platform for any illegal or unauthorized purpose</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>3. User Accounts</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        You are responsible for maintaining the confidentiality of your account credentials and
                        for all activities that occur under your account. You agree to notify us immediately of
                        any unauthorized use of your account.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>4. Content Guidelines</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        Reviews must be based on genuine experiences. We reserve the right to remove content that
                        violates our guidelines, including but not limited to fake reviews, spam, hate speech, or
                        content that infringes on intellectual property rights.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>5. Intellectual Property</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        The NaijaTrust platform, including its design, features, and content, is owned by NaijaTrust
                        and protected by copyright and other intellectual property laws. User-generated content remains
                        the property of the user, but by posting, you grant NaijaTrust a license to use, display, and
                        distribute that content on our platform.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>6. Limitation of Liability</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        NaijaTrust is provided "as is" without warranties of any kind. We are not responsible for
                        the accuracy of user-generated content and do not endorse any opinions expressed in reviews.
                        We shall not be liable for any damages arising from your use of the platform.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>7. Changes to Terms</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We reserve the right to modify these terms at any time. We will notify users of significant
                        changes via email or through the platform. Continued use of NaijaTrust after changes constitutes
                        acceptance of the modified terms.
                    </p>
                </section>

                <section>
                    <h2 style={{ marginBottom: '1rem' }}>8. Contact</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        If you have questions about these Terms of Service, please contact us at{' '}
                        <a href="mailto:support@naijatrust.ng" style={{ color: 'var(--primary-color)' }}>
                            support@naijatrust.ng
                        </a>
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

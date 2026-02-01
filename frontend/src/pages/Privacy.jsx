import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Privacy Policy</h1>
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
                    <h2 style={{ marginBottom: '1rem' }}>1. Information We Collect</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We collect information that you provide directly to us, including:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Account information (name, email address, password)</li>
                        <li>Profile information (avatar, bio, location)</li>
                        <li>Reviews and ratings you submit</li>
                        <li>Communications with us</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>2. How We Use Your Information</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        We use the information we collect to:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Provide, maintain, and improve our services</li>
                        <li>Send you technical notices and support messages</li>
                        <li>Respond to your comments and questions</li>
                        <li>Monitor and analyze trends and usage</li>
                        <li>Detect and prevent fraud and abuse</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>3. Information Sharing</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We do not sell your personal information. We may share your information in the following circumstances:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>With your consent</li>
                        <li>To comply with legal obligations</li>
                        <li>To protect our rights and prevent fraud</li>
                        <li>With service providers who assist in our operations</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>4. Data Security</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We implement appropriate technical and organizational measures to protect your personal
                        information against unauthorized access, alteration, disclosure, or destruction. However,
                        no internet transmission is completely secure, and we cannot guarantee absolute security.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>5. Cookies and Tracking</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We use cookies and similar tracking technologies to collect information about your browsing
                        activities. You can control cookies through your browser settings, but disabling cookies may
                        affect your ability to use certain features of our platform.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>6. Your Rights</h2>
                    <p style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                        You have the right to:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                        <li>Access and update your personal information</li>
                        <li>Delete your account and associated data</li>
                        <li>Opt out of marketing communications</li>
                        <li>Request a copy of your data</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>7. Children's Privacy</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        Our service is not intended for users under the age of 13. We do not knowingly collect
                        personal information from children under 13. If you become aware that a child has provided
                        us with personal information, please contact us.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>8. Changes to This Policy</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by
                        posting the new policy on this page and updating the "Last updated" date.
                    </p>
                </section>

                <section>
                    <h2 style={{ marginBottom: '1rem' }}>9. Contact Us</h2>
                    <p style={{ color: 'var(--text-dark)' }}>
                        If you have questions about this Privacy Policy, please contact us at{' '}
                        <a href="mailto:privacy@naijatrust.com" style={{ color: 'var(--primary-color)' }}>
                            privacy@naijatrust.com
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

export default Privacy;

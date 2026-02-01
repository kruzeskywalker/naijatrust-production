import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Target } from 'lucide-react';

const About = () => {
    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>About NaijaTrust</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>
                    Nigeria's #1 community for authentic feedback on Nigerian businesses.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <Target size={32} color="var(--primary-color)" />
                        <h2>Our Mission</h2>
                    </div>
                    <p style={{ lineHeight: '1.8', color: 'var(--text-dark)' }}>
                        NaijaTrust empowers Nigerian consumers to make informed decisions by providing
                        a transparent platform for sharing authentic experiences with businesses. We believe
                        that honest feedback drives better service delivery and builds trust in the Nigerian
                        business ecosystem.
                    </p>
                </div>

                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <ShieldCheck size={32} color="var(--primary-color)" />
                        <h2>Why NaijaTrust?</h2>
                    </div>
                    <p style={{ lineHeight: '1.8', color: 'var(--text-dark)' }}>
                        In a market where trust is crucial, NaijaTrust serves as a reliable source of
                        information about businesses operating in Nigeria. Our community-driven approach
                        ensures that reviews are genuine, helping both consumers and businesses thrive
                        through transparency and accountability.
                    </p>
                </div>

                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <Users size={32} color="var(--primary-color)" />
                        <h2>Our Community</h2>
                    </div>
                    <p style={{ lineHeight: '1.8', color: 'var(--text-dark)' }}>
                        NaijaTrust is built by Nigerians, for Nigerians. Our growing community of users
                        shares real experiences across various industries - from banking and fintech to
                        e-commerce and telecommunications. Together, we're building a more transparent
                        marketplace where quality service is rewarded and poor practices are exposed.
                    </p>
                </div>
            </div>

            <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: '#f1fef8',
                borderRadius: 'var(--radius)',
                border: '1px solid #d4f4e0'
            }}>
                <h3 style={{ marginBottom: '1rem' }}>Join Our Community</h3>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>
                    Help other Nigerians make better choices by sharing your experiences.
                </p>
                <Link to="/signup" className="btn btn-primary">
                    Get Started
                </Link>
            </div>
        </div>
    );
};

export default About;

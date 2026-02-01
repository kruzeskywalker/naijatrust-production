import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, TrendingUp, Users } from 'lucide-react';

const Jobs = () => {
    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Careers at NaijaTrust</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>
                    Join us in building Nigeria's most trusted review platform.
                </p>
            </div>

            <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: 'var(--radius)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid var(--border-color)',
                marginBottom: '2rem'
            }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Why Work With Us?</h2>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <TrendingUp size={28} color="var(--primary-color)" style={{ flexShrink: 0 }} />
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Growth Opportunity</h3>
                            <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
                                Be part of a fast-growing startup that's transforming how Nigerians make purchasing decisions.
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Users size={28} color="var(--primary-color)" style={{ flexShrink: 0 }} />
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Collaborative Culture</h3>
                            <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
                                Work with a passionate team dedicated to transparency and consumer empowerment.
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Briefcase size={28} color="var(--primary-color)" style={{ flexShrink: 0 }} />
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Make an Impact</h3>
                            <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
                                Your work will directly help millions of Nigerians make better, more informed choices.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: 'var(--radius)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid var(--border-color)',
                marginBottom: '2rem'
            }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Open Positions</h2>
                <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    We're currently building our team! While we don't have any open positions at the moment,
                    we're always looking for talented individuals who are passionate about our mission.
                </p>
                <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
                    Check back soon or send us your resume at{' '}
                    <a href="mailto:careers@naijatrust.com" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                        careers@naijatrust.com
                    </a>
                    {' '}if you'd like to be considered for future opportunities.
                </p>
            </div>

            <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: '#f1fef8',
                borderRadius: 'var(--radius)',
                border: '1px solid #d4f4e0'
            }}>
                <h3 style={{ marginBottom: '1rem' }}>Interested in Joining Us?</h3>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>
                    Send your resume and a brief introduction to our careers team.
                </p>
                <a href="mailto:careers@naijatrust.com" className="btn btn-primary">
                    Get in Touch
                </a>
            </div>
        </div>
    );
};

export default Jobs;

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Contact Us</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>
                    Have questions? We'd love to hear from you.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    <h2 style={{ marginBottom: '1rem' }}>Get in Touch</h2>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <Mail size={24} color="var(--primary-color)" />
                        <div>
                            <h4 style={{ marginBottom: '0.25rem' }}>Email</h4>
                            <a href="mailto:support@naijatrust.com" style={{ color: 'var(--primary-color)' }}>
                                support@naijatrust.com
                            </a>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <Phone size={24} color="var(--primary-color)" />
                        <div>
                            <h4 style={{ marginBottom: '0.25rem' }}>Phone</h4>
                            <p style={{ color: 'var(--text-light)' }}>+234 (0) 800 123 4567</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <MapPin size={24} color="var(--primary-color)" />
                        <div>
                            <h4 style={{ marginBottom: '0.25rem' }}>Location</h4>
                            <p style={{ color: 'var(--text-light)' }}>Abuja, Nigeria</p>
                        </div>
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid var(--border-color)'
                }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Send us a Message</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="4"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Send size={18} />
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;

import React, { useState, useEffect } from 'react';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';
import './RegisterBusiness.css';

import { BUSINESS_CATEGORIES } from '../../utils/constants';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const RegisterBusiness = () => {
    const { token, businessUser, loading } = useBusinessAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        location: '',
        description: '',
        website: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        if (!loading && !businessUser) {
            navigate('/business/login');
        }
    }, [loading, businessUser, navigate]);

    // Pre-fill email and phone if available
    useEffect(() => {
        if (businessUser) {
            setFormData(prev => ({
                ...prev,
                email: businessUser.businessEmail || prev.email,
                phone: businessUser.phone || prev.phone
            }));
        }
    }, [businessUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/business-portal/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Redirect to dashboard with explicit state/message potentially needed
                // For now, simple redirect
                navigate('/business/dashboard', { state: { message: 'Business registered successfully! Pending approval.' } });
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred during registration. Please try again.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <header className="register-header">
                    <Link to="/business/dashboard" className="text-sm text-green-600 mb-4 inline-block hover:underline">← Back to Dashboard</Link>
                    <h1>Register a New Business</h1>
                    <p>Add your business to NaijaTrust. It will be visible to users after admin approval.</p>
                </header>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="name">Business Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className="form-control"
                            placeholder="e.g. Dangote Cement"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="category">Category *</label>
                            <select
                                id="category"
                                name="category"
                                required
                                className="form-control"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select a category</option>
                                {BUSINESS_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Headquarters Location *</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                required
                                className="form-control"
                                placeholder="e.g. Victoria Island, Lagos"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Business Description</label>
                        <textarea
                            id="description"
                            name="description"
                            className="form-control"
                            placeholder="Briefly describe what your business does..."
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="website">Website (Optional)</label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                className="form-control"
                                placeholder="https://..."
                                value={formData.website}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                required
                                className="form-control"
                                placeholder="+234..."
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Public Business Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="form-control"
                            placeholder="contact@company.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <small className="helper-text">This email will be displayed on your public profile.</small>
                    </div>

                    <button type="submit" className="submit-btn" disabled={submitting}>
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <Building2 size={20} />}
                        {submitting ? 'Submitting...' : 'Register Business'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterBusiness;

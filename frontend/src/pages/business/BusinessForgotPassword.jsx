import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Mail, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import './BusinessAuth.css';

const BusinessForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            const response = await fetch(`${API_URL}/business-auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Failed to send reset email');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="business-auth-page">
            <div className="auth-wrapper">
                <div className="auth-header">
                    <div className="logo-container">
                        <Briefcase size={32} color="var(--primary-color)" />
                        <h1>Business Password Reset</h1>
                    </div>
                </div>

                <div className="auth-card">
                    {/* Reuse error styling from BusinessLogin if possible, but here using inline similar to ResetPassword for consistency */}
                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: '1px solid #fecaca'
                        }}>
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                                <CheckCircle size={48} color="#10b981" />
                            </div>
                            <h3>Check your business email</h3>
                            <p style={{ color: '#666', marginBottom: '24px' }}>
                                We have sent a password reset link to <strong>{email}</strong>.
                            </p>
                            <Link to="/business/login" className="btn btn-primary btn-full">
                                Back to Business Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label><Mail size={16} /> Business Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={18} />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="Enter your business email"
                                        required
                                        disabled={isLoading}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ width: '100%', paddingLeft: '8px' }} // inline fix since input-wrapper styling might expect input to fill
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Reset Link <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            <div className="auth-footer" style={{ marginTop: '16px', textAlign: 'center' }}>
                                <Link to="/business/login">Back to Business Login</Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessForgotPassword;

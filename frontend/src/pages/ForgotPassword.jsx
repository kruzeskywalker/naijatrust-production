import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
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
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
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
        <div className="auth-page container">
            <div className="auth-card login-card">
                <div className="auth-header">
                    <img src="/logo.png" alt="NaijaTrust" className="auth-logo" />
                    <h1>Forgot Password</h1>
                    <p>Enter your email to receive a password reset link</p>
                </div>

                {error && (
                    <div className="alert error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {success ? (
                    <div className="success-state">
                        <div className="success-icon">
                            <CheckCircle size={48} color="#10b981" />
                        </div>
                        <h3>Check your email</h3>
                        <p>We have sent a password reset link to <strong>{email}</strong>.</p>
                        <div className="form-footer">
                            <Link to="/login" className="btn btn-primary btn-full">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><Mail size={16} /> Email Address</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                disabled={isLoading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
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

                        <div className="form-footer">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;

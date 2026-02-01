import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Briefcase, ArrowRight, Lock, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './BusinessAuth.css';

const BusinessResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            const response = await fetch(`${API_URL}/business-auth/reset-password/${token}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Password reset successful! Please login.');
                navigate('/business/login');
            } else {
                setError(data.message || 'Failed to reset password');
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
                        <h1>Business Reset Password</h1>
                    </div>
                </div>

                <div className="auth-card">
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

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><Lock size={16} /> New Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: '100%', paddingLeft: '8px' }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label><Lock size={16} /> Confirm New Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ width: '100%', paddingLeft: '8px' }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    Reset Password <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BusinessResetPassword;

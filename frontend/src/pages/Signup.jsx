import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, User, Mail, Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Signup = () => {
    const { signup, initiateGoogleLogin } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const name = e.target.name.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        const result = await signup(name, email, password);
        setIsLoading(false);

        if (result.success) {
            setSuccess(result.message);
            toast.success(result.message);
            setTimeout(() => navigate('/dashboard'), 2000);
        } else {
            setError(result.message);
            toast.error(result.message);
        }
    };

    return (
        <div className="auth-page container">
            <div className="auth-card signup-card">
                <div className="auth-header">
                    <img src="/logo.png" alt="NaijaTrust" className="auth-logo" />
                    <h1>Create your account</h1>
                    <p>Help other Nigerians make better choices.</p>
                </div>

                {error && (
                    <div className="error-box" style={{
                        padding: '12px',
                        background: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#c33'
                    }}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="success-box" style={{
                        padding: '12px',
                        background: '#efe',
                        border: '1px solid #cfc',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#3a3'
                    }}>
                        <CheckCircle size={20} />
                        <span>{success}</span>
                    </div>
                )}

                <div className="social-auth-top">
                    <button
                        className="btn btn-outline social-btn google"
                        onClick={initiateGoogleLogin}
                        disabled={isLoading}
                        type="button"
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" />
                        Continue with Google
                    </button>
                </div>

                <div className="divider">
                    <span>or sign up with email</span>
                </div>

                <div className="signup-features">
                    <div className="s-feature">
                        <ShieldCheck size={20} color="var(--primary-color)" />
                        <span>Write reviews and help others</span>
                    </div>
                    <div className="s-feature">
                        <ShieldCheck size={20} color="var(--primary-color)" />
                        <span>Build trust in Nigerian businesses</span>
                    </div>
                </div>

                <form className="auth-form" onSubmit={handleSignup}>
                    <div className="form-group">
                        <label><User size={16} /> Full Name</label>
                        <input name="name" type="text" placeholder="John Doe" required disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label><Mail size={16} /> Email Address</label>
                        <input name="email" type="email" placeholder="email@example.com" required disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label><Lock size={16} /> Password</label>
                        <div className="password-input-wrapper">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                required
                                minLength="6"
                                disabled={isLoading}
                                style={{ paddingLeft: '1rem' }}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label><Lock size={16} /> Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                required
                                minLength="6"
                                disabled={isLoading}
                                style={{ paddingLeft: '1rem' }}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex="-1"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <p className="terms-text">
                        By signing up, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
                    </p>
                    <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Get Started <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer-link">
                    Already have an account? <Link to="/login" className="toggle-btn">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;

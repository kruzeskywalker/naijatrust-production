import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
    const { login, initiateGoogleLogin } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const email = e.target.email.value;
        const password = e.target.password.value;

        const result = await login(email, password);

        setIsLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="auth-page container">
            <div className="auth-card login-card">
                <div className="auth-header">
                    <img src="/logo.png" alt="NaijaTrust" className="auth-logo" />
                    <h1>Log in</h1>
                    <p>New to NaijaTrust? <Link to="/signup" className="toggle-btn">Sign up</Link></p>
                </div>

                {error && (
                    <div style={{
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
                    <span>or log in with email</span>
                </div>

                <form className="auth-form" onSubmit={handleEmailLogin}>
                    <div className="form-group">
                        <label><Mail size={16} /> Email Address</label>
                        <input name="email" type="email" placeholder="Enter your email" required disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label><Lock size={16} /> Password</label>
                        <div className="password-input-wrapper">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
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
                    <div className="form-footer">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>
                    <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Logging in...
                            </>
                        ) : (
                            <>
                                Log in <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

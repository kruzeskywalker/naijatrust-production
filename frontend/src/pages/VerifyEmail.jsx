import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const VerifyEmail = () => {
    const { verifyEmail } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            // Extract token from URL query parameters
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (!token) {
                setError('No verification token provided');
                setVerifying(false);
                return;
            }

            // Call verification API
            const result = await verifyEmail(token);

            setVerifying(false);

            if (result.success) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(result.message);
            }
        };

        verifyToken();
    }, [location, verifyEmail, navigate]);

    return (
        <div className="auth-page container">
            <div className="auth-card">
                {verifying ? (
                    <div className="verify-status">
                        <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
                        <h2>Verifying your email...</h2>
                        <p>Please wait while we confirm your account.</p>
                    </div>
                ) : success ? (
                    <div className="verify-status">
                        <CheckCircle size={64} color="var(--primary-color)" />
                        <h2>Email Verified!</h2>
                        <p>Your account is now fully active. You can now write reviews and manage your profile.</p>
                        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                            Redirecting to login page...
                        </p>
                        <button className="btn btn-primary" onClick={() => navigate('/login')}>
                            Go to Login
                        </button>
                    </div>
                ) : (
                    <div className="verify-status">
                        <XCircle size={64} color="#e74c3c" />
                        <h2>Verification Failed</h2>
                        <p style={{ color: '#e74c3c' }}>{error}</p>
                        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                            The verification link may have expired or is invalid.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <Link to="/login" className="btn btn-outline">
                                Go to Login
                            </Link>
                            <Link to="/signup" className="btn btn-primary">
                                Sign Up Again
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;

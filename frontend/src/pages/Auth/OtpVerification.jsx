import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '../../utils/urlUtils';
import { ShieldCheck, Mail, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import '../Auth.css'; // Import shared Auth styles

const OtpVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('user'); // 'user' or 'business'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(60);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get('email');
        const typeParam = params.get('type');

        if (emailParam) setEmail(emailParam);
        if (typeParam) setUserType(typeParam);

        if (!emailParam) {
            setError('Email address is missing. Please sign up again.');
        }
    }, [location]);

    useEffect(() => {
        let timer;
        if (countdown > 0 && resendDisabled) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setResendDisabled(false);
            setCountdown(60);
        }
        return () => clearInterval(timer);
    }, [countdown, resendDisabled]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text');
        if (!/^\d+$/.test(data)) return;

        const otpArray = data.slice(0, 6).split('');
        const newOtp = [...otp];
        otpArray.forEach((value, index) => {
            if (index < 6) newOtp[index] = value;
        });
        setOtp(newOtp);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const API_URL = getApiBaseUrl(import.meta.env.VITE_API_URL);
            const endpoint = userType === 'business'
                ? `${API_URL}/business-auth/verify-otp`
                : `${API_URL}/auth/verify-otp`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp: otpValue }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                if (userType === 'business') {
                    localStorage.setItem('businessToken', data.data.token);
                } else {
                    localStorage.setItem('naijaTrustToken', data.token);
                }

                setMessage('Verification successful! Redirecting...');

                setTimeout(() => {
                    if (userType === 'business') {
                        window.location.href = '/business/dashboard';
                    } else {
                        window.location.href = '/dashboard';
                    }
                }, 1000);
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const API_URL = getApiBaseUrl(import.meta.env.VITE_API_URL);
            const endpoint = userType === 'business'
                ? `${API_URL}/business-auth/resend-otp`
                : `${API_URL}/auth/resend-otp`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setMessage('New code sent to your email.');
                setResendDisabled(true);
            } else {
                setError(data.message || 'Failed to resend code');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page container">
            <div className="auth-card" style={{ maxWidth: '440px' }}>
                <div className="auth-header">
                    <div className="icon-circle">
                        <ShieldCheck size={40} color="var(--primary-color)" />
                    </div>
                    <h1>Verify Your Email</h1>
                    <p>
                        We've sent a 6-digit verification code to <br />
                        <strong>{email}</strong>
                    </p>
                </div>

                {error && (
                    <div className="error-box">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className="success-box">
                        <CheckCircle size={20} />
                        <span>{message}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleVerify}>
                    <div className="form-group">
                        <label style={{ justifyContent: 'center', marginBottom: '1rem' }}>Enter Verification Code</label>
                        <div className="otp-container">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    value={data}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    onFocus={(e) => e.target.select()}
                                    className="otp-input"
                                    disabled={loading}
                                />
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify Email <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer-link" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                    <p style={{ marginBottom: '1rem' }}>Didn't receive the code?</p>
                    <button
                        onClick={handleResend}
                        disabled={resendDisabled || loading}
                        className="btn btn-outline"
                        style={{
                            border: 'none',
                            background: 'transparent',
                            color: resendDisabled ? '#a0aec0' : 'var(--primary-color)',
                            fontWeight: '600',
                            cursor: resendDisabled ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {resendDisabled ? (
                            `Resend in ${countdown}s`
                        ) : (
                            <>
                                <Mail size={16} /> Resend Code
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;

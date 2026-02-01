import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import './BusinessAuth.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/business-auth/verify-email/${token}`);
                const data = await response.json();

                if (data.status === 'success') {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An error occurred. Please try again.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="business-auth-page">
            <div className="auth-card success-card">
                {status === 'verifying' && (
                    <>
                        <Loader2 size={64} className="animate-spin" color="var(--primary-color)" />
                        <h2>Verifying Email...</h2>
                        <p>Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle size={64} color="var(--primary-color)" />
                        <h2>Email Verified!</h2>
                        <p>Thank you for verifying your email address. You can now access the business portal.</p>
                        <Link to="/business/login" className="btn btn-primary btn-full">
                            Login into Business Portal <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle size={64} color="#e53e3e" />
                        <h2>Verification Failed</h2>
                        <p>{message}</p>
                        <Link to="/business/signup" className="btn btn-outline btn-full">
                            Back to Signup
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmailVerification;

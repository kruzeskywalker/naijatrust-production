import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import toast from 'react-hot-toast';
import './PaymentCallback.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001/api' : 'https://naijatrust-production-api.onrender.com/api');

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { token } = useBusinessAuth();
    const [status, setStatus] = useState('verifying'); // verifying, success, failed, error
    const [message, setMessage] = useState('Verifying your payment...');
    const [details, setDetails] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const reference = searchParams.get('reference') || searchParams.get('trxref');

            if (!reference) {
                setStatus('error');
                setMessage('No payment reference found. Please contact support.');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/payments/verify/${reference}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                    setMessage(data.data.alreadyProcessed
                        ? 'This payment has already been processed.'
                        : 'Payment successful! Your subscription has been upgraded.');
                    setDetails(data.data);

                    if (!data.data.alreadyProcessed) {
                        toast.success('Payment verified! Your tier has been upgraded.');
                    }
                } else {
                    setStatus('failed');
                    setMessage(data.message || 'Payment verification failed. Please contact support.');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setMessage('An error occurred while verifying your payment. Please contact support if your payment was deducted.');
            }
        };

        if (token) {
            verifyPayment();
        }
    }, [searchParams, token]);

    const handleContinue = () => {
        navigate('/business/dashboard');
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'verifying':
                return <Loader2 className="status-icon verifying" size={64} />;
            case 'success':
                return <CheckCircle className="status-icon success" size={64} />;
            case 'failed':
                return <XCircle className="status-icon failed" size={64} />;
            case 'error':
                return <AlertCircle className="status-icon error" size={64} />;
            default:
                return null;
        }
    };

    return (
        <div className="payment-callback-container">
            <div className="payment-callback-card">
                {getStatusIcon()}

                <h1 className={`status-title ${status}`}>
                    {status === 'verifying' && 'Verifying Payment'}
                    {status === 'success' && 'Payment Successful!'}
                    {status === 'failed' && 'Payment Failed'}
                    {status === 'error' && 'Error'}
                </h1>

                <p className="status-message">{message}</p>

                {details?.business && (
                    <div className="upgrade-details">
                        <p><strong>Business:</strong> {details.business.name}</p>
                        <p><strong>New Tier:</strong> <span className="tier-badge">{details.business.subscriptionTier}</span></p>
                    </div>
                )}

                {status !== 'verifying' && (
                    <button className="btn btn-primary" onClick={handleContinue}>
                        Go to Dashboard
                    </button>
                )}

                {(status === 'failed' || status === 'error') && (
                    <p className="support-note">
                        If you believe this is an error, please contact support at{' '}
                        <a href="mailto:support@naijatrust.ng">support@naijatrust.ng</a>
                    </p>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;

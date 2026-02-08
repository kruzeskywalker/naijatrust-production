import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import './UpgradeRequestStatus.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const UpgradeRequestStatus = ({ businessId }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [requestToCancel, setRequestToCancel] = useState(null);

    useEffect(() => {
        if (businessId) {
            fetchRequests();
        }
    }, [businessId]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('businessToken');
            const response = await fetch(
                `${API_BASE_URL}/subscriptions/my-upgrade-requests?businessId=${businessId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();
            if (data.success) {
                setRequests(data.data.requests);
            }
        } catch (error) {
            console.error('Error fetching upgrade requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (requestId) => {
        setRequestToCancel(requestId);
        setShowConfirmModal(true);
    };

    const confirmCancellation = async () => {
        if (!requestToCancel) return;

        try {
            const token = localStorage.getItem('businessToken');
            const response = await fetch(`${API_BASE_URL}/subscriptions/cancel-upgrade-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ requestId: requestToCancel })
            });

            const data = await response.json();
            if (data.success) {
                fetchRequests(); // Refresh list
            }
        } catch (error) {
            console.error('Error cancelling request:', error);
        } finally {
            setShowConfirmModal(false);
            setRequestToCancel(null);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock size={16} className="status-icon pending" />;
            case 'approved':
                return <CheckCircle size={16} className="status-icon approved" />;
            case 'rejected':
                return <XCircle size={16} className="status-icon rejected" />;
            case 'cancelled':
                return <AlertCircle size={16} className="status-icon cancelled" />;
            default:
                return null;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return null;
    }

    if (requests.length === 0) {
        return null;
    }

    // Show only recent requests (last 5)
    const recentRequests = requests.slice(0, 5);

    return (
        <div className="upgrade-requests-section">
            <h3>Upgrade Requests</h3>
            <div className="requests-list">
                {recentRequests.map(request => (
                    <div key={request._id} className={`request-item status-${request.status}`}>
                        <div className="request-header">
                            <div className="request-info">
                                {getStatusIcon(request.status)}
                                <div>
                                    <strong>{request.currentTier} → {request.requestedTier}</strong>
                                    <span className="request-date">{formatDate(request.createdAt)}</span>
                                </div>
                            </div>
                            {request.status === 'pending' && (
                                <button
                                    className="cancel-btn"
                                    onClick={() => handleCancelClick(request._id)}
                                    title="Cancel request"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <div className="request-details">
                            <span className={`status-badge ${request.status}`}>
                                {request.status}
                            </span>
                            <span className="request-type">{request.requestType}</span>
                        </div>

                        {request.status === 'rejected' && request.rejectionReason && (
                            <div className="rejection-reason">
                                <strong>Reason:</strong> {request.rejectionReason}
                            </div>
                        )}

                        {request.status === 'approved' && request.reviewedAt && (
                            <div className="approval-info">
                                Approved on {formatDate(request.reviewedAt)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content confirm-modal">
                        <div className="modal-header">
                            <h4>Cancel Request?</h4>
                            <button className="close-btn" onClick={() => setShowConfirmModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to cancel this upgrade request?</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                No, Keep
                            </button>
                            <button
                                className="btn-danger"
                                onClick={confirmCancellation}
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpgradeRequestStatus;

import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import './TierRequestCard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const TierRequestCard = ({ request, onUpdate }) => {
    const [expanded, setExpanded] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleApprove = async () => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/admin/tier-requests/${request._id}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adminNotes })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Tier upgrade approved successfully!');
                setShowApproveModal(false);
                onUpdate && onUpdate();
            } else {
                toast.error(data.message || 'Failed to approve request');
            }
        } catch (error) {
            console.error('Error approving request:', error);
            toast.error('Failed to approve request');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/admin/tier-requests/${request._id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rejectionReason, adminNotes })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Request rejected');
                setShowRejectModal(false);
                onUpdate && onUpdate();
            } else {
                toast.error(data.message || 'Failed to reject request');
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error('Failed to reject request');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock size={18} className="status-icon pending" />;
            case 'approved':
                return <CheckCircle size={18} className="status-icon approved" />;
            case 'rejected':
                return <XCircle size={18} className="status-icon rejected" />;
            default:
                return <AlertCircle size={18} className="status-icon" />;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div className={`tier-request-card status-${request.status}`}>
                <div className="request-header" onClick={() => setExpanded(!expanded)}>
                    <div className="request-main-info">
                        {getStatusIcon(request.status)}
                        <div className="business-info">
                            <h3>{request.business?.name || 'Unknown Business'}</h3>
                            <div className="tier-change">
                                <span className="tier-badge current">{request.currentTier}</span>
                                <span className="arrow">→</span>
                                <span className="tier-badge requested">{request.requestedTier}</span>
                            </div>
                        </div>
                    </div>
                    <div className="request-meta">
                        <span className={`status-badge ${request.status}`}>{request.status}</span>
                        <button className="expand-btn">
                            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                </div>

                {expanded && (
                    <div className="request-details">
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Business User</label>
                                <span>{request.businessUser?.name || 'N/A'}</span>
                                <span className="detail-sub">{request.businessUser?.email}</span>
                            </div>
                            <div className="detail-item">
                                <label>Request Type</label>
                                <span className="capitalize">{request.requestType}</span>
                            </div>
                            <div className="detail-item">
                                <label>Submitted</label>
                                <span>{formatDate(request.createdAt)}</span>
                            </div>
                            {request.paymentStatus !== 'none' && (
                                <div className="detail-item">
                                    <label>Payment Status</label>
                                    <span className={`payment-status ${request.paymentStatus}`}>
                                        {request.paymentStatus}
                                    </span>
                                </div>
                            )}
                        </div>

                        {request.businessNotes && (
                            <div className="notes-section">
                                <label>Business Notes</label>
                                <p>{request.businessNotes}</p>
                            </div>
                        )}

                        {request.status === 'approved' && request.reviewedBy && (
                            <div className="review-info approved">
                                <CheckCircle size={16} />
                                <span>Approved by {request.reviewedBy.name} on {formatDate(request.reviewedAt)}</span>
                            </div>
                        )}

                        {request.status === 'rejected' && (
                            <div className="review-info rejected">
                                <XCircle size={16} />
                                <div>
                                    <strong>Rejected: {request.rejectionReason}</strong>
                                    {request.reviewedBy && (
                                        <span>By {request.reviewedBy.name} on {formatDate(request.reviewedAt)}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {request.status === 'pending' && (
                            <div className="action-buttons">
                                <button
                                    className="btn-approve"
                                    onClick={() => setShowApproveModal(true)}
                                >
                                    <CheckCircle size={16} />
                                    Approve
                                </button>
                                <button
                                    className="btn-reject"
                                    onClick={() => setShowRejectModal(true)}
                                >
                                    <XCircle size={16} />
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Approve Tier Upgrade</h3>
                        <p>Approve upgrade for <strong>{request.business?.name}</strong> from <strong>{request.currentTier}</strong> to <strong>{request.requestedTier}</strong>?</p>

                        <div className="form-group">
                            <label>Admin Notes (Optional)</label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any notes about this approval..."
                                rows={3}
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowApproveModal(false)}
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-approve"
                                onClick={handleApprove}
                                disabled={processing}
                            >
                                {processing ? 'Approving...' : 'Approve'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Reject Tier Upgrade</h3>
                        <p>Reject upgrade request for <strong>{request.business?.name}</strong>?</p>

                        <div className="form-group">
                            <label>Rejection Reason *</label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Provide a reason for rejection..."
                                rows={3}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Admin Notes (Optional)</label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Internal notes..."
                                rows={2}
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowRejectModal(false)}
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-reject"
                                onClick={handleReject}
                                disabled={processing}
                            >
                                {processing ? 'Rejecting...' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TierRequestCard;

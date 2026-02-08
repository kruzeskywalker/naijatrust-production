import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Loader2, AlertCircle, CheckCircle, XCircle, User, Calendar, MessageSquare } from 'lucide-react';
import './AdminAccountDeletions.css';

const AdminAccountDeletions = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // ID of user being processed
    const [successMsg, setSuccessMsg] = useState('');

    const API_BASE = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';
    const { token } = useAdminAuth();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/admin/deletion-requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setRequests(data.data.requests);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch deletion requests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (userId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this deletion request?`)) return;

        setActionLoading(userId);
        try {
            const response = await fetch(`${API_BASE}/admin/deletion-requests/${userId}/${action}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setSuccessMsg(`Request ${action}ed successfully`);
                setRequests(prev => prev.filter(r => r._id !== userId));
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert(`Failed to ${action} request`);
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) return (
        <div className="admin-page-loading">
            <Loader2 className="animate-spin" size={40} />
            <p>Loading deletion requests...</p>
        </div>
    );

    return (
        <div className="admin-account-deletions">
            <header className="admin-page-header">
                <div>
                    <h1>Account Deletion Requests</h1>
                    <p>Manage and approve business account deletion requests.</p>
                </div>
            </header>

            {successMsg && (
                <div className="admin-alert success">
                    <CheckCircle size={18} /> {successMsg}
                </div>
            )}

            {error && (
                <div className="admin-alert error">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div className="requests-grid">
                {requests.length === 0 ? (
                    <div className="empty-state">
                        <User size={48} />
                        <h3>No pending requests</h3>
                        <p>All clear! There are no business account deletion requests at the moment.</p>
                    </div>
                ) : (
                    requests.map(request => (
                        <div key={request._id} className="request-card">
                            <div className="card-top">
                                <div className="user-info">
                                    <div className="user-avatar-placeholder">
                                        {request.name[0]}
                                    </div>
                                    <div>
                                        <h3>{request.name}</h3>
                                        <p className="email">{request.email}</p>
                                    </div>
                                </div>
                                <div className="request-date">
                                    <Calendar size={14} />
                                    {new Date(request.deletionRequest.requestedAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="detail-item">
                                    <label>Company</label>
                                    <p>{request.companyName || 'N/A'}</p>
                                </div>
                                <div className="detail-item">
                                    <label><MessageSquare size={14} /> Reason for Deletion</label>
                                    <div className="reason-box">
                                        {request.deletionRequest.reason}
                                    </div>
                                </div>
                                <div className="business-count">
                                    <strong>{request.claimedBusinesses?.length || 0}</strong> Businesses will be unclaimed
                                </div>
                            </div>

                            <div className="card-footer">
                                <button
                                    className="btn-approve"
                                    onClick={() => handleAction(request._id, 'approve')}
                                    disabled={actionLoading === request._id}
                                >
                                    {actionLoading === request._id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                    Approve & Delete
                                </button>
                                <button
                                    className="btn-reject"
                                    onClick={() => handleAction(request._id, 'reject')}
                                    disabled={actionLoading === request._id}
                                >
                                    {actionLoading === request._id ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminAccountDeletions;

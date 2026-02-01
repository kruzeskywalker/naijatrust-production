import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { FileText, Check, X, Shield, Search, ExternalLink, Loader2 } from 'lucide-react';
import './ClaimRequests.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const ClaimRequests = () => {
    const { token, loading } = useAdminAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialId = searchParams.get('id');
    const initialStatus = searchParams.get('status') || 'pending';

    const [claims, setClaims] = useState([]);
    const [filter, setFilter] = useState(initialStatus);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [modalAction, setModalAction] = useState(null); // 'approve' | 'reject' | null
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!loading && !token) {
            navigate('/admin/login');
        }
    }, [loading, token, navigate]);

    useEffect(() => {
        if (token) {
            fetchClaims();
        }
    }, [token, filter]);

    const fetchClaims = async () => {
        setIsLoadingData(true);
        try {
            const statusQuery = filter === 'all' ? '' : `?status=${filter}`;
            const response = await fetch(`${API_BASE_URL}/admin/claim-requests${statusQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setClaims(data.data.claims);

                // If ID in URL, open it
                if (initialId) {
                    const linkedClaim = data.data.claims.find(c => c._id === initialId);
                    if (linkedClaim) setSelectedClaim(linkedClaim);
                }
            }
        } catch (error) {
            console.error('Error fetching claims:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleAction = async () => {
        if (!modalAction || !selectedClaim) return;
        setProcessing(true);

        const endpoint = modalAction === 'approve'
            ? `${API_BASE_URL}/admin/claim-requests/${selectedClaim._id}/approve`
            : `${API_BASE_URL}/admin/claim-requests/${selectedClaim._id}/reject`;

        const body = modalAction === 'approve'
            ? { adminNotes: notes }
            : { rejectionReason: notes, adminNotes: notes };

        if (modalAction === 'reject' && !notes.trim()) {
            alert('Please provide a reason for rejection.');
            setProcessing(false);
            return;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (data.status === 'success') {
                // Refresh list
                fetchClaims();
                setSelectedClaim(null);
                setModalAction(null);
                setNotes('');
            } else {
                alert(data.message || 'Action failed');
            }
        } catch (error) {
            console.error('Action error:', error);
            alert('An error occurred');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="admin-layout">
            <AdminHeader />

            <main className="admin-container">
                <div className="claims-header">
                    <h1>Claim Requests</h1>
                    <div className="filter-tabs">
                        <button
                            className={`tab ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`tab ${filter === 'approved' ? 'active' : ''}`}
                            onClick={() => setFilter('approved')}
                        >
                            Approved
                        </button>
                        <button
                            className={`tab ${filter === 'rejected' ? 'active' : ''}`}
                            onClick={() => setFilter('rejected')}
                        >
                            Rejected
                        </button>
                        <button
                            className={`tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                    </div>
                </div>

                {isLoadingData ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={32} />
                        <p>Loading requests...</p>
                    </div>
                ) : claims.length > 0 ? (
                    <div className="claims-table-container">
                        <table className="claims-table">
                            <thead>
                                <tr>
                                    <th>Business</th>
                                    <th>User / Requester</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {claims.map(claim => (
                                    <tr key={claim._id} onClick={() => setSelectedClaim(claim)} className="clickable-row">
                                        <td>
                                            <div className="biz-cell">
                                                <strong>{claim.business?.name}</strong>
                                                <a
                                                    href={claim.business?.website}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    className="site-link"
                                                >
                                                    <ExternalLink size={12} />
                                                </a>
                                            </div>
                                            <span className="location-sub">{claim.business?.location}</span>
                                        </td>
                                        <td>
                                            <div className="user-cell">
                                                <strong>{claim.user?.name}</strong>
                                                <span className="email-sub">{claim.businessEmail || claim.user?.email}</span>
                                                <span className="position-sub">{claim.position}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {claim.additionalInfo === 'New Business Registration'
                                                ? <span className="badge new-reg">New Registration</span>
                                                : <span className="badge claim">Claim Request</span>
                                            }
                                        </td>
                                        <td>{new Date(claim.submittedAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-pill ${claim.status}`}>{claim.status}</span>
                                        </td>
                                        <td>
                                            <button className="review-btn" onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedClaim(claim);
                                            }}>
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <Shield size={48} />
                        <h3>No requests found</h3>
                        <p>There are no claim requests matching this filter.</p>
                    </div>
                )}
            </main>

            {/* Detail Modal */}
            {selectedClaim && (
                <div className="modal-overlay" onClick={() => !processing && setSelectedClaim(null)}>
                    <div className="request-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Request Details</h2>
                            <button className="close-btn" onClick={() => setSelectedClaim(null)} disabled={processing}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>Business Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Name</label>
                                        <p>{selectedClaim.business?.name}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Category</label>
                                        <p>{selectedClaim.business?.category}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Location</label>
                                        <p>{selectedClaim.business?.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Requester Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Full Name</label>
                                        <p>{selectedClaim.user?.name}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>User Email</label>
                                        <p>{selectedClaim.user?.email}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Business Email</label>
                                        <p>{selectedClaim.businessEmail}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Position</label>
                                        <p>{selectedClaim.position}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedClaim.documents && selectedClaim.documents.length > 0 && (
                                <div className="detail-section">
                                    <h3>Submitted Documents/Proof</h3>
                                    <div className="documents-box">
                                        {/* For MVP these are likely descriptions or links if we supported uploads */}
                                        <p>{JSON.stringify(selectedClaim.documents)}</p>
                                    </div>
                                </div>
                            )}

                            <div className="detail-section">
                                <h3>Notes / Justification</h3>
                                <p className="notes-box">{selectedClaim.additionalInfo || 'No justification provided.'}</p>
                            </div>

                            {/* Action Area */}
                            {selectedClaim.status === 'pending' && (
                                <div className="action-area">
                                    {!modalAction ? (
                                        <div className="primary-actions">
                                            <button
                                                className="btn-reject"
                                                onClick={() => setModalAction('reject')}
                                            >
                                                <X size={18} /> Reject Request
                                            </button>
                                            <button
                                                className="btn-approve"
                                                onClick={() => setModalAction('approve')}
                                            >
                                                <Check size={18} /> Approve & Verify
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="confirmation-box">
                                            <h4>{modalAction === 'approve' ? 'Approve Request' : 'Reject Request'}</h4>
                                            <textarea
                                                className="notes-input"
                                                placeholder={modalAction === 'approve' ? "Optional admin notes..." : "Reason for rejection (Required)..."}
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                                autoFocus
                                            ></textarea>
                                            <div className="confirm-actions">
                                                <button
                                                    onClick={() => {
                                                        setModalAction(null);
                                                        setNotes('');
                                                    }}
                                                    className="btn-cancel"
                                                    disabled={processing}
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    onClick={handleAction}
                                                    className={`btn-confirm ${modalAction}`}
                                                    disabled={processing}
                                                >
                                                    {processing ? <Loader2 className="animate-spin" size={18} /> : 'Confirm'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedClaim.status !== 'pending' && (
                                <div className="final-status-bar">
                                    <p>
                                        Request was <strong>{selectedClaim.status}</strong> on {new Date(selectedClaim.reviewedAt).toLocaleDateString()}.
                                    </p>
                                    {selectedClaim.adminNotes && <p className="admin-note">Note: {selectedClaim.adminNotes}</p>}
                                    {selectedClaim.rejectionReason && <p className="rejection-note">Reason: {selectedClaim.rejectionReason}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimRequests;

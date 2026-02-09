import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { FileText, Check, X, Shield, Search, ExternalLink, Loader2, Activity } from 'lucide-react';
import './ClaimRequests.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5001/api'
        : 'https://naijatrust-production-api.onrender.com/api');

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
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [diagnosticsData, setDiagnosticsData] = useState(null);
    const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);
    const [customApiUrl, setCustomApiUrl] = useState(API_BASE_URL);

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

    const handleRunDiagnostics = async () => {
        setLoadingDiagnostics(true);
        setShowDiagnostics(true);
        // Use custom URL if provided, ensuring no trailing slash
        const baseUrl = (customApiUrl || API_BASE_URL).replace(/\/$/, '');
        // Ideally should check for /api suffix or add it if missing, but let's assume user inputs base including /api or we strip and add
        // Current logic: API_BASE_URL includes /api. 
        // If user inputs 'https://app.com', we might need /api. 
        // Let's assume user inputs the FULL base path up to /api (e.g. .../api)
        // Or we can try to be smart.

        const endpoint = `${baseUrl}/admin/diagnostics/claims`;

        try {
            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setDiagnosticsData(data.data);
            } else {
                toast.error('Diagnostics failed');
                setDiagnosticsData({ error: data.message, status: response.status });
            }
        } catch (error) {
            console.error('Diagnostics error:', error);
            setDiagnosticsData({ error: error.message, status: 'Client Error' });
        } finally {
            setLoadingDiagnostics(false);
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
            toast.error('Please provide a reason for rejection.');
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
                toast.success(`Request ${modalAction === 'approve' ? 'approved' : 'rejected'} successfully`);
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch (error) {
            console.error('Action error:', error);
            toast.error('An error occurred');
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
                    <button className="btn-diagnostics" onClick={handleRunDiagnostics} style={{
                        marginLeft: 'auto',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#4b5563',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}>
                        <Activity size={16} /> Run Diagnostics
                    </button>
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
                                                <Check size={18} /> Approve Claim
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
            {showDiagnostics && (
                <div className="modal-overlay" onClick={() => setShowDiagnostics(false)}>
                    <div className="request-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
                        <div className="modal-header">
                            <h2>System Diagnostics</h2>
                            <button className="close-btn" onClick={() => setShowDiagnostics(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingDiagnostics ? (
                                <div className="loading-state">
                                    <Loader2 className="animate-spin" size={32} />
                                    <p>Running diagnostics...</p>
                                </div>
                            ) : diagnosticsData ? (
                                diagnosticsData.error ? (
                                    <div className="error-state" style={{ padding: '20px', color: '#ef4444', textAlign: 'center' }}>
                                        <p><strong>Diagnostics Failed</strong></p>
                                        <p>{diagnosticsData.error.toString()}</p>
                                        <div style={{ marginTop: '15px', padding: '10px', background: '#fee2e2', borderRadius: '4px', fontSize: '12px', textAlign: 'left', overflowWrap: 'break-word' }}>
                                            <p><strong>Debug Info:</strong></p>
                                            <p>URL: {`${customApiUrl}/admin/diagnostics/claims`}</p>
                                            <p>Token Length: {token ? token.length : 'None'}</p>
                                            <p>Status: {diagnosticsData.status || 'Client Error'}</p>

                                            <div style={{ marginTop: '10px' }}>
                                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Override Backend URL:</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        type="text"
                                                        value={customApiUrl}
                                                        onChange={(e) => setCustomApiUrl(e.target.value)}
                                                        placeholder="https://your-backend.onrender.com/api"
                                                        style={{ flex: 1, padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                                                    />
                                                    <button
                                                        onClick={handleRunDiagnostics}
                                                        style={{ padding: '4px 8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        Retry
                                                    </button>
                                                </div>
                                                <p style={{ marginTop: '4px', fontSize: '11px', color: '#666' }}>
                                                    Hint: Try <code>https://naijatrust-production-api.onrender.com/api</code>
                                                </p>
                                            </div>
                                        </div>
                                        {diagnosticsData.error.includes('Unexpected token') && <p style={{ fontSize: '12px', marginTop: '8px' }}>The backend endpoint might not be ready yet (404). Please wait a moment and try again.</p>}
                                    </div>
                                ) : (
                                    <div className="diagnostics-content">
                                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                                            <div className="stat-card" style={{ background: '#f3f4f6', padding: '10px', borderRadius: '8px' }}>
                                                <h4>Total Claims</h4>
                                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{diagnosticsData.counts?.totalClaims}</p>
                                            </div>
                                            <div className="stat-card" style={{ background: '#f3f4f6', padding: '10px', borderRadius: '8px' }}>
                                                <h4>Pending Claims</h4>
                                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{diagnosticsData.counts?.pendingClaims}</p>
                                            </div>
                                            <div className="stat-card" style={{ background: '#f3f4f6', padding: '10px', borderRadius: '8px' }}>
                                                <h4>Pending Biz</h4>
                                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{diagnosticsData.counts?.pendingBusinesses}</p>
                                            </div>
                                            <div className="stat-card" style={{ background: '#f3f4f6', padding: '10px', borderRadius: '8px' }}>
                                                <h4>Total Biz</h4>
                                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{diagnosticsData.counts?.totalBusinesses}</p>
                                            </div>
                                        </div>

                                        <h3>Raw Data (Last 20 Claims)</h3>
                                        <pre style={{
                                            background: '#1f2937',
                                            color: '#10b981',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            overflowX: 'auto',
                                            maxHeight: '400px',
                                            fontSize: '12px'
                                        }}>
                                            {JSON.stringify(diagnosticsData.recentClaims, null, 2)}
                                        </pre>
                                    </div>
                                )) : (
                                <p>No data</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimRequests;

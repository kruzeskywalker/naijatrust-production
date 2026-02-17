import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import { Loader2, Trash2, Eye, EyeOff, Search, Star, MessageSquare, X, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { getImageUrl } from '../../utils/urlUtils';
import './ManageReviews.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001/api' : 'https://naijatrust-production-api.onrender.com/api');

const ManageReviews = () => {
    const { token } = useAdminAuth();
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState('all'); // all, hidden, visible, disputed
    const [searchTerm, setSearchTerm] = useState('');

    // Password Confirmation State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [pendingAction, setPendingAction] = useState(null); // { type: 'hide'|'delete'|'accept_dispute'|'reject_dispute', review: object }
    const [confirmError, setConfirmError] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    useEffect(() => {
        filterReviews();
    }, [reviews, filter, searchTerm]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/reviews`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setReviews(data.data.reviews);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterReviews = () => {
        let result = [...reviews];

        // Status Filter
        if (filter === 'hidden') result = result.filter(r => r.isHidden);
        if (filter === 'visible') result = result.filter(r => !r.isHidden);
        if (filter === 'disputed') result = result.filter(r => r.disputeStatus === 'pending');

        // Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(r =>
                r.business?.name?.toLowerCase().includes(lowerTerm) ||
                r.user?.name?.toLowerCase().includes(lowerTerm) ||
                r.content?.toLowerCase().includes(lowerTerm)
            );
        }

        setFilteredReviews(result);
    };

    // Prompt for action requiring password
    const initiateAction = (type, review) => {
        setPendingAction({ type, review });
        setAdminPassword('');
        setConfirmError('');
        setShowPasswordModal(true);
    };

    const handleConfirmAction = async (e) => {
        e.preventDefault();
        if (!pendingAction) return;

        const { type, review } = pendingAction;
        setActionLoading(review._id);
        setConfirmError('');

        try {
            let url, method, body;

            if (type === 'accept_dispute' || type === 'reject_dispute') {
                url = `${API_BASE_URL}/admin/reviews/${review._id}/dispute-decision`;
                method = 'PUT';
                body = JSON.stringify({
                    decision: type === 'accept_dispute' ? 'accepted' : 'rejected',
                    password: adminPassword
                });
            } else {
                url = type === 'hide'
                    ? `${API_BASE_URL}/admin/reviews/${review._id}/hide`
                    : `${API_BASE_URL}/admin/reviews/${review._id}`;
                method = type === 'hide' ? 'PUT' : 'DELETE';
                body = type === 'hide'
                    ? JSON.stringify({ isHidden: !review.isHidden, password: adminPassword })
                    : JSON.stringify({ password: adminPassword });
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body
            });

            const data = await response.json();

            if (response.ok) {
                if (type === 'hide') {
                    setReviews(reviews.map(r => r._id === review._id ? { ...r, isHidden: !r.isHidden } : r));
                    toast.success(`Review ${!review.isHidden ? 'hidden' : 'visible'} successfully`);
                } else if (type === 'delete' || type === 'accept_dispute') {
                    setReviews(reviews.filter(r => r._id !== review._id));
                    toast.success('Review deleted permanently');
                } else if (type === 'reject_dispute') {
                    setReviews(reviews.map(r => r._id === review._id ? { ...r, disputeStatus: 'rejected' } : r));
                    toast.success('Dispute rejected');
                }
                setShowPasswordModal(false);
            } else {
                setConfirmError(data.message || 'Action failed');
                toast.error(data.message || 'Action failed');
            }
        } catch (error) {
            console.error('Action error:', error);
            setConfirmError('Network error occurred');
            toast.error('Network error occurred');
        } finally {
            setActionLoading(null);
        }
    };

    const getRatingClass = (rating) => {
        if (rating >= 4) return 'rating-high';
        if (rating >= 3) return 'rating-mid';
        return 'rating-low';
    };

    return (
        <div className="admin-layout">
            <AdminHeader />

            <main className="admin-container">
                <div className="page-header">
                    <div>
                        <Link to="/admin/dashboard" className="back-link-admin">
                            <ArrowLeft size={20} /> Back to Dashboard
                        </Link>
                        <h1>Manage Reviews</h1>
                        <p>Moderate user content from across the platform</p>
                    </div>
                </div>

                <div className="reviews-controls">
                    <div className="reviews-search">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by business, user, or content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="reviews-filters">
                        <button
                            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Reviews
                        </button>
                        <button
                            className={`filter-tab ${filter === 'visible' ? 'active' : ''}`}
                            onClick={() => setFilter('visible')}
                        >
                            Visible
                        </button>
                        <button
                            className={`filter-tab ${filter === 'hidden' ? 'active' : ''}`}
                            onClick={() => setFilter('hidden')}
                        >
                            Hidden
                        </button>
                        <button
                            className={`filter-tab ${filter === 'disputed' ? 'active' : ''}`}
                            onClick={() => setFilter('disputed')}
                        >
                            Disputed Requests
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={32} />
                        <p>Loading reviews...</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Business</th>
                                    <th>User</th>
                                    <th>Rating</th>
                                    <th>Content</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReviews.map(review => (
                                    <tr key={review._id} className={review.isHidden ? 'bg-gray-50' : ''}>
                                        <td>
                                            <strong className="text-gray-900">{review.business?.name || 'Unknown'}</strong>
                                        </td>
                                        <td>
                                            <div className="user-info">
                                                <img
                                                    src={review.user?.avatar ? getImageUrl(review.user.avatar) : `https://ui-avatars.com/api/?name=${review.user?.name || 'U'}`}
                                                    alt="Avatar"
                                                    className="user-avatar"
                                                />
                                                <div className="user-details">
                                                    <span className="user-name">{review.user?.name || 'Anonymous'}</span>
                                                    <span className="user-email">{review.user?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`rating-badge ${getRatingClass(review.rating)}`}>
                                                <Star size={14} fill="currentColor" /> {review.rating}
                                            </span>
                                        </td>
                                        <td className="review-content-cell">
                                            <div className="review-content-wrapper">
                                                <span className="review-title">{review.title}</span>
                                                <p className="review-body">{review.content}</p>
                                                {review.disputeStatus === 'pending' && (
                                                    <div className="bg-orange-50 border border-orange-100 p-2 mt-2 rounded">
                                                        <strong className="text-orange-800 text-xs uppercase flex items-center gap-1">
                                                            <AlertTriangle size={12} /> Dispute Reason:
                                                        </strong>
                                                        <p className="text-sm text-gray-700 mt-1">{review.disputeReason}</p>
                                                    </div>
                                                )}
                                                <small className="text-gray-400 mt-1 block">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                {review.isHidden ? (
                                                    <span className="status-badge status-hidden">Hidden</span>
                                                ) : (
                                                    <span className="status-badge status-visible">Visible</span>
                                                )}
                                                {review.disputeStatus === 'pending' && (
                                                    <span className="status-badge bg-orange-100 text-orange-800">Disputed</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                {review.disputeStatus === 'pending' ? (
                                                    <>
                                                        <button
                                                            className="action-btn text-green-600 bg-green-50 hover:bg-green-100 border border-green-200"
                                                            onClick={() => initiateAction('accept_dispute', review)}
                                                            title="Accept Dispute (Delete Review)"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            className="action-btn text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
                                                            onClick={() => initiateAction('reject_dispute', review)}
                                                            title="Reject Dispute (Keep Review)"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className={`action-btn ${review.isHidden ? 'unhide' : 'hide'}`}
                                                            onClick={() => initiateAction('hide', review)}
                                                            disabled={actionLoading === review._id}
                                                            title={review.isHidden ? 'Unhide Review' : 'Hide Review'}
                                                        >
                                                            {review.isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => initiateAction('delete', review)}
                                                            disabled={actionLoading === review._id}
                                                            title="Delete permanently"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredReviews.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-gray-500">
                                            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p>No reviews found matching your criteria.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Password Confirmation Modal */}
            {showPasswordModal && pendingAction && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Confirm {pendingAction.type === 'hide' ? 'Change Status' : 'Delete'}</h2>
                            <button className="close-btn" onClick={() => setShowPasswordModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleConfirmAction}>
                            <p className="mb-4 text-gray-600">
                                {pendingAction.type === 'hide'
                                    ? `Are you sure you want to ${pendingAction.review.isHidden ? 'share' : 'hide'} this review from ${pendingAction.review.user?.name || 'User'}?`
                                    : pendingAction.type === 'accept_dispute'
                                        ? 'Are you sure you want to ACCEPT this dispute? The review will be permanently deleted.'
                                        : pendingAction.type === 'reject_dispute'
                                            ? 'Are you sure you want to REJECT this dispute? The review will remain visible.'
                                            : 'Are you sure you want to permanently delete this review? This action cannot be undone.'
                                }
                            </p>

                            {confirmError && <div className="error-alert mb-4">{confirmError}</div>}

                            <div className="form-group">
                                <label>Enter Admin Password</label>
                                <input
                                    type="password"
                                    required
                                    className="form-control"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoFocus
                                />
                            </div>

                            <div className="modal-actions mt-6">
                                <button type="button" className="btn-cancel" onClick={() => setShowPasswordModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`btn-submit ${pendingAction.type === 'delete' || pendingAction.type === 'accept_dispute' ? 'bg-red-600 hover:bg-red-700 border-red-600' : ''}`}
                                    disabled={loading || !adminPassword}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Action'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageReviews;

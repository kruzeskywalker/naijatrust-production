import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Settings, User, AlertCircle, Mail, MapPin, Calendar, Edit3, Trash2, X, Loader2, Star } from 'lucide-react';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { getImageUrl } from '../utils/urlUtils';
import './Dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001/api' : 'https://naijatrust-production-api.onrender.com/api');

const Dashboard = () => {
    const { user, resendVerification } = useAuth();
    const [resending, setResending] = useState(false);
    const location = useLocation();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState(null);
    const [deletingReview, setDeletingReview] = useState(null);
    const [editForm, setEditForm] = useState({ rating: 0, title: '', content: '' });
    const [submitting, setSubmitting] = useState(false);

    if (!user) return <div className="container">Please log in to view your dashboard.</div>;

    const isReviewsPage = location.pathname === '/dashboard/reviews';

    useEffect(() => {
        // Fetch reviews on both main dashboard (for stats) and reviews page
        fetchUserReviews();
    }, [location.pathname]);

    const fetchUserReviews = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('naijaTrustToken');
            const response = await fetch(`${API_BASE_URL}/reviews/user/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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

    const handleResendVerification = async () => {
        setResending(true);
        const result = await resendVerification();
        setResending(false);

        if (result.success) {
            alert(result.message);
        } else {
            alert(result.message || 'Failed to resend verification email');
        }
    };

    const handleEditClick = (review) => {
        setEditingReview(review);
        setEditForm({
            rating: review.rating,
            title: review.title,
            content: review.content
        });
    };

    const handleSaveEdit = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('naijaTrustToken');
            const response = await fetch(`${API_BASE_URL}/reviews/${editingReview._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            const data = await response.json();
            if (data.status === 'success') {
                // Update local state
                setReviews(reviews.map(r => r._id === editingReview._id ? data.data.review : r));
                setEditingReview(null);
            } else {
                alert(data.message || 'Failed to update review');
            }
        } catch (error) {
            console.error('Error updating review:', error);
            alert('Failed to update review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (review) => {
        setDeletingReview(review);
    };

    const confirmDelete = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('naijaTrustToken');
            const response = await fetch(`${API_BASE_URL}/reviews/${deletingReview._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.status === 'success') {
                // Remove from local state
                setReviews(reviews.filter(r => r._id !== deletingReview._id));
                setDeletingReview(null);
            } else {
                alert(data.message || 'Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        } finally {
            setSubmitting(false);
        }
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="dashboard-page container">
            {!user.isVerified && (
                <div className="verification-alert">
                    <AlertCircle size={20} />
                    <span>
                        Your account is not verified. Please check your email for the verification link.
                    </span>
                    <button
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="resend-btn"
                    >
                        {resending ? 'Sending...' : 'Resend Email'}
                    </button>
                </div>
            )}

            <div className="dashboard-layout">
                <aside className="dashboard-sidebar">
                    <div className="sidebar-profile">
                        <div className="dashboard-avatar">
                            {user.avatar ? (
                                <img src={getImageUrl(user.avatar)} alt={user.name} />
                            ) : (
                                user.name[0]
                            )}
                        </div>
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                    </div>
                    <nav className="sidebar-nav">
                        <Link to="/dashboard" className={!isReviewsPage ? 'active' : ''}><User size={20} /> My Profile</Link>
                        <Link to="/dashboard/reviews" className={isReviewsPage ? 'active' : ''}><MessageSquare size={20} /> My Reviews</Link>
                        <Link to="/settings"><Settings size={20} /> Settings</Link>
                    </nav>
                </aside>

                <main className="dashboard-main">
                    {!isReviewsPage ? (
                        <div className="overview-section">
                            <section className="dashboard-header">
                                <h2>Account Overview</h2>
                                <p>Welcome back, {user.name.split(' ')[0]}! Here's what's happening with your profile.</p>
                            </section>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <MessageSquare size={24} />
                                    <div className="stat-info">
                                        <span className="stat-value">{reviews.length}</span>
                                        <span className="stat-label">Total Reviews</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <Star size={24} />
                                    <div className="stat-info">
                                        <span className="stat-value">{avgRating}</span>
                                        <span className="stat-label">Avg. Rating Given</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <Calendar size={24} />
                                    <div className="stat-info">
                                        <span className="stat-value">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                        <span className="stat-label">Joined</span>
                                    </div>
                                </div>
                            </div>

                            <section className="recent-activity">
                                <div className="section-title-row">
                                    <h3>Recent Reviews</h3>
                                    <Link to="/dashboard/reviews" className="view-all">View all</Link>
                                </div>
                                <div className="user-reviews-list mini">
                                    {reviews.slice(0, 1).map(rev => (
                                        <div key={rev._id} className="user-review-card">
                                            <div className="rev-card-header">
                                                <h4>{rev.business?.name}</h4>
                                                <span className="rev-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="rev-stars-mini">
                                                <StarRating rating={rev.rating} size={14} />
                                            </div>
                                            <p>"{rev.content}"</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="reviews-section">
                            <section className="dashboard-header">
                                <h2>My Reviews</h2>
                                <p>Manage and track all your feedback in one place.</p>
                            </section>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <Loader2 className="animate-spin" size={32} />
                                    <p>Loading your reviews...</p>
                                </div>
                            ) : (
                                <div className="user-reviews-list">
                                    {reviews.length > 0 ? (
                                        reviews.map(rev => (
                                            <div key={rev._id} className="user-review-card">
                                                <div className="rev-card-header">
                                                    <div className="biz-info">
                                                        <h4>{rev.business?.name}</h4>
                                                        <span className="biz-loc"><MapPin size={12} /> {rev.business?.location || 'Nigeria'}</span>
                                                    </div>
                                                    <span className="rev-date">{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <div className="rev-stars-mini">
                                                    <StarRating rating={rev.rating} size={16} showLabel={true} />
                                                </div>
                                                <h5 className="rev-title">{rev.title}</h5>
                                                <p className="rev-text">"{rev.content}"</p>
                                                {rev.replies && rev.replies.length > 0 && (
                                                    <div className="conversation-thread">
                                                        <p className="thread-label">{rev.replies.length} {rev.replies.length === 1 ? 'reply' : 'replies'}</p>
                                                    </div>
                                                )}
                                                <div className="rev-actions">
                                                    <button className="btn-text" onClick={() => handleEditClick(rev)}><Edit3 size={14} /> Edit</button>
                                                    <button className="btn-text delete" onClick={() => handleDeleteClick(rev)}><Trash2 size={14} /> Delete</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <MessageSquare size={48} />
                                            <p>You haven't written any reviews yet.</p>
                                            <Link to="/search" className="btn btn-primary">Find a business</Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Edit Review Modal */}
            {editingReview && (
                <div className="modal-overlay" onClick={() => !submitting && setEditingReview(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Review</h3>
                            <button className="close-btn" onClick={() => setEditingReview(null)} disabled={submitting}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Rating</label>
                                <div className="star-picker">
                                    {[...Array(5)].map((_, i) => {
                                        const ratingValue = i + 1;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, rating: ratingValue })}
                                                disabled={submitting}
                                            >
                                                <Star
                                                    size={32}
                                                    fill={editForm.rating >= ratingValue ? "var(--primary-color)" : "none"}
                                                    color={editForm.rating >= ratingValue ? "var(--primary-color)" : "#cbd5e0"}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    disabled={submitting}
                                />
                            </div>
                            <div className="form-group">
                                <label>Review</label>
                                <textarea
                                    rows="5"
                                    value={editForm.content}
                                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                    disabled={submitting}
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setEditingReview(null)} disabled={submitting}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveEdit} disabled={submitting}>
                                {submitting ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingReview && (
                <div className="modal-overlay" onClick={() => !submitting && setDeletingReview(null)}>
                    <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Delete Review?</h3>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete your review for <strong>{deletingReview.business?.name}</strong>? This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setDeletingReview(null)} disabled={submitting}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={confirmDelete} disabled={submitting}>
                                {submitting ? <><Loader2 className="animate-spin" size={16} /> Deleting...</> : 'Delete Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

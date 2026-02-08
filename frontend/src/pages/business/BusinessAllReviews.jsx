import React, { useState, useEffect } from 'react';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Loader2, MessageCircle, ArrowLeft, AlertTriangle, Clock, X, Send } from 'lucide-react';
import StarRating from '../../components/StarRating';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './BusinessReviews.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const BusinessAllReviews = () => {
    const { token } = useBusinessAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Dispute State
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [disputeReason, setDisputeReason] = useState('');

    useEffect(() => {
        if (token) fetchReviews();
    }, [token]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/business-portal/reviews`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setReviews(data.data.reviews);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async (reviewId) => {
        if (!replyContent.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/business-portal/reviews/${reviewId}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: replyContent })
            });

            const data = await response.json();
            if (data.status === 'success') {
                await fetchReviews();
                setReplyingTo(null);
                setReplyContent('');
                toast.success('Reply posted successfully');
            } else {
                toast.error(data.message || 'Failed to post reply');
            }
        } catch (error) {
            console.error('Reply error:', error);
            toast.error('Failed to submit reply');
        } finally {
            setSubmitting(false);
        }
    };

    const initiateDispute = (review) => {
        console.log('Initiating dispute for review:', review._id); // Debug Log
        setSelectedReview(review);
        setDisputeReason('');
        setShowDisputeModal(true);
        console.log('Modal state set to true'); // Debug Log
    };

    const submitDispute = async (e) => {
        e.preventDefault();
        console.log('Submitting dispute...'); // Debug Log
        if (!disputeReason.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/business-portal/reviews/${selectedReview._id}/dispute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason: disputeReason })
            });

            const data = await response.json();
            if (data.status === 'success') {
                toast.success('Dispute submitted for review');
                fetchReviews();
                setShowDisputeModal(false);
            } else {
                toast.error(data.message || 'Failed to submit dispute');
            }
        } catch (error) {
            console.error('Error submitting dispute:', error);
            toast.error('Failed to submit dispute');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-600" /></div>;

    return (
        <div className="business-reviews-container">
            <header className="dashboard-header">
                <Link to="/business/dashboard" className="back-link">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <h1>All Reviews</h1>
            </header>

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <div className="empty-state-card">
                        <MessageCircle size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                        <h3>No Reviews Yet</h3>
                        <p>No reviews found across your businesses.</p>
                    </div>
                ) : (
                    reviews.map(rev => (
                        <div key={rev._id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-profile">
                                    <div className="reviewer-avatar">
                                        {rev.user?.name?.[0] || 'U'}
                                    </div>
                                    <div className="reviewer-details">
                                        <h3>{rev.user?.name || 'Anonymous User'}</h3>
                                        <div className="flex items-center gap-1">
                                            <StarRating rating={rev.rating} size={14} showLabel={true} />
                                            <span className="text-xs text-gray-500 ml-2">for {rev.business?.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="review-date">
                                    {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'short', day: 'numeric'
                                    })}
                                </span>
                            </div>

                            <div className="review-body">
                                <strong className="review-title">{rev.title}</strong>
                                <p className="review-text">{rev.content}</p>
                            </div>

                            {/* Replies */}
                            {rev.replies?.length > 0 && (
                                <div className="replies-section">
                                    {rev.replies.map((reply, idx) => (
                                        <div key={idx} className={`reply-item ${reply.isBusiness ? 'reply-business' : 'reply-user'}`}>
                                            <div className="reply-header">
                                                <span className={`reply-author ${reply.isBusiness ? 'is-business' : 'is-user'}`}>
                                                    {reply.isBusiness ? 'Your Response' : (reply.user?.name || 'Customer')}
                                                </span>
                                                <span className="reply-timestamp">
                                                    {new Date(reply.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p>{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions Footer */}
                            <div className="review-actions">
                                {rev.business?.subscriptionTier === 'basic' ? (
                                    <div className="upgrade-prompt">
                                        <span>Upgrade to verification status to reply.</span>
                                        <Link to="/business/settings" className="upgrade-link">Verify Now</Link>
                                    </div>
                                ) : (
                                    <>
                                        {replyingTo === rev._id ? (
                                            <div className="reply-form">
                                                <textarea
                                                    className="reply-textarea"
                                                    placeholder="Write your professional response..."
                                                    value={replyContent}
                                                    onChange={e => setReplyContent(e.target.value)}
                                                    autoFocus
                                                />
                                                <div className="form-actions">
                                                    <button
                                                        className="btn-premium btn-cancel"
                                                        onClick={() => setReplyingTo(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        className="btn-premium btn-reply"
                                                        onClick={() => handleReplySubmit(rev._id)}
                                                        disabled={submitting}
                                                    >
                                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Post Reply</>}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Dispute Status / Button */}
                                                {rev.disputeStatus === 'none' && (
                                                    <button
                                                        className="btn-premium btn-dispute"
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            initiateDispute(rev);
                                                        }}
                                                        title="Report this review"
                                                    >
                                                        <AlertTriangle size={16} /> Report
                                                    </button>
                                                )}

                                                {rev.disputeStatus === 'pending' && (
                                                    <span className="status-pill status-pending">
                                                        <Clock size={14} /> Dispute Pending
                                                    </span>
                                                )}

                                                {rev.disputeStatus === 'rejected' && (
                                                    <span className="status-pill status-rejected">
                                                        <X size={14} /> Dispute Rejected
                                                    </span>
                                                )}

                                                <button
                                                    className="btn-premium btn-reply"
                                                    onClick={() => setReplyingTo(rev._id)}
                                                >
                                                    <MessageCircle size={16} /> Reply
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Dispute Modal using new CSS classes */}
            {showDisputeModal && (
                <div className="dispute-modal-overlay">
                    <div className="dispute-modal-content">
                        <div className="modal-header">
                            <h3>
                                <AlertTriangle size={20} /> Report Review
                            </h3>
                            <button onClick={() => setShowDisputeModal(false)} className="close-modal-btn">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={submitDispute}>
                            <div className="modal-body">
                                <p>
                                    Use this form to report reviews that violate our content policy.
                                    False reporting may lead to account suspension.
                                </p>

                                <label>Reason for Dispute</label>
                                <textarea
                                    className="modal-textarea"
                                    placeholder="Please explain specifically why this review should be removed..."
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="cancel-modal-btn"
                                    onClick={() => setShowDisputeModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-dispute-btn"
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessAllReviews;

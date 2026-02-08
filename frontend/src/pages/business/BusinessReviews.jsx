import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { MessageCircle, Loader2, ArrowLeft, AlertTriangle, Clock, X, Send } from 'lucide-react';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';
import './BusinessReviews.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const BusinessReviews = () => {
    const { businessId } = useParams();
    const { token, loading } = useBusinessAuth();
    const [reviews, setReviews] = useState([]);
    const [business, setBusiness] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Dispute State
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [disputeReason, setDisputeReason] = useState('');

    useEffect(() => {
        if (token && businessId) {
            fetchReviews();
        }
    }, [token, businessId]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/business-portal/reviews/${businessId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                console.log('Business Data:', data.data.business);
                console.log('Review Data Sample:', data.data.reviews[0]);
                setReviews(data.data.reviews);
                setBusiness(data.data.business);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoadingData(false);
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
                setReplyContent('');
                setReplyingTo(null);
                toast.success('Reply posted successfully');
            } else {
                toast.error(data.message || 'Failed to post reply');
            }
        } catch (error) {
            console.error('Error replying:', error);
            toast.error('Failed to submit reply');
        } finally {
            setSubmitting(false);
        }
    };

    const initiateDispute = (review) => {
        setSelectedReview(review);
        setDisputeReason('');
        setShowDisputeModal(true);
    };

    const submitDispute = async (e) => {
        e.preventDefault();
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

    if (loading || isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-green-600" size={48} />
            </div>
        );
    }

    return (
        <div className="business-reviews-container">
            <header className="dashboard-header">
                <Link to="/business/dashboard" className="back-link">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <h1>Manage Reviews</h1>
            </header>

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <div className="empty-state-card">
                        <MessageCircle size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                        <h3>No Reviews Yet</h3>
                        <p>Customer reviews will appear here once your business starts getting noticed.</p>
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
                                {business?.subscriptionTier === 'basic' ? (
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
                                                        onClick={() => initiateDispute(rev)}
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

            {/* Dispute Modal */}
            {showDisputeModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                                <AlertTriangle size={20} /> Report Review
                            </h3>
                            <button onClick={() => setShowDisputeModal(false)} className="text-red-400 hover:text-red-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={submitDispute} className="p-6">
                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                Use this form to report reviews that violate our content policy (e.g., spam, hate speech, conflict of interest).
                                False reporting may lead to account suspension.
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason for Dispute
                                </label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm min-h-[120px]"
                                    placeholder="Please explain specifically why this review should be removed..."
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
                                <button
                                    type="button"
                                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                    onClick={() => setShowDisputeModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all shadow-sm hover:shadow active:transform active:scale-95 flex items-center gap-2 disabled:opacity-70"
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

export default BusinessReviews;

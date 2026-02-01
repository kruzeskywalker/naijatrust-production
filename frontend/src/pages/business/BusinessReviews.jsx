import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Star, MessageCircle, Send, Loader2, ArrowLeft } from 'lucide-react';
import './BusinessDashboard.css'; // Reusing dashboard styles for consistency

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const BusinessReviews = () => {
    const { businessId } = useParams();
    const { token, loading } = useBusinessAuth();
    const [reviews, setReviews] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

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
                setReviews(data.data.reviews);
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
                await fetchReviews(); // Refresh
                setReplyContent('');
                setReplyingTo(null);
            } else {
                alert(data.message || 'Failed to post reply');
            }
        } catch (error) {
            console.error('Error replying:', error);
            alert('Failed to submit reply');
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
        <div className="business-dashboard container">
            <header className="dashboard-header">
                <div>
                    <Link to="/business/dashboard" className="btn btn-outline btn-sm mb-4">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1>Manage Reviews</h1>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="reviews-list">
                    {reviews.length === 0 ? (
                        <div className="empty-state-card">
                            <MessageCircle size={48} color="#cbd5e0" />
                            <h3>No Reviews Yet</h3>
                            <p>Customer reviews will appear here.</p>
                        </div>
                    ) : (
                        reviews.map(rev => (
                            <div key={rev._id} className="review-card-full" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                                <div className="reviewer-info" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {rev.user?.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold">{rev.user?.name || 'Anonymous User'}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < rev.rating ? "#008751" : "none"} color="#008751" />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-gray-500 text-sm ml-auto">
                                        {new Date(rev.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="font-bold mb-2">{rev.title}</h3>
                                <p className="mb-4">{rev.content}</p>

                                {/* Replies */}
                                {rev.replies?.length > 0 && (
                                    <div className="pl-4 border-l-2 border-gray-200 mt-4">
                                        {rev.replies.map((reply, idx) => (
                                            <div key={idx} className="bg-gray-50 p-3 rounded mb-2">
                                                <p className="text-sm font-bold text-green-700">
                                                    {reply.isBusiness ? 'Business Response' : (reply.user?.name || 'User')}
                                                </p>
                                                <p className="text-sm">{reply.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Reply Action */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    {replyingTo === rev._id ? (
                                        <div className="reply-form">
                                            <textarea
                                                className="w-full p-2 border rounded mb-2"
                                                rows="3"
                                                placeholder="Write your response..."
                                                value={replyContent}
                                                onChange={e => setReplyContent(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleReplySubmit(rev._id)}
                                                    disabled={submitting}
                                                >
                                                    {submitting ? 'Posting...' : 'Post Reply'}
                                                </button>
                                                <button
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => setReplyingTo(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => setReplyingTo(rev._id)}
                                        >
                                            <MessageCircle size={16} /> Reply
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessReviews;

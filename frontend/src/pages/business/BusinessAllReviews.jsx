import React, { useState, useEffect } from 'react';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Loader2, Star, MessageCircle, Reply } from 'lucide-react';
import { Link } from 'react-router-dom';
import './BusinessDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const BusinessAllReviews = () => {
    const { token } = useBusinessAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

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
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async (reviewId) => {
        if (!replyContent.trim()) return;

        setSubmitLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/business-portal/reviews/${reviewId}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: replyContent })
            });

            if (response.ok) {
                // Refresh reviews
                await fetchReviews();
                setReplyingTo(null);
                setReplyContent('');
            }
        } catch (error) {
            console.error('Reply error:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-600" /></div>;

    return (
        <div className="business-dashboard container" style={{ padding: '2rem 1rem' }}>
            <div className="section-header">
                <h2>All Reviews</h2>
                <Link to="/business/dashboard" className="btn btn-outline btn-sm">Back to Dashboard</Link>
            </div>

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <div className="empty-state">
                        <MessageCircle size={48} color="#cbd5e0" />
                        <p>No reviews yet.</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review._id} className="review-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-lg">{review.title}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                        <span>• {new Date(review.createdAt).toLocaleDateString()}</span>
                                        <span>• for <strong>{review.business?.name}</strong></span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-medium">{review.user?.name || 'Anonymous'}</span>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-4">{review.content}</p>

                            {/* Replies */}
                            {review.replies?.length > 0 && (
                                <div className="bg-gray-50 p-3 rounded-md mb-3 border-l-4 border-green-500">
                                    {review.replies.map((reply, idx) => (
                                        <div key={idx} className="text-sm">
                                            <strong>{reply.isBusiness ? 'Business Response' : reply.user?.name}: </strong>
                                            {reply.content}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Action */}
                            {!review.replies?.some(r => r.isBusiness) && (
                                <div>
                                    {replyingTo === review._id ? (
                                        <div className="mt-2">
                                            <textarea
                                                className="w-full p-2 border rounded mb-2"
                                                placeholder="Write your response..."
                                                value={replyContent}
                                                onChange={e => setReplyContent(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleReplySubmit(review._id)}
                                                    disabled={submitLoading}
                                                >
                                                    {submitLoading ? 'Posting...' : 'Post Reply'}
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
                                            className="text-green-600 font-medium flex items-center gap-1 hover:text-green-700"
                                            onClick={() => setReplyingTo(review._id)}
                                        >
                                            <Reply size={16} /> Reply to review
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BusinessAllReviews;

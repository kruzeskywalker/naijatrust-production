import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, MapPin, Globe, Phone, Mail, Loader2, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VerifiedBadge from '../components/VerifiedBadge';
import './BusinessProfile.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const BusinessProfile = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [business, setBusiness] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [expandedThreads, setExpandedThreads] = useState({});

    const trackEvent = async (type) => {
        try {
            await fetch(`${API_BASE_URL}/businesses/${id}/analytics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });
        } catch (error) {
            console.error('Analytics tracking error:', error);
        }
    };

    useEffect(() => {
        trackEvent('view');
    }, [id]);

    useEffect(() => {
        fetchBusinessData();
    }, [id]);

    const fetchBusinessData = async () => {
        try {
            const [bizRes, revRes] = await Promise.all([
                fetch(`${API_BASE_URL}/businesses/${id}`),
                fetch(`${API_BASE_URL}/reviews/${id}`)
            ]);

            const bizData = await bizRes.json();
            const revData = await revRes.json();

            if (bizData.status === 'success') {
                setBusiness(bizData.data.business);
            }
            if (revData.status === 'success') {
                setReviews(revData.data.reviews);
            }
        } catch (error) {
            console.error('Error fetching business data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async (reviewId) => {
        if (!replyContent.trim()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('naijaTrustToken');
            const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: replyContent,
                    isBusiness: false // Set to true if user is business owner
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                // Refresh reviews to show new reply
                await fetchBusinessData();
                setReplyContent('');
                setReplyingTo(null);
                // Auto-expand the thread
                setExpandedThreads({ ...expandedThreads, [reviewId]: true });
            } else {
                alert(data.message || 'Failed to post reply');
            }
        } catch (error) {
            console.error('Error posting reply:', error);
            alert('Failed to post reply');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleThread = (reviewId) => {
        setExpandedThreads({
            ...expandedThreads,
            [reviewId]: !expandedThreads[reviewId]
        });
    };

    if (loading) {
        return (
            <div className="loading-state container">
                <Loader2 className="animate-spin" size={48} />
                <p>Loading business profile...</p>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>Business not found</h2>
                <Link to="/search" className="btn btn-primary">Back to search</Link>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="container profile-header-content">
                    <div className="biz-main-info">
                        <div className="biz-logo-large">{business.name[0]}</div>
                        <div className="biz-details">
                            <div className="title-row">
                                <h1>{business.name}</h1>
                                <VerifiedBadge business={business} size="medium" />
                            </div>
                            <p>{business.reviewCount} reviews • {business.category}</p>
                            <div className="trust-score-row">
                                <div className="huge-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={40} fill={i < Math.floor(business.rating) ? "var(--primary-color)" : "none"} color="var(--primary-color)" />
                                    ))}
                                </div>
                                <div className="score-text">
                                    <span className="score">{business.rating}</span>
                                    <span className="label">TrustScore</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="header-actions">
                        <Link to={`/review/${id}`} className="btn btn-primary btn-large">Write a review</Link>
                        {business.website && (
                            <a
                                href={business.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline"
                                onClick={() => trackEvent('website_click')}
                            >
                                Visit website
                            </a>
                        )}
                        {!business.isClaimed && business.claimStatus !== 'pending' && (
                            <Link to={`/business/claim/${id}`} className="btn btn-outline claim-btn">
                                Is this your business?
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="profile-content container">
                <main className="biz-main">
                    <div className="section-header">
                        <h2>Reviews</h2>
                    </div>
                    <div className="reviews-list">
                        {reviews.length > 0 ? (
                            reviews.map(rev => (
                                <div key={rev._id} className="review-card-full">
                                    <div className="reviewer-info">
                                        <div className="avatar">
                                            {rev.user?.avatar ? <img src={rev.user.avatar} alt={rev.user.name} /> : rev.user?.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="name">{rev.user?.name || 'Anonymous User'}</p>
                                            <p className="meta">{rev.user?.reviewCount || 1} review • Nigeria</p>
                                        </div>
                                    </div>
                                    <div className="review-content">
                                        <div className="review-stars-small">
                                            {[...Array(5)].map((_, j) => (
                                                <Star key={j} size={18} fill={j < rev.rating ? "var(--primary-color)" : "none"} color="var(--primary-color)" />
                                            ))}
                                        </div>
                                        <h3>{rev.title}</h3>
                                        <p>{rev.content}</p>
                                        <p className="date">Published {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>

                                        {/* Conversation Thread */}
                                        {rev.replies && rev.replies.length > 0 && (
                                            <div className="conversation-section">
                                                <button
                                                    className="toggle-thread-btn"
                                                    onClick={() => toggleThread(rev._id)}
                                                >
                                                    <MessageCircle size={16} />
                                                    {expandedThreads[rev._id] ? 'Hide' : 'View'} {rev.replies.length} {rev.replies.length === 1 ? 'reply' : 'replies'}
                                                </button>

                                                {expandedThreads[rev._id] && (
                                                    <div className="thread-container">
                                                        {rev.replies.map((reply, idx) => (
                                                            <div key={idx} className={`thread-reply ${reply.isBusiness ? 'business-reply' : 'user-reply'}`}>
                                                                <div className="reply-header">
                                                                    <div className="reply-avatar">
                                                                        {reply.isBusiness ? business.name[0] : (reply.user?.name?.[0] || 'U')}
                                                                    </div>
                                                                    <div>
                                                                        <p className="reply-author">
                                                                            {reply.isBusiness ? business.name : (reply.user?.name || 'User')}
                                                                            {reply.isBusiness && <span className="business-badge">Business</span>}
                                                                        </p>
                                                                        <p className="reply-date">
                                                                            {new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <p className="reply-content">{reply.content}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Reply Button */}
                                        {user && (
                                            <div className="reply-section">
                                                {replyingTo === rev._id ? (
                                                    <div className="reply-form">
                                                        <textarea
                                                            placeholder="Write your response..."
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            rows="3"
                                                            disabled={submitting}
                                                        />
                                                        <div className="reply-form-actions">
                                                            <button
                                                                className="btn btn-outline btn-small"
                                                                onClick={() => {
                                                                    setReplyingTo(null);
                                                                    setReplyContent('');
                                                                }}
                                                                disabled={submitting}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                className="btn btn-primary btn-small"
                                                                onClick={() => handleReplySubmit(rev._id)}
                                                                disabled={submitting || !replyContent.trim()}
                                                            >
                                                                {submitting ? <><Loader2 className="animate-spin" size={14} /> Posting...</> : <><Send size={14} /> Post Reply</>}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="reply-btn"
                                                        onClick={() => setReplyingTo(rev._id)}
                                                    >
                                                        <MessageCircle size={16} /> Reply
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-reviews">
                                <p>No reviews yet for this business. Be the first to share your experience!</p>
                            </div>
                        )}
                    </div>
                </main>

                <aside className="biz-sidebar">
                    <div className="sidebar-card">
                        <h3>About {business.name}</h3>
                        <p>{business.description}</p>
                        <div className="contact-info">
                            <p><Globe size={18} /> {business.website || 'No website added'}</p>
                            <p>
                                <Phone size={18} />
                                {business.phone ? (
                                    <a href={`tel:${business.phone}`} onClick={() => trackEvent('call_click')} style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {business.phone}
                                    </a>
                                ) : 'No phone added'}
                            </p>
                            <p><MapPin size={18} /> {business.location}</p>
                        </div>
                    </div>
                    <div className="sidebar-card company-is">
                        <h3>Company activity</h3>
                        {business.isClaimed ? (
                            <p className="text-success"><ShieldCheck size={18} /> Profile Claimed</p>
                        ) : (
                            <p className="text-muted"><ShieldCheck size={18} /> Unclaimed Profile</p>
                        )}
                        <p><Mail size={18} /> Responds to reviews</p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default BusinessProfile;

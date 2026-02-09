import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './WriteReview.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001/api' : 'https://naijatrust-production-api.onrender.com/api');

const WriteReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/businesses/${id}`);
                const data = await res.json();
                if (data.status === 'success') {
                    setBusiness(data.data.business);
                }
            } catch (error) {
                console.error('Error fetching business:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, [id]);

    const handlePostReview = async () => {
        if (!rating || !title || !content) {
            setStatus({ type: 'error', message: 'Please fill in all fields and provide a rating.' });
            return;
        }

        if (!user) {
            setStatus({ type: 'error', message: 'You must be logged in to post a review.' });
            return;
        }

        setSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const token = localStorage.getItem('naijaTrustToken');
            const response = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    businessId: id,
                    rating,
                    title,
                    content
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: 'Review posted successfully!' });
                setTimeout(() => navigate(`/business/${id}`), 2000);
            } else {
                if (response.status === 401) {
                    logout();
                    navigate('/login');
                    return;
                }
                setStatus({ type: 'error', message: data.message || 'Failed to post review.' });
            }
        } catch (error) {
            console.error('Error posting review:', error);
            setStatus({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" /> Loading...</div>;
    if (!business) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Business not found</div>;

    // Helper to get color based on rating
    const getStarColor = (val) => {
        if (val === 0) return "#CBD5E0"; // Default gray
        if (val >= 4.8) return '#00C851'; // Excellent (Green)
        if (val >= 4.3) return '#00C851'; // Excellent (Green)
        if (val >= 3.8) return '#76ff03'; // Great (Light Green)
        if (val >= 3.3) return '#FFEB3B'; // Average (Yellow)
        if (val >= 2.8) return '#FFEB3B'; // Average (Yellow)
        if (val >= 2.3) return '#FF9800'; // Poor (Orange)
        if (val >= 1.8) return '#FF9800'; // Poor (Orange)
        if (val >= 1) return '#f44336';   // Bad (Red)
        return "#CBD5E0";
    };

    // Helper for labels
    const getRatingLabel = (val) => {
        if (val >= 4.8) return 'EXCELLENT';
        if (val >= 4.3) return 'EXCELLENT';
        if (val >= 3.8) return 'GREAT';
        if (val >= 3.3) return 'AVERAGE';
        if (val >= 2.8) return 'AVERAGE';
        if (val >= 2.3) return 'POOR';
        if (val >= 1.8) return 'POOR';
        if (val >= 1) return 'BAD';
        return 'SELECT RATING';
    };

    return (
        <div className="write-review-page container">
            <div className="review-flow-card">
                <div className="review-biz-header">
                    <div className="mini-biz-logo">{business.name[0]}</div>
                    <h2>Reviewing {business.name}</h2>
                </div>

                <div className="rating-step">
                    <h3>Rate your experience</h3>
                    <div className="star-picker">
                        {[...Array(5)].map((_, i) => {
                            const ratingValue = i + 1;
                            const currentColor = getStarColor(hover || rating);
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                    onClick={() => setRating(ratingValue)}
                                >
                                    <Star
                                        size={48}
                                        fill={ratingValue <= (hover || rating) ? currentColor : "transparent"}
                                        color={ratingValue <= (hover || rating) ? currentColor : "#cbd5e0"}
                                        style={{ transition: 'all 0.2s' }}
                                    />
                                </button>
                            );
                        })}
                    </div>
                    <p className="rating-label" style={{
                        color: getStarColor(rating || hover),
                        fontWeight: '700',
                        marginTop: '0.5rem',
                        transition: 'color 0.2s'
                    }}>
                        {getRatingLabel(rating || hover)}
                    </p>
                </div>

                <div className="text-step">
                    <div className="form-group">
                        <label>Title of your review</label>
                        <input
                            type="text"
                            placeholder="What's most important to know?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Tell us more</label>
                        <textarea
                            placeholder="Write about your experience. How was the service? How was the app?"
                            rows="6"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                    </div>

                    {status.message && (
                        <div className={`status-alert ${status.type}`} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '8px', background: status.type === 'success' ? '#f0fdf4' : '#fef2f2', color: status.type === 'success' ? '#166534' : '#991b1b', border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
                            {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {status.message}
                        </div>
                    )}

                    <button
                        className="btn btn-primary btn-large w-100"
                        onClick={handlePostReview}
                        disabled={submitting}
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : "Post review"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WriteReview;

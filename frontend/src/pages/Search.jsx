import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Star, MapPin, Filter, Loader2 } from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';
import './Search.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const Search = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const categoryQuery = searchParams.get('category');
    const searchQuery = searchParams.get('q');

    const [selectedRatings, setSelectedRatings] = useState([]);
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);

    const toggleRating = (rating) => {
        setSelectedRatings(prev =>
            prev.includes(rating)
                ? prev.filter(r => r !== rating)
                : [...prev, rating]
        );
    };

    useEffect(() => {
        const fetchBusinesses = async () => {
            setLoading(true);
            try {
                let url = `${API_BASE_URL}/businesses?`;
                if (categoryQuery) url += `category=${encodeURIComponent(categoryQuery)}&`;
                if (searchQuery) url += `q=${encodeURIComponent(searchQuery)}&`;
                if (verifiedOnly) url += `verified=true&`; // Add verified filter

                const response = await fetch(url);
                const data = await response.json();

                if (data.status === 'success') {
                    let results = data.data.businesses;

                    // Frontend Filtering for ratings (as backend doesn't support array ratings yet)
                    if (selectedRatings.length > 0) {
                        results = results.filter(b => {
                            const floorRating = Math.floor(b.rating);
                            return selectedRatings.includes(floorRating);
                        });
                    }

                    setBusinesses(results);
                }
            } catch (error) {
                console.error('Error fetching businesses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, [categoryQuery, searchQuery, selectedRatings, verifiedOnly]);

    return (
        <div className="search-page container">
            <div className="search-layout">
                <aside className="filters-sidebar">
                    <div className="filters-header">
                        <Filter size={18} />
                        <h3>Filters</h3>
                    </div>

                    <div className="filter-group">
                        <label className="filter-checkbox toggle-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '1rem', fontWeight: '500' }}>
                            <input
                                type="checkbox"
                                checked={verifiedOnly}
                                onChange={(e) => setVerifiedOnly(e.target.checked)}
                                style={{ transform: 'scale(1.2)' }}
                            />
                            <span>Verified Only</span>
                            <VerifiedBadge isVerified={true} size="small" showText={false} />
                        </label>
                    </div>

                    <div className="filter-group">
                        <label>Rating</label>
                        <div className="filter-options">
                            {[5, 4, 3, 2, 1].map(star => (
                                <label key={star} className={`filter-checkbox ${selectedRatings.includes(star) ? 'active' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRatings.includes(star)}
                                        onChange={() => toggleRating(star)}
                                    />
                                    <div className="filter-star-row">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i < star ? "var(--primary-color)" : "none"}
                                                color={i < star ? "var(--primary-color)" : "#cbd5e0"}
                                            />
                                        ))}
                                        <span>{star} stars</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {selectedRatings.length > 0 && (
                        <button className="clear-filters" onClick={() => setSelectedRatings([])}>Clear all filters</button>
                    )}
                </aside>

                <main className="results-list">
                    <div className="results-header">
                        <h2>
                            {categoryQuery ? `Best in "${categoryQuery}"` :
                                searchQuery ? `Results for "${searchQuery}"` :
                                    "All Businesses"}
                        </h2>
                        <p>Showing {loading ? '...' : businesses.length} results</p>
                    </div>

                    {loading ? (
                        <div className="search-loading">
                            <Loader2 className="animate-spin" size={32} />
                            <p>Searching for businesses...</p>
                        </div>
                    ) : businesses.length > 0 ? (
                        businesses.map(biz => (
                            <Link to={`/business/${biz._id}`} key={biz._id} className="business-card-wide">
                                <div className="biz-logo-placeholder" style={{ background: biz.isVerified ? 'var(--primary-color)' : '#cbd5e0' }}>{biz.name[0]}</div>
                                <div className="biz-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h3>{biz.name}</h3>
                                        <VerifiedBadge business={biz} size="small" showText={false} />
                                    </div>
                                    <div className="biz-stats">
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={16} fill={i < Math.floor(biz.rating) ? "var(--star-gold)" : "none"} color="var(--star-gold)" />
                                            ))}
                                        </div>
                                        <span>{biz.rating} TrustScore | {biz.reviewCount.toLocaleString()} reviews</span>
                                    </div>
                                    <div className="biz-meta">
                                        <span>{biz.category}</span>
                                        <span><MapPin size={14} /> {biz.location}</span>
                                    </div>
                                </div>
                                <button className="btn btn-outline">View Profile</button>
                            </Link>
                        ))
                    ) : (
                        <div className="no-results">
                            <p>No businesses found matching your criteria.</p>
                            <button className="btn btn-primary" onClick={() => setSelectedRatings([])}>Clear Filters</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Search;

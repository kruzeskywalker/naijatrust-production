import React, { useEffect, useState } from 'react';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, LogOut, Loader2, PlusCircle, Building2, Settings, MessageCircle } from 'lucide-react';
import VerifiedBadge from '../../components/VerifiedBadge';
import './BusinessDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const BusinessDashboard = () => {
    const { businessUser, logout, loading, token } = useBusinessAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !businessUser) {
            navigate('/business/login');
        }
    }, [loading, businessUser, navigate]);

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/business-portal/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setDashboardData(data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    if (loading || isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="animate-spin text-green-600" size={48} />
            </div>
        );
    }

    if (!businessUser) return null;

    return (
        <div className="business-dashboard">
            <header className="dashboard-header">
                <div className="container">
                    <div className="logo-section">
                        <h1>Business Portal</h1>
                    </div>
                    <div className="user-section">
                        <span>Welcome, {businessUser.name}</span>
                        <Link to="/business/settings" className="logout-btn" style={{ textDecoration: 'none', marginRight: '1rem' }}>
                            <Settings size={18} /> Settings
                        </Link>
                        <button onClick={logout} className="logout-btn">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            {location.state?.message && (
                <div className="container mt-4">
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-sm" role="alert">
                        <p className="font-bold">Success</p>
                        <p>{location.state.message}</p>
                    </div>
                </div>
            )}

            <main className="dashboard-content container">
                {!dashboardData?.businesses?.length && !dashboardData?.claims?.length ? (
                    <div className="empty-state-card">
                        <Building2 size={64} color="#cbd5e0" />
                        <h2>No Businesses Yet</h2>
                        <p>You haven't claimed or registered any businesses yet.</p>
                        <div className="action-buttons">
                            <Link to="/business/claim/search" className="btn btn-primary">Claim Existing Business</Link>
                            <Link to="/business/register" className="btn btn-outline">Register New Business</Link>
                        </div>
                    </div>
                ) : (
                    <div className="dashboard-overview">
                        {/* Summary Stats */}
                        <div className="stats-grid">
                            <Link to="/business/reviews" className="stat-card hover-card">
                                <h3>Total Reviews</h3>
                                <div className="value">{dashboardData.stats.totalReviews}</div>
                            </Link>
                            <Link to="/business/reviews" className="stat-card hover-card">
                                <h3>Avg Rating</h3>
                                <div className="value">{dashboardData.stats.avgRating}</div>
                            </Link>
                            <Link to="/business/analytics" className="stat-card hover-card">
                                <h3>Profile Views</h3>
                                <div className="value">{dashboardData.stats.totalViews}</div>
                            </Link>
                            <Link to="/business/analytics" className="stat-card hover-card">
                                <h3>Website Clicks</h3>
                                <div className="value">{dashboardData.stats.totalClicks}</div>
                            </Link>
                            <a href="#my-businesses" className="stat-card hover-card" onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('my-businesses').scrollIntoView({ behavior: 'smooth' });
                            }}>
                                <h3>Businesses</h3>
                                <div className="value">{dashboardData.stats.totalBusinesses}</div>
                            </a>
                        </div>

                        {/* Businesses List */}
                        <div className="section-header" id="my-businesses">
                            <h2>My Businesses</h2>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <Link to="/business/claim/search" className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', height: 'fit-content' }}>
                                    Claim Existing Business
                                </Link>
                                <Link to="/business/register" className="btn btn-sm btn-primary" style={{ display: 'flex', alignItems: 'center', height: 'fit-content' }}>
                                    <PlusCircle size={16} style={{ marginRight: '6px' }} /> Add New
                                </Link>
                            </div>
                        </div>

                        <div className="businesses-grid">
                            {dashboardData.businesses.map(biz => (
                                <div key={biz._id} className="business-card-item">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <h3>{biz.name}</h3>
                                        <VerifiedBadge isVerified={biz.isVerified} size="small" showText={false} />
                                    </div>
                                    <p>{biz.location}</p>
                                    <div className="biz-meta">
                                        <span>{biz.rating} ★</span>
                                        <span>{biz.reviewCount} Reviews</span>
                                    </div>
                                    {biz.isVerified && (
                                        <div className="verification-info" style={{ fontSize: '12px', color: '#059669', marginTop: '8px' }}>
                                            ✓ Verified Business
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Link to={`/business/${biz._id}`} className="view-link">View Profile</Link>
                                        <Link to={`/business/reviews/${biz._id}`} className="view-link" style={{ color: '#008751', textDecoration: 'none', marginLeft: '10px' }}>
                                            <MessageCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />
                                            Reviews
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pending Claims */}
                        {dashboardData.claims.length > 0 && (
                            <div className="pending-claims-section">
                                <h2>Claim Requests</h2>
                                <div className="claims-list">
                                    {dashboardData.claims.map(claim => (
                                        <div key={claim._id} className="claim-item">
                                            <span>Request for: <strong>{claim.business?.name}</strong></span>
                                            <span className={`status-badge ${claim.status}`}>
                                                {claim.status === 'pending' && 'Pending Approval'}
                                                {claim.status === 'approved' && 'Approved'}
                                                {claim.status === 'rejected' && 'Rejected'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BusinessDashboard;

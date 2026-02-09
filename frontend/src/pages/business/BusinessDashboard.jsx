import React, { useEffect, useState } from 'react';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, LogOut, Loader2, PlusCircle, Building2, Settings, MessageCircle, Camera, Star, Eye, MousePointer2, Heart } from 'lucide-react';
import VerifiedBadge from '../../components/VerifiedBadge';
import SubscriptionCard from '../../components/SubscriptionCard';
import UpgradeModal from '../../components/UpgradeModal';
import UpgradeRequestStatus from '../../components/UpgradeRequestStatus';
import './BusinessDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001/api' : 'https://naijatrust-production-api.onrender.com/api');

const BusinessDashboard = () => {
    const { businessUser, logout, loading, token } = useBusinessAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedBusinessForUpgrade, setSelectedBusinessForUpgrade] = useState(null);
    const [uploadingLogoFor, setUploadingLogoFor] = useState(null);

    const handleLogoUpload = async (e, businessId) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingLogoFor(businessId);
        try {
            const formData = new FormData();
            formData.append('logo', file);

            const response = await fetch(`${API_BASE_URL}/business-portal/upload-logo/${businessId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.status === 'success') {
                setDashboardData(prev => ({
                    ...prev,
                    businesses: prev.businesses.map(biz =>
                        biz._id === businessId ? { ...biz, logo: data.data.logo } : biz
                    )
                }));
            } else {
                alert(data.message || 'Logo upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload logo');
        } finally {
            setUploadingLogoFor(null);
        }
    };

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
            <header className="premium-header">
                <div className="header-container">
                    <div className="header-left">
                        <Link to="/business/dashboard" className="header-logo">
                            <div className="logo-icon">NT</div>
                            <h1>Business Portal</h1>
                        </Link>
                        <nav className="header-nav">
                            <Link to="/business/dashboard" className="nav-item active">Overview</Link>
                            <Link to="/business/reviews" className="nav-item">Reviews</Link>
                            <Link to="/business/analytics" className="nav-item">Analytics</Link>
                        </nav>
                    </div>

                    <div className="header-right">
                        <div className="user-profile-widget">
                            <div className="user-info">
                                <span className="user-name">{businessUser.name}</span>
                                <span className="user-role">Business Owner</span>
                            </div>
                            <div className="user-avatar-placeholder">
                                {businessUser.name?.charAt(0) || 'B'}
                            </div>
                            <div className="user-dropdown-menu">
                                <Link to="/business/settings" className="dropdown-item">
                                    <Settings size={16} />
                                    Settings
                                </Link>
                                <button onClick={logout} className="dropdown-item logout">
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
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
                    <div className="dashboard-grid-layout">
                        <div className="dashboard-main">
                            <div className="stats-grid">
                                <Link to="/business/reviews" className="stat-card hover-card">
                                    <div className="stat-icon-wrapper rating">
                                        <Star size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <h3>Avg Rating</h3>
                                        <div className="value">{dashboardData.stats.avgRating}</div>
                                    </div>
                                </Link>
                                <Link to="/business/reviews" className="stat-card hover-card">
                                    <div className="stat-icon-wrapper reviews">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <h3>Total Reviews</h3>
                                        <div className="value">{dashboardData.stats.totalReviews}</div>
                                    </div>
                                </Link>
                                <Link to="/business/analytics" className="stat-card hover-card">
                                    <div className="stat-icon-wrapper views">
                                        <Eye size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <h3>Profile Views</h3>
                                        <div className="value">{dashboardData.stats.totalViews}</div>
                                    </div>
                                </Link>
                                <Link to="/business/analytics" className="stat-card hover-card">
                                    <div className="stat-icon-wrapper clicks">
                                        <MousePointer2 size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <h3>Web Clicks</h3>
                                        <div className="value">{dashboardData.stats.totalClicks}</div>
                                    </div>
                                </Link>
                                <div className="stat-card hover-card">
                                    <div className="stat-icon-wrapper likes" style={{ background: '#fee2e2', color: '#ef4444' }}>
                                        <Heart size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <h3>Total Likes</h3>
                                        <div className="value">{dashboardData.stats.totalLikes || 0}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="section-header" id="my-businesses">
                                <h2>My Businesses</h2>
                                <div className="header-actions">
                                    <Link to="/business/claim/search" className="btn btn-sm btn-outline">
                                        Claim Business
                                    </Link>
                                    <Link to="/business/register" className="btn btn-sm btn-primary">
                                        <PlusCircle size={16} /> Add New
                                    </Link>
                                </div>
                            </div>

                            <div className="businesses-grid">
                                {dashboardData.businesses.map(biz => (
                                    <div key={biz._id} className="business-card-item">
                                        <div className="biz-card-header">
                                            <div className="biz-logo-wrapper">
                                                <img
                                                    src={biz.logo || `https://ui-avatars.com/api/?name=${biz.name}&background=random`}
                                                    alt={biz.name}
                                                />
                                                <label htmlFor={`logo-upload-${biz._id}`} className="logo-upload-overlay">
                                                    {uploadingLogoFor === biz._id ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                                                    <input type="file" id={`logo-upload-${biz._id}`} hidden accept="image/*" onChange={(e) => handleLogoUpload(e, biz._id)} disabled={uploadingLogoFor === biz._id} />
                                                </label>
                                            </div>
                                            <div className="biz-title-info">
                                                <h3>{biz.name}</h3>
                                                <div className="biz-badges">
                                                    <VerifiedBadge isVerified={biz.isVerified} size="small" showText={false} />
                                                    <span className={`tier-badge ${biz.subscriptionTier || 'basic'}`}>
                                                        {(biz.subscriptionTier || 'basic').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="biz-loc">{biz.location}</p>
                                        <div className="biz-stats-row">
                                            <span><strong>{biz.rating}</strong> ★</span>
                                            <span className="dot"></span>
                                            <span><strong>{biz.reviewCount}</strong> Reviews</span>
                                        </div>
                                        <div className="biz-actions">
                                            <Link to={`/business/${biz._id}`} className="action-link secondary">View Profile</Link>
                                            <Link to={`/business/reviews/${biz._id}`} className="action-link primary">
                                                <MessageCircle size={16} /> Manage Reviews
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <aside className="dashboard-sidebar">
                            <div className="sidebar-section">
                                <h3>Subscription</h3>
                                {dashboardData.businesses.length > 0 && (
                                    <>
                                        <SubscriptionCard
                                            business={dashboardData.businesses[0]}
                                            onUpgrade={() => {
                                                setSelectedBusinessForUpgrade(dashboardData.businesses[0]);
                                                setShowUpgradeModal(true);
                                            }}
                                        />
                                        <UpgradeRequestStatus businessId={dashboardData.businesses[0]._id} />
                                    </>
                                )}
                            </div>

                            <div className="sidebar-section metrics-summary">
                                <h3>Account Statistics</h3>
                                <div className="mini-stat">
                                    <Building2 size={16} />
                                    <span>Total Businesses: <strong>{dashboardData.stats.totalBusinesses}</strong></span>
                                </div>
                            </div>

                            {dashboardData.claims.length > 0 && (
                                <div className="sidebar-section pending-claims-section-sidebar">
                                    <h3>Claim Requests</h3>
                                    <div className="claims-list">
                                        {dashboardData.claims.map(claim => (
                                            <div key={claim._id} className="claim-item">
                                                <span><strong>{claim.business?.name}</strong></span>
                                                <span className={`status-badge ${claim.status}`}>
                                                    {claim.status === 'pending' ? 'Pending' : claim.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                )}
            </main>

            {selectedBusinessForUpgrade && (
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => {
                        setShowUpgradeModal(false);
                        setSelectedBusinessForUpgrade(null);
                    }}
                    currentTier={selectedBusinessForUpgrade.subscriptionTier || 'basic'}
                    businessId={selectedBusinessForUpgrade._id}
                    onSuccess={() => {
                        fetchDashboardData();
                    }}
                />
            )}
        </div>
    );
};

export default BusinessDashboard;

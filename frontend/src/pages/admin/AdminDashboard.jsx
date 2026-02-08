
import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { LayoutDashboard, Users, FileText, Settings, User, LogOut, Loader2, Building2, Star, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './AdminDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const AdminDashboard = () => {
    const { token, loading } = useAdminAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pendingClaims: 0,
        totalBusinesses: 0,
        activeBusinessUsers: 0,
        recentClaims: []
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (!loading && !token) {
            navigate('/admin/login');
        }
    }, [loading, token, navigate]);

    useEffect(() => {
        if (token) {
            fetchStats();
        }
    }, [token]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    if (loading || loadingStats) {
        return <div className="loading-screen">Loading dashboard...</div>;
    }

    return (
        <div className="admin-layout">
            <AdminHeader />

            <main className="admin-container">
                <header className="page-header">
                    <h1>Dashboard Overview</h1>
                    <p>Welcome back, Admin.</p>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="icon-wrapper pending">
                            <Clock size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.pendingClaims}</h3>
                            <p>Pending Claims</p>
                            <Link to="/admin/claims" className="stat-link">Review Queue →</Link>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="icon-wrapper businesses">
                            <FileText size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.totalBusinesses}</h3>
                            <p>Total Businesses</p>
                            <Link to="/admin/businesses" className="stat-link">View All →</Link>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="icon-wrapper users">
                            <Users size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.activeBusinessUsers}</h3>
                            <p>Active Owners</p>
                            <Link to="/admin/claims?status=approved" className="stat-link">View Owners →</Link>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="icon-wrapper businesses">
                            <User size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Users</h3>
                            <p>Manage Users</p>
                            <Link to="/admin/users" className="stat-link">View All →</Link>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="icon-wrapper delete-req">
                            <AlertCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>Deletions</h3>
                            <p>Account Deletions</p>
                            <Link to="/admin/deletions" className="stat-link">View Requests →</Link>
                        </div>
                    </div>
                </div>

                <div className="recent-activity-section">
                    <h2>Recent Claims</h2>
                    {stats.recentClaims.length > 0 ? (
                        <div className="activity-list">
                            {stats.recentClaims.map(claim => (
                                <div key={claim._id} className="activity-item">
                                    <div className="activity-icon">
                                        <FileText size={16} />
                                    </div>
                                    <div className="activity-details">
                                        <p className="activity-title">
                                            <strong>{claim.user?.name}</strong> requested to claim <strong>{claim.business?.name}</strong>
                                        </p>
                                        <span className="activity-time">
                                            {new Date(claim.submittedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <Link to={`/admin/claims?id=${claim._id}`} className="view-btn">View</Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-activity">No recent claims.</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;

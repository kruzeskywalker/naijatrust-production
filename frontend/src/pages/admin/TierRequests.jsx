import React, { useState, useEffect } from 'react';
import { Filter, Search, RefreshCw, TrendingUp } from 'lucide-react';
import TierRequestCard from '../../components/admin/TierRequestCard';
import './TierRequests.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const TierRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'pending',
        tier: '',
        search: ''
    });
    const [stats, setStats] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, [filters, pagination.page]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(filters.status && { status: filters.status }),
                ...(filters.tier && { tier: filters.tier }),
                ...(filters.search && { search: filters.search })
            });

            const response = await fetch(`${API_BASE_URL}/admin/tier-requests?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setRequests(data.data.requests);
                setPagination(prev => ({
                    ...prev,
                    total: data.data.pagination.total,
                    pages: data.data.pagination.pages
                }));
            }
        } catch (error) {
            console.error('Error fetching tier requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/admin/tier-requests/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    };

    const handleRefresh = () => {
        fetchRequests();
        fetchStats();
    };

    return (
        <div className="tier-requests-page">
            <div className="page-header">
                <div>
                    <h1>Tier Upgrade Requests</h1>
                    <p>Review and manage business tier upgrade requests</p>
                </div>
                <button className="refresh-btn" onClick={handleRefresh}>
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon pending">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Pending</span>
                            <span className="stat-value">{stats.byStatus?.pending || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon approved">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Approved</span>
                            <span className="stat-value">{stats.byStatus?.approved || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon rejected">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Rejected</span>
                            <span className="stat-value">{stats.byStatus?.rejected || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon recent">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Recent (7 days)</span>
                            <span className="stat-value">{stats.recentCount || 0}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>
                        <Filter size={16} />
                        Status
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>
                        <Filter size={16} />
                        Tier
                    </label>
                    <select
                        value={filters.tier}
                        onChange={(e) => handleFilterChange('tier', e.target.value)}
                    >
                        <option value="">All Tiers</option>
                        <option value="verified">Verified</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                </div>

                <div className="filter-group search-group">
                    <label>
                        <Search size={16} />
                        Search
                    </label>
                    <input
                        type="text"
                        placeholder="Search by business name..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>
            </div>

            {/* Requests List */}
            <div className="requests-section">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="empty-state">
                        <TrendingUp size={48} color="#CBD5E0" />
                        <h3>No Requests Found</h3>
                        <p>No tier upgrade requests match your filters</p>
                    </div>
                ) : (
                    <>
                        <div className="requests-list">
                            {requests.map(request => (
                                <TierRequestCard
                                    key={request._id}
                                    request={request}
                                    onUpdate={handleRefresh}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                >
                                    Previous
                                </button>
                                <span>
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.pages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TierRequests;

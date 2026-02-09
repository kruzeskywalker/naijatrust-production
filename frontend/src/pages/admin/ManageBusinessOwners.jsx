import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Link } from 'react-router-dom';
import { Search, Loader2, Ban, CheckCircle, AlertTriangle, UserX, Calendar, ArrowLeft, Building2, ChevronDown, ChevronUp, Mail, Phone, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import './ManageUsers.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const ManageBusinessOwners = () => {
    const { token } = useAdminAuth();
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [processingId, setProcessingId] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        if (token) fetchBusinessOwners();
    }, [token, searchTerm, filter]);

    const fetchBusinessOwners = async () => {
        try {
            let query = `?search=${encodeURIComponent(searchTerm)}`;
            if (filter !== 'all') query += `&status=${filter}`;

            const response = await fetch(`${API_BASE_URL}/admin/business-owners${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.status === 'success') {
                setOwners(data.data.businessOwners);
            }
        } catch (error) {
            console.error('Error fetching business owners:', error);
            toast.error('Failed to load business owners');
        } finally {
            setLoading(false);
        }
    };

    const toggleSuspendStatus = async (ownerId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unsuspend' : 'suspend'} this business owner?`)) return;

        setProcessingId(ownerId);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/business-owners/${ownerId}/suspend`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isSuspended: !currentStatus })
            });
            const data = await response.json();

            if (data.status === 'success') {
                toast.success(data.message);
                setOwners(owners.map(o =>
                    o._id === ownerId ? { ...o, isSuspended: !currentStatus } : o
                ));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error toggling suspend status:', error);
            toast.error('Failed to update owner status');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBusinessOwners();
    };

    const getAccountStatus = (owner) => {
        if (owner.isSuspended) return { label: 'Suspended', class: 'blocked' };
        if (!owner.isEmailVerified) return { label: 'Email Pending', class: 'pending' };
        if (!owner.isAdminVerified) return { label: 'Awaiting Approval', class: 'pending' };
        return { label: 'Active', class: 'active' };
    };

    if (loading && owners.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                <Loader2 className="animate-spin mb-4 text-green-600" size={40} />
                <p>Loading business owners...</p>
            </div>
        );
    }

    return (
        <div className="manage-users">
            <header className="page-header mb-6">
                <Link to="/admin/dashboard" className="back-link-admin">
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-800 mt-2">Business Owners</h1>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Manage registered business owners and their claimed businesses
                </p>
            </header>

            <div className="filters-bar">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or company..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </form>

                <select
                    className="filter-select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended</option>
                    <option value="verified">Fully Verified</option>
                    <option value="pending">Pending Verification</option>
                </select>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Owner Profile</th>
                            <th>Businesses</th>
                            <th>Role</th>
                            <th>Account Status</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {owners.length === 0 ? (
                            <tr>
                                <td colSpan="6">
                                    <div className="empty-state">
                                        <UserX className="empty-icon mx-auto" />
                                        <h3>No business owners found</h3>
                                        <p>Try adjusting your search or filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            owners.map(owner => {
                                const status = getAccountStatus(owner);
                                const isExpanded = expandedRow === owner._id;

                                return (
                                    <React.Fragment key={owner._id}>
                                        <tr>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', color: 'white' }}>
                                                        {owner.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="user-info">
                                                        <h4>{owner.name}</h4>
                                                        <span>{owner.email}</span>
                                                        {owner.businessEmail && owner.businessEmail !== owner.email && (
                                                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#a0aec0' }}>
                                                                <Briefcase size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                                {owner.businessEmail}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {owner.claimedBusinesses && owner.claimedBusinesses.length > 0 ? (
                                                    <button
                                                        onClick={() => setExpandedRow(isExpanded ? null : owner._id)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            background: '#f0fff4',
                                                            border: '1px solid #9ae6b4',
                                                            borderRadius: '8px',
                                                            padding: '0.4rem 0.75rem',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            color: '#276749',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        <Building2 size={14} />
                                                        {owner.claimedBusinesses.length} Business{owner.claimedBusinesses.length > 1 ? 'es' : ''}
                                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    </button>
                                                ) : (
                                                    <span style={{ color: '#a0aec0', fontSize: '0.85rem' }}>No businesses</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="role-badge">{owner.position || 'Owner'}</span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${status.class}`}>
                                                    {status.class === 'active' && <CheckCircle size={12} />}
                                                    {status.class === 'blocked' && <Ban size={12} />}
                                                    {status.class === 'pending' && <AlertTriangle size={12} />}
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="date-cell">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {new Date(owner.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    className={`action-btn ${owner.isSuspended ? 'unblock-btn' : 'block-btn'}`}
                                                    onClick={() => toggleSuspendStatus(owner._id, owner.isSuspended)}
                                                    disabled={processingId === owner._id}
                                                    title={owner.isSuspended ? 'Restore Access' : 'Suspend Account'}
                                                >
                                                    {processingId === owner._id ? (
                                                        <Loader2 className="animate-spin" size={16} />
                                                    ) : owner.isSuspended ? (
                                                        <><CheckCircle size={16} /> Unsuspend</>
                                                    ) : (
                                                        <><Ban size={16} /> Suspend</>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expanded row for businesses */}
                                        {isExpanded && owner.claimedBusinesses && owner.claimedBusinesses.length > 0 && (
                                            <tr>
                                                <td colSpan="6" style={{ background: '#f7fafc', padding: '1rem 2rem' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                                        {owner.claimedBusinesses.map(biz => (
                                                            <div key={biz._id} style={{
                                                                background: 'white',
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: '10px',
                                                                padding: '1rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '1rem'
                                                            }}>
                                                                <div style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '8px',
                                                                    background: biz.isVerified ? 'linear-gradient(135deg, #48bb78, #38a169)' : '#e2e8f0',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: biz.isVerified ? 'white' : '#718096'
                                                                }}>
                                                                    <Building2 size={20} />
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#2d3748' }}>
                                                                        {biz.name}
                                                                        {biz.isVerified && (
                                                                            <CheckCircle size={14} style={{ marginLeft: '6px', color: '#38a169', display: 'inline' }} />
                                                                        )}
                                                                    </h4>
                                                                    <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '2px' }}>
                                                                        {biz.category} • {biz.location}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '4px' }}>
                                                                        Tier: <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{biz.subscriptionTier || 'Basic'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageBusinessOwners;

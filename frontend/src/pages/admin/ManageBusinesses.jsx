import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { Building2, Search, ShieldCheck, ShieldOff, Loader2, Edit, Filter, PlusCircle, X, Trash2, Pencil, Check } from 'lucide-react';
import VerifiedBadge from '../../components/VerifiedBadge';
import { BUSINESS_CATEGORIES } from '../../utils/constants';
import './ManageBusinesses.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const ManageBusinesses = () => {
    const { token, loading } = useAdminAuth();
    const navigate = useNavigate();
    const [businesses, setBusinesses] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [businessToDelete, setBusinessToDelete] = useState(null);
    const [adminPassword, setAdminPassword] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [newBusiness, setNewBusiness] = useState({
        name: '', category: '', location: '', description: '', website: '', phone: '', email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && !token) {
            navigate('/admin/login');
        }
    }, [loading, token, navigate]);

    useEffect(() => {
        if (token) {
            fetchBusinesses();
        }
    }, [token, filter]);

    const fetchBusinesses = async () => {
        setIsLoadingData(true);
        try {
            let url = `${API_BASE_URL}/admin/businesses?`;
            if (filter === 'verified') url += 'verified=true';
            if (filter === 'unverified') url += 'verified=false';
            if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setBusinesses(data.data.businesses);
            }
        } catch (error) {
            console.error('Error fetching businesses:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleVerificationToggle = async (businessId, currentStatus) => {
        setProcessing(businessId);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/businesses/${businessId}/verify`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isVerified: !currentStatus })
            });

            const data = await response.json();
            if (data.status === 'success') {
                // Update local state
                setBusinesses(businesses.map(biz =>
                    biz._id === businessId
                        ? { ...biz, isVerified: !currentStatus }
                        : biz
                ));
            } else {
                alert(data.message || 'Failed to update verification status');
            }
        } catch (error) {
            console.error('Error toggling verification:', error);
            alert('Failed to update verification status');
        } finally {
            setProcessing(null);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBusinesses();
    };

    const handleEditBusiness = (business) => {
        setNewBusiness({
            id: business._id,
            name: business.name,
            category: business.category,
            location: business.location,
            description: business.description || '',
            website: business.website || '',
            phone: business.phone || '',
            email: business.email || ''
        });
        setIsEditing(true);
        setShowAddModal(true);
    };

    const handleDeleteClick = (business) => {
        setBusinessToDelete(business);
        setAdminPassword('');
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async (e) => {
        e.preventDefault();
        if (!adminPassword) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/businesses/${businessToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: adminPassword })
            });

            const data = await response.json();

            if (data.status === 'success') {
                setShowDeleteModal(false);
                setBusinessToDelete(null);
                setAdminPassword('');
                fetchBusinesses();
                alert('Business deleted successfully');
            } else {
                alert(data.message || 'Failed to delete business');
            }
        } catch (error) {
            console.error('Error deleting business:', error);
            alert('Error deleting business');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddBusiness = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = isEditing
                ? `${API_BASE_URL}/admin/businesses/${newBusiness.id}/update`
                : `${API_BASE_URL}/admin/businesses`;

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newBusiness)
            });
            const data = await response.json();
            if (data.status === 'success') {
                setShowAddModal(false);
                setNewBusiness({ name: '', category: '', location: '', description: '', website: '', phone: '', email: '' });
                setIsEditing(false);
                fetchBusinesses(); // Refresh list
                alert(isEditing ? 'Business updated successfully' : 'Business added successfully');
            } else {
                alert(data.message || 'Failed to save business');
            }
        } catch (error) {
            console.error('Error saving business:', error);
            alert('Error saving business');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-layout">
            <AdminHeader />

            <main className="admin-container">
                <div className="page-header">
                    <div>
                        <h1>Manage Businesses</h1>
                        <p>View and manage all businesses on the platform</p>
                    </div>
                    <button className="btn-add-business" onClick={() => { setIsEditing(false); setNewBusiness({ name: '', category: '', location: '', description: '', website: '', phone: '', email: '' }); setShowAddModal(true); }}>
                        <PlusCircle size={20} /> Add Business
                    </button>
                </div>

                <div className="controls-bar">
                    <form onSubmit={handleSearch} className="search-form">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search businesses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="btn-search">Search</button>
                    </form>

                    <div className="filter-tabs">
                        <button
                            className={`tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`tab ${filter === 'verified' ? 'active' : ''}`}
                            onClick={() => setFilter('verified')}
                        >
                            Verified
                        </button>
                        <button
                            className={`tab ${filter === 'unverified' ? 'active' : ''}`}
                            onClick={() => setFilter('unverified')}
                        >
                            Unverified
                        </button>
                    </div>
                </div>

                {isLoadingData ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={32} />
                        <p>Loading businesses...</p>
                    </div>
                ) : businesses.length > 0 ? (
                    <div className="businesses-table-container">
                        <table className="businesses-table">
                            <thead>
                                <tr>
                                    <th>Business</th>
                                    <th>Category</th>
                                    <th>Location</th>
                                    <th>Owner</th>
                                    <th>Status</th>
                                    <th>Verification</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {businesses.map(biz => (
                                    <tr key={biz._id}>
                                        <td>
                                            <div className="biz-cell">
                                                <strong>{biz.name}</strong>
                                                {biz.isVerified && <VerifiedBadge isVerified={true} size="small" showText={false} />}
                                            </div>
                                        </td>
                                        <td>{biz.category}</td>
                                        <td>{biz.location}</td>
                                        <td>
                                            {biz.owner ? (
                                                <div className="owner-cell">
                                                    <span>{biz.owner.name}</span>
                                                    <small>{biz.owner.email}</small>
                                                </div>
                                            ) : (
                                                <span className="text-muted">Unclaimed</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-pill ${biz.claimStatus}`}>
                                                {biz.claimStatus}
                                            </span>
                                        </td>
                                        <td>
                                            {biz.isVerified ? (
                                                <div className="verified-info">
                                                    <ShieldCheck size={16} color="#059669" />
                                                    <span className="text-success">Verified</span>
                                                    {biz.verifiedAt && (
                                                        <small>{new Date(biz.verifiedAt).toLocaleDateString()}</small>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted">Not Verified</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon edit"
                                                    onClick={() => handleEditBusiness(biz)}
                                                    title="Edit Business"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    className={`btn-toggle ${biz.isVerified ? 'verified' : 'unverified'}`}
                                                    onClick={() => handleVerificationToggle(biz._id, biz.isVerified)}
                                                    disabled={processing === biz._id}
                                                    title={biz.isVerified ? 'Unverify' : 'Verify'}
                                                >
                                                    {processing === biz._id ? (
                                                        <Loader2 className="animate-spin" size={14} />
                                                    ) : biz.isVerified ? (
                                                        <><ShieldOff size={14} /> Unverify</>
                                                    ) : (
                                                        <><ShieldCheck size={14} /> Verify</>
                                                    )}
                                                </button>
                                                <button
                                                    className="btn-icon delete"
                                                    onClick={() => handleDeleteClick(biz)}
                                                    title="Delete Business"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <Building2 size={48} />
                        <h3>No businesses found</h3>
                        <p>Try adjusting your filters or search criteria.</p>
                    </div>
                )}
            </main>

            {/* Add Business Modal */}
            {
                showAddModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>{isEditing ? 'Edit Business' : 'Add New Business'}</h2>
                                <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleAddBusiness} className="add-business-form">
                                <div className="form-group">
                                    <label>Business Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBusiness.name}
                                        onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        required
                                        value={newBusiness.category}
                                        onChange={(e) => setNewBusiness({ ...newBusiness, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {BUSINESS_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Location *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBusiness.location}
                                        onChange={(e) => setNewBusiness({ ...newBusiness, location: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Website</label>
                                        <input
                                            type="url"
                                            value={newBusiness.website}
                                            onChange={(e) => setNewBusiness({ ...newBusiness, website: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={newBusiness.phone}
                                            onChange={(e) => setNewBusiness({ ...newBusiness, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={newBusiness.description}
                                        onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? 'Save Changes' : 'Add Business')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Delete Business</h2>
                            <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleDeleteConfirm} className="add-business-form">
                            <p>Are you sure you want to delete <strong>{businessToDelete?.name}</strong>? This action cannot be undone.</p>

                            <div className="form-group">
                                <label>Enter Admin Password to Confirm</label>
                                <input
                                    type="password"
                                    required
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    placeholder="Admin Password"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ background: '#e53e3e', borderColor: '#e53e3e' }} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Delete Business'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ManageBusinesses;

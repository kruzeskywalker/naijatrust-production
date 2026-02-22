import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Link } from 'react-router-dom';
import { Search, Loader2, Ban, CheckCircle, AlertTriangle, UserX, Calendar, ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/urlUtils';
import './ManageUsers.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001/api' : 'https://naijatrust-production-api.onrender.com/api');

const ManageUsers = () => {
    const { token } = useAdminAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, active, blocked
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        if (token) fetchUsers();
    }, [token, searchTerm, filter]);

    const fetchUsers = async () => {
        try {
            let query = `?search=${encodeURIComponent(searchTerm)}`;
            if (filter === 'blocked') query += '&isBlocked=true';
            if (filter === 'active') query += '&isBlocked=false';

            const response = await fetch(`${API_BASE_URL}/admin/users${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.status === 'success') {
                setUsers(data.data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const toggleBlockStatus = async (userId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this user?`)) return;

        setProcessingId(userId);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/block`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isBlocked: !currentStatus })
            });
            const data = await response.json();

            if (data.status === 'success') {
                toast.success(data.message);
                // Update local state
                setUsers(users.map(u =>
                    u._id === userId ? { ...u, isBlocked: !currentStatus } : u
                ));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error toggling block status:', error);
            toast.error('Failed to update user status');
        } finally {
            setProcessingId(null);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you ABSOLUTELY sure you want to permanently delete this user? This action cannot be undone.')) return;

        setProcessingId(`del-${userId}`);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.status === 'success') {
                toast.success(data.message);
                setUsers(users.filter(u => u._id !== userId));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                <Loader2 className="animate-spin mb-4 text-green-600" size={40} />
                <p>Loading user database...</p>
            </div>
        );
    }

    return (
        <div className="manage-users">
            <header className="page-header mb-6">
                <Link to="/admin/dashboard" className="back-link-admin">
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-800 mt-2">Manage Users</h1>
            </header>

            <div className="filters-bar">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
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
                    <option value="blocked">Blocked Only</option>
                </select>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User Profile</th>
                            <th>Role</th>
                            <th>Account Status</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="5">
                                    <div className="empty-state">
                                        <UserX className="empty-icon mx-auto" />
                                        <h3>No users found</h3>
                                        <p>Try adjusting your search or filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">
                                                {user.avatar ? (
                                                    <img src={getImageUrl(user.avatar)} alt={user.name} />
                                                ) : (
                                                    user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="user-info">
                                                <h4>{user.name}</h4>
                                                <span>{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="role-badge">{user.role}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                                            {user.isBlocked ? <Ban size={12} /> : <CheckCircle size={12} />}
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="date-cell">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className={`action-btn ${user.isBlocked ? 'unblock-btn' : 'block-btn'}`}
                                            onClick={() => toggleBlockStatus(user._id, user.isBlocked)}
                                            disabled={processingId === user._id}
                                            title={user.isBlocked ? 'Restore Access' : 'Suspend Account'}
                                        >
                                            {processingId === user._id ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : user.isBlocked ? (
                                                <>
                                                    <CheckCircle size={16} /> Unblock
                                                </>
                                            ) : (
                                                <>
                                                    <Ban size={16} /> Block User
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="action-btn block-btn"
                                            style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', marginLeft: '8px' }}
                                            onClick={() => deleteUser(user._id)}
                                            disabled={processingId === `del-${user._id}`}
                                            title="Permanently Delete User"
                                        >
                                            {processingId === `del-${user._id}` ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : (
                                                <><Trash2 size={16} /> Delete</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;

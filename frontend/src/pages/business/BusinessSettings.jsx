import React, { useState, useEffect } from 'react';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Building2, Save, Loader2, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import './BusinessSettings.css';
import SubscriptionManagement from './SubscriptionManagement';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5001/api' : 'https://naijatrust-production-api.onrender.com/api');

const BusinessSettings = () => {
    const { businessUser, token, loading, logout, requestDeletion } = useBusinessAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isDeleting, setIsDeleting] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({ name: '', phone: '', position: '' });
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [updatingPw, setUpdatingPw] = useState(false);
    const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!loading && !businessUser) {
            navigate('/business/login');
        } else if (businessUser) {
            setProfile({
                name: businessUser.name || '',
                phone: businessUser.phone || '',
                position: businessUser.position || ''
            });
        }
    }, [loading, businessUser, navigate]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdatingProfile(true);
        setProfileMsg({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/business-auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });
            const data = await response.json();
            if (data.status === 'success') {
                setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
                // Note: AuthContext doesn't auto-reload user unless we refresh or it has a reload method.
                // Ideally we update context state, but for MVP a reload or just message is fine.
            } else {
                setProfileMsg({ type: 'error', text: data.message });
            }
        } catch (err) {
            setProfileMsg({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setPwMsg({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        setUpdatingPw(true);
        setPwMsg({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/business-auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                setPwMsg({ type: 'success', text: 'Password changed successfully' });
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                setPwMsg({ type: 'error', text: data.message });
            }
        } catch (err) {
            setPwMsg({ type: 'error', text: 'Failed to change password' });
        } finally {
            setUpdatingPw(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="settings-page">
            <header className="settings-header">
                <div className="container">
                    <Link to="/business/dashboard" className="back-link">← Back to Dashboard</Link>
                    <h1>Account Settings</h1>
                </div>
            </header>

            <div className="settings-container container">
                <div className="settings-sidebar">
                    <button
                        className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={18} /> Profile
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <Lock size={18} /> Password & Security
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'businesses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('businesses')}
                    >
                        <Building2 size={18} /> My Businesses
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'subscription' ? 'active' : ''}`}
                        onClick={() => setActiveTab('subscription')}
                    >
                        <CreditCard size={18} /> Subscription
                    </button>
                    <button
                        className={`sidebar-item danger-tab ${activeTab === 'deletion' ? 'active' : ''}`}
                        onClick={() => setActiveTab('deletion')}
                    >
                        <AlertCircle size={18} /> Delete Account
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === 'profile' && (
                        <div className="settings-card">
                            <h2>Personal Information</h2>
                            {profileMsg.text && (
                                <div className={`alert ${profileMsg.type}`}>
                                    {profileMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {profileMsg.text}
                                </div>
                            )}
                            <form onSubmit={handleProfileUpdate}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={profile.name}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        value={profile.phone}
                                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Job Position</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={profile.position}
                                        onChange={e => setProfile({ ...profile, position: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={businessUser?.email}
                                        disabled
                                        title="Contact support to change email"
                                    />
                                    <small className="text-gray-500">Email cannot be changed directly.</small>
                                </div>

                                <button type="submit" className="save-btn" disabled={updatingProfile}>
                                    {updatingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-card">
                            <h2>Change Password</h2>
                            {pwMsg.text && (
                                <div className={`alert ${pwMsg.type}`}>
                                    {pwMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {pwMsg.text}
                                </div>
                            )}
                            <form onSubmit={handlePasswordChange}>
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        required
                                        value={passwords.current}
                                        onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        required
                                        value={passwords.new}
                                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        required
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="save-btn" disabled={updatingPw}>
                                    {updatingPw ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Update Password
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'businesses' && (
                        <div className="settings-card">
                            <h2>My Businesses</h2>
                            <p className="mb-4 text-gray-600">You can manage, edit, and view analytics for your businesses from the Dashboard.</p>

                            {businessUser?.claimedBusinesses?.length > 0 ? (
                                <div className="biz-list-settings">
                                    {/* 
                                        Note: claimedBusinesses might be just IDs if not populated in context user object.
                                        Ideally useBusinessAuth should use 'me' endpoint which populates it. 
                                        If it's just IDs, we might need to fetch detailed list here or link to dashboard.
                                        For safety, assuming it might be IDs or simple objects.
                                    */}
                                    <p>You have {businessUser.claimedBusinesses.length} business(es).</p>
                                    <Link to="/business/dashboard" className="btn-primary-link">
                                        Go to Dashboard to Manage
                                    </Link>
                                </div>
                            ) : (
                                <div className="empty-biz">
                                    <p>You haven't claimed any businesses yet.</p>
                                    <div className="mt-4 space-x-4">
                                        <Link to="/business/claim/search" className="text-green-600 hover:underline">Claim Existing</Link>
                                        <Link to="/business/register" className="text-green-600 hover:underline">Register New</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'subscription' && (
                        <SubscriptionManagement />
                    )}

                    {activeTab === 'deletion' && (
                        <div className="settings-card danger-zone-v2-biz">
                            <div className="danger-header">
                                <div className="danger-icon-wrapper">
                                    <AlertCircle size={32} />
                                </div>
                                <h2>Delete Business Account</h2>
                                <div className="danger-divider"></div>
                            </div>

                            <div className="danger-body">
                                <p className="description-text">
                                    Request deletion of your business account. This will unclaim all your businesses, making them available for others to claim.
                                </p>

                                {businessUser.deletionRequest?.status === 'pending' ? (
                                    <div className="pending-deletion-notice-refined">
                                        <CheckCircle size={24} />
                                        <div>
                                            <h3>Deletion Request Received</h3>
                                            <p>Requested on {new Date(businessUser.deletionRequest.requestedAt).toLocaleDateString()}. Our team is reviewing your request.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const reason = e.target.reason.value;
                                        if (!reason) return alert('Please provide a reason');

                                        if (window.confirm("Are you sure you want to request account deletion? This will eventually remove your access and unclaim your businesses.")) {
                                            setIsDeleting(true);
                                            const result = await requestDeletion(reason);
                                            setIsDeleting(false);
                                            if (!result.success) {
                                                alert(result.message || 'Failed to request deletion');
                                            }
                                        }
                                    }} className="deletion-form-centered">
                                        <div className="form-group">
                                            <label>Reason for Deletion</label>
                                            <textarea
                                                name="reason"
                                                className="form-control-refined"
                                                placeholder="Please let us know why you'd like to leave..."
                                                rows="3"
                                                required
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn-danger-refined-biz" disabled={isDeleting}>
                                            {isDeleting ? <Loader2 className="animate-spin" size={18} /> : 'Request Account Deletion'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessSettings;

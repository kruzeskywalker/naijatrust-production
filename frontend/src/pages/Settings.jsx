import React, { useState } from 'react';
import { Camera, Mail, Lock, User, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const Settings = () => {
    const { user, updateProfile, changePassword, updateAvatar, deleteAccount } = useAuth();

    // Profile State
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profileEmail, setProfileEmail] = useState(user?.email || '');
    const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // Password State
    const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' });
    const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    // Photo State
    const [isPhotoLoading, setIsPhotoLoading] = useState(false);

    // Custom Deletion Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!user) return <div className="container" style={{ padding: '4rem' }}>Please log in to access settings.</div>;

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileStatus({ type: '', message: '' });
        setIsProfileLoading(true);

        const result = await updateProfile(profileName, profileEmail);
        setIsProfileLoading(false);

        if (result.success) {
            setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
        } else {
            setProfileStatus({ type: 'error', message: result.message || 'Failed to update profile.' });
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordStatus({ type: '', message: '' });

        if (passwordData.next !== passwordData.confirm) {
            return setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
        }

        setIsPasswordLoading(true);
        const result = await changePassword(passwordData.current, passwordData.next);
        setIsPasswordLoading(false);

        if (result.success) {
            setPasswordStatus({ type: 'success', message: 'Password changed successfully!' });
            setPasswordData({ current: '', next: '', confirm: '' });
        } else {
            setPasswordStatus({ type: 'error', message: result.message || 'Failed to change password.' });
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsPhotoLoading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const token = localStorage.getItem('naijaTrustToken');
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

            const response = await fetch(`${API_BASE}/auth/upload-avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.status === 'success') {
                await updateAvatar(data.data.user.avatar);
                window.location.reload();
            } else {
                alert(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred during upload.');
        } finally {
            setIsPhotoLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        const result = await deleteAccount();
        if (result.success) {
            window.location.href = '/';
        } else {
            alert(result.message || 'Failed to delete account.');
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="settings-page container">
            <header className="settings-header">
                <h1>Settings</h1>
                <p>Manage your account settings and preferences.</p>
            </header>

            <div className="settings-grid">
                {/* Profile Section */}
                <section className="settings-card">
                    <div className="card-header">
                        <User size={20} />
                        <h2>Profile Information</h2>
                    </div>

                    <div className="profile-photo-upload">
                        <div className="avatar-wrapper">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} />
                            ) : (
                                <div className="avatar-placeholder">{user.name[0]}</div>
                            )}
                            {isPhotoLoading && <div className="upload-overlay"><Loader2 className="animate-spin" /></div>}
                        </div>
                        <div className="upload-btn-wrapper">
                            <button className="btn btn-outline btn-sm">
                                <Camera size={16} /> Change Photo
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isPhotoLoading} />
                            </button>
                            <p className="hint">JPG or PNG. Max size 2MB.</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="settings-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={profileEmail}
                                onChange={(e) => setProfileEmail(e.target.value)}
                                required
                            />
                        </div>

                        {profileStatus.message && (
                            <div className={`status-alert ${profileStatus.type}`}>
                                {profileStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {profileStatus.message}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={isProfileLoading}>
                            {isProfileLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </form>
                </section>

                {/* Password Section */}
                <section className="settings-card">
                    <div className="card-header">
                        <Lock size={20} />
                        <h2>Change Password</h2>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="settings-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.current}
                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.next}
                                onChange={(e) => setPasswordData({ ...passwordData, next: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                required
                            />
                        </div>

                        {passwordStatus.message && (
                            <div className={`status-alert ${passwordStatus.type}`}>
                                {passwordStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {passwordStatus.message}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={isPasswordLoading}>
                            {isPasswordLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                            Update Password
                        </button>
                    </form>
                </section>

                {/* Account Deletion Section */}
                <section className="settings-card danger-zone-v2">
                    <div className="danger-header">
                        <div className="danger-icon-wrapper">
                            <AlertCircle size={32} />
                        </div>
                        <h2>Danger Zone</h2>
                        <div className="danger-divider"></div>
                    </div>
                    <div className="danger-body">
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="btn-danger-refined"
                        >
                            Delete Account
                        </button>
                    </div>
                </section>
            </div>

            {/* Account Deletion Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => !isDeleting && setShowDeleteModal(false)}>
                    <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ color: '#dc2626' }}>Delete Account?</h3>
                        </div>
                        <div className="modal-body" style={{ textAlign: 'left' }}>
                            <p style={{ marginBottom: '1rem', lineHeight: '1.6', color: '#4b5563' }}>
                                Are you absolutely sure you want to delete your account?
                            </p>
                            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', color: '#4b5563', fontSize: '0.95rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>This action cannot be undone.</li>
                                <li style={{ marginBottom: '0.5rem' }}>You will lose all your profile data and saved settings.</li>
                                <li style={{ marginBottom: '0.5rem' }}>Your review history will remain recorded for administrative purposes.</li>
                            </ul>
                            <p style={{ fontWeight: '600', color: '#1a1a1a' }}>
                                This will also unclaim all your businesses.
                            </p>
                        </div>
                        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: '0' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                style={{ border: '1px solid #e2e8f0', color: '#4b5563' }}
                            >
                                No, Keep Account
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                style={{ backgroundColor: '#ef4444', color: 'white' }}
                            >
                                {isDeleting ? (
                                    <><Loader2 className="animate-spin" size={16} /> Deleting...</>
                                ) : (
                                    'Yes, Delete My Account'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

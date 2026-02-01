import React, { useState } from 'react';
import { Camera, Mail, Lock, User, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const Settings = () => {
    const { user, updateProfile, changePassword, updateAvatar } = useAuth();

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

        // Simulated upload: in a real app, you'd upload to a server/S3
        setIsPhotoLoading(true);

        // Mocking a delay and then using a local URL or placeholder
        setTimeout(async () => {
            const mockUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`;
            const result = await updateAvatar(mockUrl);
            setIsPhotoLoading(false);
            if (result.success) {
                alert('Profile photo updated!');
            }
        }, 1500);
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
            </div>
        </div>
    );
};

export default Settings;

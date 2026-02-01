import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Loader2 } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
    const { login } = useAdminAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-logo">
                    <Shield size={48} className="text-gray-800" />
                    <h1>Admin Portal</h1>
                </div>

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="admin@naijatrust.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="admin-login-btn" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
                        Access Portal
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;

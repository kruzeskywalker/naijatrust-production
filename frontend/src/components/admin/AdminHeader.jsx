import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, Users, LogOut, Menu, X } from 'lucide-react';
import './AdminHeader.css';

const AdminHeader = () => {
    const { logout, admin } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <header className="admin-header">
            <div className="admin-header-container">
                <div className="admin-brand">
                    <Shield size={24} className="text-green-500" />
                    <span className="brand-name">NaijaTrust Admin</span>
                </div>

                <button
                    className="admin-mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <nav className={`admin-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`}>
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link to="/admin/claims" className={`nav-link ${isActive('/admin/claims')}`}>
                        <FileText size={18} /> Claims & Requests
                    </Link>
                    <Link to="/admin/businesses" className={`nav-link ${isActive('/admin/businesses')}`}>
                        <Users size={18} /> Manage Businesses
                    </Link>
                    <Link to="/admin/reviews" className={`nav-link ${isActive('/admin/reviews')}`}>
                        <FileText size={18} /> Manage Reviews
                    </Link>

                    <div className="nav-divider"></div>

                    <div className="admin-user-info">
                        <span className="admin-name">{admin?.name}</span>
                        <span className="admin-role">{admin?.role}</span>
                    </div>

                    <button onClick={handleLogout} className="logout-link">
                        <LogOut size={18} /> Logout
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default AdminHeader;

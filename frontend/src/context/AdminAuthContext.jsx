import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Validate token and fetch admin profile?
            // For now, we decode or just trust persistence until 401.
            // But let's verify if we have a /me endpoint for admin?
            // adminRoutes.js had /dashboard, effectively acts as a check.
            // Or we just store user data in local storage for MVP.
            const storedAdmin = localStorage.getItem('adminUser');
            if (storedAdmin) {
                setAdmin(JSON.parse(storedAdmin));
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (data.status === 'success') {
                const { token: newToken, admin: adminData } = data.data;
                localStorage.setItem('adminToken', newToken);
                localStorage.setItem('adminUser', JSON.stringify(adminData));
                setToken(newToken);
                setAdmin(adminData);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Admin login error:', error);
            return { success: false, message: 'An error occurred during login' };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setToken(null);
        setAdmin(null);
    };

    const value = {
        admin,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!token
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {!loading && children}
        </AdminAuthContext.Provider>
    );
};

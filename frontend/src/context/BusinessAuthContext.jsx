import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BusinessAuthContext = createContext();

export const useBusinessAuth = () => useContext(BusinessAuthContext);

export const BusinessAuthProvider = ({ children }) => {
    const [businessUser, setBusinessUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('businessToken'));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

    useEffect(() => {
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async (authToken) => {
        try {
            const response = await fetch(`${API_URL}/business-auth/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();

            if (data.status === 'success') {
                setBusinessUser(data.data.user);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Error fetching business user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, authToken) => {
        setToken(authToken);
        setBusinessUser(userData);
        localStorage.setItem('businessToken', authToken);
    };

    const logout = () => {
        setToken(null);
        setBusinessUser(null);
        localStorage.removeItem('businessToken');
        navigate('/business/login');
    };

    const value = {
        businessUser,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!businessUser
    };

    return (
        <BusinessAuthContext.Provider value={value}>
            {!loading && children}
        </BusinessAuthContext.Provider>
    );
};

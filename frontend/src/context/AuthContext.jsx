import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuthApiUrl } from '../utils/urlUtils';

const AuthContext = createContext();

const API_URL = getAuthApiUrl(import.meta.env.VITE_API_URL);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        // Check local storage for persistent session
        const storedToken = localStorage.getItem('naijaTrustToken');
        if (storedToken) {
            setToken(storedToken);
            fetchCurrentUser(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCurrentUser = async (authToken) => {
        try {
            const response = await fetch(`${API_URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data.user);
            } else {
                // Token invalid, clear it
                localStorage.removeItem('naijaTrustToken');
                setToken(null);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name, email, password) => {
        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.data && data.data.requiresOtp) {
                    return { success: true, requiresOtp: true, email: data.data.email, message: data.message };
                }

                const authToken = data.token;
                setToken(authToken);
                setUser(data.data.user);
                localStorage.setItem('naijaTrustToken', authToken);
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                const authToken = data.token;
                setToken(authToken);
                setUser(data.data.user);
                localStorage.setItem('naijaTrustToken', authToken);
                return { success: true };
            } else {
                if (data.data?.requiresOtp) {
                    return { success: false, requiresOtp: true, email: data.data.email, message: data.message };
                }
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const verifyEmail = async (verificationToken) => {
        try {
            const response = await fetch(`${API_URL}/verify-email/${verificationToken}`);
            const data = await response.json();

            if (response.ok) {
                // Update user verification status if logged in
                if (user) {
                    setUser({ ...user, isVerified: true });
                }
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Verification error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const resendVerification = async () => {
        try {
            const response = await fetch(`${API_URL}/resend-verification`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const handleGoogleOAuthCallback = async (authToken) => {
        setToken(authToken);
        localStorage.setItem('naijaTrustToken', authToken);
        await fetchCurrentUser(authToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('naijaTrustToken');
    };

    const initiateGoogleLogin = () => {
        // Redirect to backend Google OAuth endpoint
        window.location.href = `${API_URL}/google`;
    };

    const updateProfile = async (name, email) => {
        try {
            const response = await fetch(`${API_URL}/updateMe`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.data.user);
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            const response = await fetch(`${API_URL}/updatePassword`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                // If password changed successfully, we get back a new token
                const newToken = data.token;
                setToken(newToken);
                localStorage.setItem('naijaTrustToken', newToken);
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const updateAvatar = async (avatarUrl) => {
        try {
            const response = await fetch(`${API_URL}/updateAvatar`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatar: avatarUrl })
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.data.user);
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Update avatar error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const deleteAccount = async () => {
        try {
            const response = await fetch(`${API_URL}/me`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                logout();
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Delete account error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            signup,
            login,
            logout,
            verifyEmail,
            resendVerification,
            initiateGoogleLogin,
            handleGoogleOAuthCallback,
            updateProfile,
            changePassword,
            updateAvatar,
            deleteAccount,
            loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

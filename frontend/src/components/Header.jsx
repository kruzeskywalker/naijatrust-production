import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, LogOut, Loader2, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBusinessAuth } from '../context/BusinessAuthContext';
import './Header.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const Header = () => {
    const { user, logout } = useAuth();
    const { businessUser } = useBusinessAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Live Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced Search Effect
    useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.length < 3) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(`${API_BASE_URL}/businesses?q=${encodeURIComponent(searchQuery)}&limit=5`);
                const data = await response.json();

                if (data.status === 'success') {
                    setSearchResults(data.data.businesses);
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowDropdown(false);
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setIsMenuOpen(false);
    };

    const handleResultClick = (businessId) => {
        setShowDropdown(false);
        setSearchQuery(''); // Optional: clear or keep
        navigate(`/business/${businessId}`);
    };

    return (
        <header className="main-header">
            <div className="container header-content">
                <Link to="/" className="logo-section">
                    <img src="/logo.png" alt="NaijaTrust" className="logo" />
                    <span className="logo-text">NaijaTrust</span>
                </Link>

                <div className="header-search" ref={searchRef}>
                    <form className="search-bar" onSubmit={handleSearchSubmit}>
                        <input
                            name="search"
                            type="text"
                            placeholder="Search for a business..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                                if (searchResults.length > 0) setShowDropdown(true);
                            }}
                            autoComplete="off"
                        />
                        <button type="submit" className="search-btn"><Search size={20} /></button>
                    </form>

                    {/* Live Search Dropdown */}
                    {showDropdown && (searchQuery.length > 2) && (
                        <div className="search-dropdown">
                            {isSearching ? (
                                <div className="search-loading">
                                    <Loader2 className="animate-spin" size={20} /> Studying...
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(biz => (
                                    <div
                                        key={biz._id}
                                        className="search-result-item"
                                        onClick={() => handleResultClick(biz._id)}
                                    >
                                        <div className="search-avatar-mini">{biz.name[0]}</div>
                                        <div className="search-info">
                                            <h4>{biz.name}</h4>
                                            <span>{biz.category}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results-prop">
                                    No results found
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <nav className="header-nav">
                    {businessUser ? (
                        <Link to="/business/dashboard" className="business-link">
                            Business Portal
                        </Link>
                    ) : (
                        <Link to="/business/login" className="business-link">For Businesses</Link>
                    )}
                    <Link to="/categories">Categories</Link>

                    {user ? (
                        <div className="user-nav">
                            <Link to="/dashboard" className="user-profile-summary">
                                <div className="user-avatar-mini">{user.name[0]}</div>
                                <span className="user-name-small">{user.name.split(' ')[0]}</span>
                            </Link>
                            <button onClick={logout} className="logout-btn" title="Log out">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline login-btn">Log in</Link>
                            <Link to="/signup" className="btn btn-primary">Sign up</Link>
                        </>
                    )}
                </nav>

                <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="container">
                    <form className="mobile-search-bar" onSubmit={handleSearchSubmit}>
                        <input
                            name="search"
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit"><Search size={18} /></button>
                    </form>

                    <nav className="mobile-nav-links">
                        {businessUser ? (
                            <Link to="/business/dashboard" onClick={() => setIsMenuOpen(false)} className="business-link-mobile">
                                <Building2 size={18} /> Business Portal
                            </Link>
                        ) : (
                            <Link to="/business/login" onClick={() => setIsMenuOpen(false)}>For Businesses</Link>
                        )}
                        <Link to="/categories" onClick={() => setIsMenuOpen(false)}>Categories</Link>

                        {user ? (
                            <>
                                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="mobile-user-link">
                                    <User size={18} /> My Dashboard
                                </Link>
                                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="mobile-logout-btn">
                                    <LogOut size={18} /> Log out
                                </button>
                            </>
                        ) : (
                            <div className="mobile-auth-buttons">
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn btn-outline">Log in</Link>
                                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="btn btn-primary">Sign up</Link>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;

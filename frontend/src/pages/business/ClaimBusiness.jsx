import React, { useState, useEffect } from 'react';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Globe, Shield, Loader2, X } from 'lucide-react';
import './ClaimBusiness.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const ClaimBusiness = () => {
    const { token, businessUser, loading } = useBusinessAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [claimForm, setClaimForm] = useState({
        businessEmail: '',
        phone: '',
        position: '',
        justification: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!loading && !businessUser) {
            navigate('/business/login');
        }
    }, [loading, businessUser, navigate]);

    // Initialize form with user data when available
    useEffect(() => {
        if (businessUser) {
            setClaimForm(prev => ({
                ...prev,
                businessEmail: businessUser.businessEmail || businessUser.email,
                phone: businessUser.phone || '',
                position: businessUser.position || ''
            }));
        }
    }, [businessUser]);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`${API_BASE_URL}/business-portal/search?q=${encodeURIComponent(value)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setResults(data.data.businesses);
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleClaimClick = (business) => {
        setSelectedBusiness(business);
        setError('');
    };

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/business-portal/claim/${selectedBusiness._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(claimForm)
            });

            const data = await response.json();

            if (data.status === 'success') {
                setSuccess('Claim request submitted successfully! Redirecting to dashboard...');
                setTimeout(() => navigate('/business/dashboard'), 2000);
            } else {
                setError(data.message || 'Failed to submit claim');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="claim-page">
            <div className="claim-container">
                <header className="claim-header">
                    <Link to="/business/dashboard" className="text-sm text-green-600 mb-4 inline-block hover:underline">← Back to Dashboard</Link>
                    <h1>Claim Your Business</h1>
                    <p>Search for your business to start the verification process.</p>
                </header>

                <div className="search-section">
                    <div className="search-input-wrapper">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by business name..."
                            value={searchTerm}
                            onChange={handleSearch}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="results-section">
                    {isSearching ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-green-600" size={32} />
                        </div>
                    ) : results.length > 0 ? (
                        results.map(biz => (
                            <div key={biz._id} className="business-result-card">
                                <div className="biz-info">
                                    <h3>{biz.name}</h3>
                                    <p className="flex items-center gap-2 mb-1">
                                        <MapPin size={14} /> {biz.location}
                                    </p>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{biz.category}</span>
                                    {biz.claimStatus === 'pending' && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending Claim</span>}
                                </div>
                                <button
                                    onClick={() => handleClaimClick(biz)}
                                    disabled={biz.claimStatus !== 'unclaimed'}
                                    className="claim-btn"
                                >
                                    {biz.claimStatus === 'unclaimed' ? 'Claim This Business' : 'Unavailable'}
                                </button>
                            </div>
                        ))
                    ) : searchTerm.length > 1 ? (
                        <div className="text-center p-8 text-gray-500">
                            <p>No businesses found matching "{searchTerm}"</p>
                            <div className="mt-4">
                                <p>Can't find your business?</p>
                                <Link to="/business/register" className="text-green-600 font-semibold hover:underline">Register a new business</Link>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Claim Modal */}
            {selectedBusiness && (
                <div className="modal-overlay">
                    <div className="claim-modal">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="modal-title mb-0">Claim {selectedBusiness.name}</h2>
                            <button onClick={() => setSelectedBusiness(null)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
                        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm font-medium">{success}</div>}

                        {!success && (
                            <form onSubmit={handleClaimSubmit}>
                                <div className="form-group">
                                    <label>Official Business Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="form-control"
                                        value={claimForm.businessEmail}
                                        onChange={e => setClaimForm({ ...claimForm, businessEmail: e.target.value })}
                                    />
                                    <small className="text-gray-500 text-xs">We'll send verification details here.</small>
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="form-control"
                                        value={claimForm.phone}
                                        onChange={e => setClaimForm({ ...claimForm, phone: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Your Position</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-control"
                                        placeholder="e.g. Owner, Manager"
                                        value={claimForm.position}
                                        onChange={e => setClaimForm({ ...claimForm, position: e.target.value })}
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedBusiness(null)}
                                        className="btn-cancel"
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="claim-btn"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Claim'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimBusiness;

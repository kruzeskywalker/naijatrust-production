import React, { useState, useEffect } from 'react';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Loader2, TrendingUp, MousePointer, Eye, Calendar, ArrowLeft, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import './BusinessAnalytics.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/auth', '') || 'http://localhost:5001/api';

const BusinessAnalytics = () => {
    const { token } = useBusinessAuth();
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) fetchAnalytics();
    }, [token]);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/business-portal/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setAnalyticsData(data.data.logs);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-600" size={32} /></div>;

    // Process data for charts/summary
    const totalViews = analyticsData.filter(l => l.eventType === 'view').length;
    const totalCalls = analyticsData.filter(l => l.eventType === 'call_click').length;
    const totalWebClicks = analyticsData.filter(l => l.eventType === 'website_click').length;

    return (
        <div className="analytics-container">
            <header className="analytics-header">
                <div>
                    <Link to="/business/dashboard" className="back-link" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1>Performance Analytics</h1>
                </div>
            </header>

            <div className="analytics-stats-grid">
                <div className="analytics-stat-card">
                    <div className="stat-icon" style={{ background: '#ebf8ff', color: '#3182ce' }}>
                        <Eye size={28} />
                    </div>
                    <div className="stat-content">
                        <h3>Profile Views</h3>
                        <div className="stat-value">{totalViews}</div>
                        <p className="stat-desc">Total page visits</p>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="stat-icon" style={{ background: '#f0fff4', color: '#38a169' }}>
                        <MousePointer size={28} />
                    </div>
                    <div className="stat-content">
                        <h3>Website Clicks</h3>
                        <div className="stat-value">{totalWebClicks}</div>
                        <p className="stat-desc">Traffic to your site</p>
                    </div>
                </div>

                <div className="analytics-stat-card">
                    <div className="stat-icon" style={{ background: '#fffaf0', color: '#dd6b20' }}>
                        <Phone size={28} />
                    </div>
                    <div className="stat-content">
                        <h3>Phone Leads</h3>
                        <div className="stat-value">{totalCalls}</div>
                        <p className="stat-desc">Click-to-call actions</p>
                    </div>
                </div>
            </div>

            <div className="activity-section">
                <div className="activity-header">
                    <Calendar size={20} className="text-gray-500" />
                    <h2>Recent Activity Log</h2>
                </div>

                <div className="table-container">
                    {analyticsData.length === 0 ? (
                        <div className="empty-analytics">
                            <p>No activity recorded yet.</p>
                        </div>
                    ) : (
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Event Type</th>
                                    <th>Business</th>
                                    <th>Date & Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.slice(0, 50).map((log, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <span className={`event-badge ${log.eventType === 'view' ? 'event-view' :
                                                    log.eventType === 'website_click' ? 'event-click' :
                                                        'event-call'
                                                }`}>
                                                {log.eventType === 'view' && <><Eye size={14} /> Profile View</>}
                                                {log.eventType === 'website_click' && <><MousePointer size={14} /> Website Visit</>}
                                                {log.eventType === 'call_click' && <><Phone size={14} /> Phone Call</>}
                                            </span>
                                        </td>
                                        <td>{log.business?.name || 'N/A'}</td>
                                        <td>{new Date(log.timestamp).toLocaleString(undefined, {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessAnalytics;

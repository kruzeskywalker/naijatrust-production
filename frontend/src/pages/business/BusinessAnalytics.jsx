import React, { useState, useEffect } from 'react';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Loader2, TrendingUp, MousePointer, Eye, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import './BusinessDashboard.css';

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

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-600" /></div>;

    // Process data for charts/summary
    const totalViews = analyticsData.filter(l => l.eventType === 'view').length;
    const totalCalls = analyticsData.filter(l => l.eventType === 'call_click').length;
    const totalWebClicks = analyticsData.filter(l => l.eventType === 'website_click').length;

    return (
        <div className="business-dashboard container" style={{ padding: '2rem 1rem' }}>
            <div className="section-header">
                <h2>Performance Analytics</h2>
                <Link to="/business/dashboard" className="btn btn-outline btn-sm">Back to Dashboard</Link>
            </div>

            <div className="stats-grid mb-8">
                <div className="stat-card">
                    <div className="icon-wrapper" style={{ background: '#ebf8ff', color: '#3182ce', padding: '10px', borderRadius: '50%', width: 'fit-content', marginBottom: '10px' }}>
                        <Eye size={24} />
                    </div>
                    <h3>Profile Views</h3>
                    <div className="value">{totalViews}</div>
                    <p className="text-sm text-gray-500">Total times your profile was viewed</p>
                </div>
                <div className="stat-card">
                    <div className="icon-wrapper" style={{ background: '#f0fff4', color: '#38a169', padding: '10px', borderRadius: '50%', width: 'fit-content', marginBottom: '10px' }}>
                        <MousePointer size={24} />
                    </div>
                    <h3>Website Clicks</h3>
                    <div className="value">{totalWebClicks}</div>
                    <p className="text-sm text-gray-500">Clicks to your website</p>
                </div>
                <div className="stat-card">
                    <div className="icon-wrapper" style={{ background: '#fffaf0', color: '#dd6b20', padding: '10px', borderRadius: '50%', width: 'fit-content', marginBottom: '10px' }}>
                        <TrendingUp size={24} />
                    </div>
                    <h3>Phone Leads</h3>
                    <div className="value">{totalCalls}</div>
                    <p className="text-sm text-gray-500">Clicks on phone number</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Calendar size={20} /> Recent Activity
                </h3>
                <div className="activity-feed">
                    {analyticsData.length === 0 ? (
                        <p className="text-gray-500">No activity recorded yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {analyticsData.slice(0, 50).map((log, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${log.eventType === 'view' ? 'bg-blue-100 text-blue-600' :
                                            log.eventType === 'website_click' ? 'bg-green-100 text-green-600' :
                                                'bg-orange-100 text-orange-600'
                                            }`}>
                                            {log.eventType === 'view' && <Eye size={16} />}
                                            {log.eventType === 'website_click' && <MousePointer size={16} />}
                                            {log.eventType === 'call_click' && <TrendingUp size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {log.eventType === 'view' && 'Profile View'}
                                                {log.eventType === 'website_click' && 'Website Visit'}
                                                {log.eventType === 'call_click' && 'Phone Call'}
                                            </p>
                                            <p className="text-xs text-gray-500">{log.business?.name}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessAnalytics;

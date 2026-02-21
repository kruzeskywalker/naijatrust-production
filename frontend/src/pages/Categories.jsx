import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApiBaseUrl, getImageUrl } from '../utils/urlUtils';
import { SEO } from '../App';
import {
    Globe, Zap, ShieldCheck, ShoppingBag, Truck, CreditCard,
    Smartphone, Car, Coffee, Utensils, Home, Briefcase,
    HeartPulse, GraduationCap, Plane, Camera, Monitor, Settings, Star,
    Sparkles, Shirt, Dumbbell, Factory, Megaphone
} from 'lucide-react';
import './Categories.css';
import { BUSINESS_CATEGORIES } from '../utils/constants';

const Categories = () => {
    // Map categories to icons/colors
    const [categoryCounts, setCategoryCounts] = useState({});
    const [trendingBusinesses, setTrendingBusinesses] = useState([]);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);

    // Map categories to icons/colors
    const getCategoryData = (name) => {
        const mapping = {
            'Agriculture': { icon: <Globe size={32} />, color: '#48bb78' }, // Green
            'Automobiles': { icon: <Car size={32} />, color: '#e53e3e' }, // Red
            'Aviation': { icon: <Plane size={32} />, color: '#0bc5ea' }, // Cyan
            'Banks': { icon: <CreditCard size={32} />, color: '#4299e1' }, // Blue
            'Beauty & Spa': { icon: <Sparkles size={32} />, color: '#d53f8c' }, // Pink
            'Consulting': { icon: <Briefcase size={32} />, color: '#718096' }, // Gray
            'Coworking': { icon: <Briefcase size={32} />, color: '#38a169' }, // Green-ish
            'Ecommerce': { icon: <ShoppingBag size={32} />, color: '#ed8936' }, // Orange
            'Education': { icon: <GraduationCap size={32} />, color: '#667eea' }, // Indigo
            'Energy': { icon: <Zap size={32} />, color: '#fbbf24' }, // Yellow
            'Fashion & Lifestyle': { icon: <Shirt size={32} />, color: '#9f7aea' }, // Purple
            'Fintech': { icon: <Zap size={32} />, color: '#38b2ac' }, // Teal
            'Fitness': { icon: <Dumbbell size={32} />, color: '#f56565' }, // Red
            'Food & Drink': { icon: <Utensils size={32} />, color: '#ecc94b' }, // Yellow-Orange
            'Health': { icon: <HeartPulse size={32} />, color: '#f687b3' }, // Pink-Red
            'Hospitality': { icon: <Coffee size={32} />, color: '#9f7aea' }, // Purple
            'Insurance': { icon: <ShieldCheck size={32} />, color: '#008751' }, // Green
            'IT Services': { icon: <Monitor size={32} />, color: '#1a202c' }, // Dark
            'Jobs': { icon: <Briefcase size={32} />, color: '#718096' }, // Gray
            'Legal Services': { icon: <Briefcase size={32} />, color: '#2b6cb0' }, // Blue
            'Logistics': { icon: <Truck size={32} />, color: '#f56565' }, // Red
            'Manufacturing': { icon: <Factory size={32} />, color: '#4a5568' }, // Gray
            'Marketing & Advertising': { icon: <Megaphone size={32} />, color: '#dd6b20' }, // Orange
            'Media': { icon: <Camera size={32} />, color: '#a0aec0' }, // Gray
            'NGO': { icon: <Globe size={32} />, color: '#38b2ac' }, // Teal
            'Real Estate': { icon: <Home size={32} />, color: '#2d3748' }, // Dark
            'Telecom': { icon: <Smartphone size={32} />, color: '#805ad5' }, // Purple
            'Travel & Hotels': { icon: <Plane size={32} />, color: '#9f7aea' }, // Purple
            'Other': { icon: <Star size={32} />, color: '#cbd5e0' }
        };
        return mapping[name] || mapping['Other'];
    };

    useEffect(() => {
        const fetchCategoryCounts = async () => {
            try {
                const API_URL = getApiBaseUrl(import.meta.env.VITE_API_URL);
                const response = await fetch(`${API_URL}/businesses/stats/categories`);
                const data = await response.json();
                if (data.status === 'success') {
                    setCategoryCounts(data.data.categoryCounts);
                }
            } catch (error) {
                console.error('Error fetching category counts:', error);
            }
        };

        const fetchTrendingBusinesses = async () => {
            setIsLoadingTrending(true);
            try {
                const API_URL = getApiBaseUrl(import.meta.env.VITE_API_URL);
                // Fetch top 8 businesses to show as most reviewed
                const response = await fetch(`${API_URL}/businesses?limit=8`);
                const data = await response.json();

                if (data.status === 'success') {
                    // Assuming the backend doesn't explicitly sort by reviewCount yet for this endpoint
                    // Let's sort them purely by review count descending
                    const sortedBiz = data.data.businesses.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
                    setTrendingBusinesses(sortedBiz);
                }
            } catch (error) {
                console.error('Error fetching trending businesses:', error);
            } finally {
                setIsLoadingTrending(false);
            }
        };

        fetchCategoryCounts();
        fetchTrendingBusinesses();
    }, []);

    const categories = BUSINESS_CATEGORIES.map(name => ({
        name,
        ...getCategoryData(name),
        count: categoryCounts[name] || 0
    }));

    return (
        <div className="categories-page container">
            <SEO
                title="Business Categories"
                description="Browse trusted Nigerian businesses by category. From artisans to banks, find verified service providers on NaijaTrust."
            />
            <header className="categories-header">
                <h1>What are you looking for?</h1>
                <p>Browse through thousands of Nigerian businesses across {categories.length} categories.</p>
                <div className="cat-search">
                    <input type="text" placeholder="Search categories..." />
                </div>
            </header>

            <div className="categories-full-grid">
                {categories.map((cat, i) => (
                    <Link to={`/search?category=${cat.name}`} key={i} className="cat-full-card" style={{ "--cat-color": cat.color }}>
                        <div className="cat-icon-wrapper">
                            {cat.icon}
                        </div>
                        <div className="cat-info">
                            <h3>{cat.name}</h3>
                            <span>{cat.count} businesses</span>
                        </div>
                    </Link>
                ))}
            </div>

            <section className="top-businesses-preview">
                <h2>Most Reviewed Today</h2>
                {isLoadingTrending ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                        <p>Loading trending businesses...</p>
                    </div>
                ) : trendingBusinesses.length > 0 ? (
                    <div className="biz-mini-list">
                        {trendingBusinesses.map((biz) => (
                            <Link to={`/business/${biz._id}`} key={biz._id} className="biz-mini-card">
                                {biz.logo ? (
                                    <div className="biz-mini-logo" style={{ backgroundImage: `url(${getImageUrl(biz.logo)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                                ) : (
                                    <div className="biz-mini-logo" style={{ color: 'white', background: 'var(--primary-color)' }}>{biz.name[0]}</div>
                                )}
                                <div className="biz-mini-details">
                                    <h4>{biz.name}</h4>
                                    <div className="biz-mini-stars">
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} size={14} fill={j < Math.floor(biz.rating || 0) ? "var(--star-gold)" : "none"} color="var(--star-gold)" />
                                        ))}
                                        <span style={{ fontSize: '0.8rem', marginLeft: '4px', color: 'var(--text-dark)' }}>{biz.rating || 0}</span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                                        {biz.reviewCount || 0} reviews
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                        <p>No businesses found yet.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Categories;

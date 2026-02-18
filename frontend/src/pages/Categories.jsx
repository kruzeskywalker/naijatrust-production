import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../App';
import {
    Globe, Zap, ShieldCheck, ShoppingBag, Truck, CreditCard,
    Smartphone, Car, Coffee, Utensils, Home, Briefcase,
    HeartPulse, GraduationCap, Plane, Camera, Monitor, Settings, Star
} from 'lucide-react';
import { businesses } from '../mockData';
import './Categories.css';
import { BUSINESS_CATEGORIES } from '../utils/constants';

const Categories = () => {
    // Map categories to icons/colors
    const getCategoryData = (name) => {
        const mapping = {
            'Agriculture': { icon: <Globe size={32} />, color: '#48bb78' },
            'Automobiles': { icon: <Car size={32} />, color: '#e53e3e' },
            'Banks': { icon: <CreditCard size={32} />, color: '#4299e1' },
            'Ecommerce': { icon: <ShoppingBag size={32} />, color: '#ed8936' },
            'Education': { icon: <GraduationCap size={32} />, color: '#667eea' },
            'Energy': { icon: <Zap size={32} />, color: '#fbbf24' },
            'Fintech': { icon: <Zap size={32} />, color: '#38b2ac' },
            'Food & Drink': { icon: <Utensils size={32} />, color: '#ecc94b' },
            'Health': { icon: <HeartPulse size={32} />, color: '#f687b3' },
            'Hospitality': { icon: <Coffee size={32} />, color: '#9f7aea' },
            'Insurance': { icon: <ShieldCheck size={32} />, color: '#008751' },
            'IT Services': { icon: <Monitor size={32} />, color: '#1a202c' },
            'Jobs': { icon: <Briefcase size={32} />, color: '#718096' },
            'Legal Services': { icon: <Briefcase size={32} />, color: '#2b6cb0' },
            'Logistics': { icon: <Truck size={32} />, color: '#f56565' },
            'Media': { icon: <Camera size={32} />, color: '#a0aec0' },
            'Real Estate': { icon: <Home size={32} />, color: '#2d3748' },
            'Telecom': { icon: <Smartphone size={32} />, color: '#805ad5' },
            'Travel & Hotels': { icon: <Plane size={32} />, color: '#9f7aea' },
            'Other': { icon: <Star size={32} />, color: '#cbd5e0' }
        };
        return mapping[name] || mapping['Other'];
    };

    const categories = BUSINESS_CATEGORIES.map(name => ({
        name,
        ...getCategoryData(name),
        count: Math.floor(Math.random() * 200) + 20 // Mock count for now
    }));

    const trendingBusinesses = [...businesses].sort((a, b) => b.reviews - a.reviews).slice(0, 8);

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
                <div className="biz-mini-list">
                    {trendingBusinesses.map((biz) => (
                        <Link to={`/business/${biz.id}`} key={biz.id} className="biz-mini-card">
                            <div className="biz-mini-logo" style={{ color: 'white', background: 'var(--primary-color)' }}>{biz.name[0]}</div>
                            <div className="biz-mini-details">
                                <h4>{biz.name}</h4>
                                <div className="biz-mini-stars">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} size={14} fill={j < Math.floor(biz.rating) ? "var(--star-gold)" : "none"} color="var(--star-gold)" />
                                    ))}
                                    <span style={{ fontSize: '0.8rem', marginLeft: '4px', color: 'var(--text-dark)' }}>{biz.rating}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Categories;

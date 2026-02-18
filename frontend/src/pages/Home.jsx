import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '../App';
import './Home.css';
import StarRating from '../components/StarRating';
import { Star, ShieldCheck, Zap, Globe, ShoppingBag, Truck, CreditCard, ArrowRight } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const categories = [
        { name: 'Banks', icon: <CreditCard size={24} />, color: '#4299e1' },
        { name: 'Ecommerce', icon: <ShoppingBag size={24} />, color: '#ed8936' },
        { name: 'Travel & Hotels', icon: <Globe size={24} />, color: '#9f7aea' },
        { name: 'Telecom', icon: <Zap size={24} />, color: '#48bb78' },
        { name: 'Logistics', icon: <Truck size={24} />, color: '#f56565' },
        { name: 'Fintech', icon: <Zap size={24} />, color: '#38b2ac' },
    ];

    const recentReviews = [
        { id: 1, biz: 'Kuda Bank', user: 'Emeka O.', text: 'Excellent customer service and very fast transactions. Best bank in Nigeria!', stars: 5 },
        { id: 2, biz: 'Jumia Nigeria', user: 'Chizoba A.', text: 'Got my delivery within 48 hours. The package was intact. Great job!', stars: 4 },
        { id: 3, biz: 'Mtn Nigeria', user: 'Sanni K.', text: 'Network has been very stable lately. The data plans are also fair.', stars: 5 },
        { id: 4, biz: 'Flutterwave', user: 'Victoria E.', text: 'Seamless integration for my business. Payments are always prompt.', stars: 5 },
    ];

    return (
        <div className="home-page">
            <SEO
                title="Home"
                description="Naija's #1 community for authentic feedback on Nigerian businesses. Read reviews, write reviews, and find businesses you can trust."
                keywords="Nigerian business directory, verified businesses, customer reviews Nigeria"
            />
            <section className="hero">
                <div className="container hero-content">
                    <h1>Read reviews. Write reviews.<br /><span className="highlight">Find businesses you can trust.</span></h1>
                    <p>Naija's #1 community for authentic feedback on Nigerian businesses.</p>
                    <form className="hero-search" onSubmit={(e) => {
                        e.preventDefault();
                        const query = e.target.search.value;
                        navigate(`/search?q=${encodeURIComponent(query)}`);
                    }}>
                        <input name="search" type="text" placeholder="Company name, category, or service..." />
                        <button type="submit" className="btn btn-primary btn-large">Search</button>
                    </form>
                </div>
            </section>

            <section className="categories-section container">
                <div className="section-header">
                    <h2>Explore Categories</h2>
                    <Link to="/categories" className="view-all">View all <ArrowRight size={16} /></Link>
                </div>
                <div className="category-grid">
                    {categories.map((cat, i) => (
                        <Link to={`/search?category=${cat.name}`} key={i} className="category-card" style={{ "--cat-hover": cat.color }}>
                            <div className="cat-icon">{cat.icon}</div>
                            <p>{cat.name}</p>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="activity-wrapper">
                <section className="recent-reviews container">
                    <h2>Recent Activity</h2>
                    <div className="review-grid">
                        {recentReviews.map((rev) => (
                            <div key={rev.id} className="mini-review-card">
                                <div className="review-stars">
                                    <StarRating rating={rev.stars} size={16} />
                                </div>
                                <h3>{rev.biz}</h3>
                                <p>"{rev.text}"</p>
                                <span className="reviewer">- {rev.user}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="trust-cta">
                <div className="container trust-content">
                    <div className="trust-text">
                        <h2>NaijaTrust is built for transparency</h2>
                        <p>We use AI and manual verification to ensure that every review on our platform is from a real customer.</p>
                        <div className="trust-stats">
                            <div className="t-stat">
                                <span className="count">100k+</span>
                                <span>Verified Reviews</span>
                            </div>
                            <div className="t-stat">
                                <span className="count">50k+</span>
                                <span>Nigerian Businesses</span>
                            </div>
                        </div>
                        <Link to="/about" className="btn btn-outline">Learn how it works</Link>
                    </div>
                    <div className="trust-badge">
                        <ShieldCheck size={160} className="trust-shield-icon" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

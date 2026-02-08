import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Info, Briefcase, Shield, Star } from 'lucide-react';
import { helpContent, helpCategories } from '../data/helpContent';
import './HelpCenter.css';

const HelpCenter = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [openItem, setOpenItem] = useState(null);

    const toggleItem = (id) => {
        setOpenItem(openItem === id ? null : id);
    };

    // Filter Logic
    const filteredContent = useMemo(() => {
        let content = helpContent;

        // 1. Filter by Category
        if (activeCategory !== 'All') {
            content = content.filter(item => item.category === activeCategory);
        }

        // 2. Filter by Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            content = content.filter(item =>
                item.question.toLowerCase().includes(query) ||
                item.answer.toLowerCase().includes(query) ||
                (item.keywords && item.keywords.some(k => k.toLowerCase().includes(query)))
            );
        }

        return content;
    }, [searchQuery, activeCategory]);

    // Map icon strings to components
    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Info': return <Info size={28} />;
            case 'Briefcase': return <Briefcase size={28} />;
            case 'Shield': return <Shield size={28} />;
            case 'Star': return <Star size={28} />;
            default: return <Info size={28} />;
        }
    };

    return (
        <div className="page-wrapper">
            <div className="help-page">
                {/* Hero Search Section */}
                <div className="help-hero">
                    <h1>How can we help you?</h1>
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                className="help-search-input"
                                placeholder="Describe your issue"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="help-container">
                    {/* Categories Grid - Only show if not searching (or show always? Let's show always for filtering) */}
                    <div className="categories-grid">
                        <div
                            className={`category-card ${activeCategory === 'All' ? 'active' : ''}`}
                            onClick={() => setActiveCategory('All')}
                        >
                            <div className="category-icon" style={{ margin: '0 auto 1rem auto' }}>
                                <Info size={28} /> {/* Generic icon for All */}
                            </div>
                            <h3>All Topics</h3>
                        </div>
                        {helpCategories.map(cat => (
                            <div
                                key={cat.id}
                                className={`category-card ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                <div className="category-icon" style={{ margin: '0 auto 1rem auto' }}>
                                    {getIcon(cat.icon)}
                                </div>
                                <h3>{cat.label}</h3>
                            </div>
                        ))}
                    </div>

                    {/* FAQ List */}
                    <div className="faq-section">
                        <h2>{searchQuery ? 'Search Results' : (activeCategory === 'All' ? 'Popular Questions' : activeCategory)}</h2>

                        {filteredContent.length > 0 ? (
                            filteredContent.map(item => (
                                <div
                                    key={item.id}
                                    className={`faq-item ${openItem === item.id ? 'open' : ''}`}
                                >
                                    <div
                                        className="faq-question"
                                        onClick={() => toggleItem(item.id)}
                                    >
                                        <span>{item.question}</span>
                                        <ChevronDown className="faq-toggle-icon" size={20} />
                                    </div>
                                    <div className="faq-answer">
                                        <p>{item.answer}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <p>No results found for "{searchQuery}"</p>
                                <button className="cta-button" style={{ maxWidth: '200px', marginTop: '1rem' }} onClick={() => setSearchQuery('')}>Clear Search</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;

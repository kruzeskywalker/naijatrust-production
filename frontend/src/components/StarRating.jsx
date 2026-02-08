import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import './StarRating.css';

const StarRating = ({ rating, size = 16, showLabel = false }) => {
    // Logic based on the provided table
    const getRatingDetails = (val) => {
        if (val >= 4.8) return { stars: 5, label: 'Excellent', color: '#00C851', bg: '#e6f9ed' }; // Green
        if (val >= 4.3) return { stars: 4.5, label: 'Excellent', color: '#00C851', bg: '#e6f9ed' }; // Green
        if (val >= 3.8) return { stars: 4, label: 'Great', color: '#76ff03', bg: '#f1ffe0' }; // Light Green
        if (val >= 3.3) return { stars: 3.5, label: 'Average', color: '#FFEB3B', bg: '#fffde7' }; // Yellow
        if (val >= 2.8) return { stars: 3, label: 'Average', color: '#FFEB3B', bg: '#fffde7' }; // Yellow
        if (val >= 2.3) return { stars: 2.5, label: 'Poor', color: '#FF9800', bg: '#fff3e0' }; // Orange
        if (val >= 1.8) return { stars: 2, label: 'Poor', color: '#FF9800', bg: '#fff3e0' }; // Orange
        if (val >= 1.3) return { stars: 1.5, label: 'Bad', color: '#f44336', bg: '#ffebee' }; // Red
        return { stars: 1, label: 'Bad', color: '#f44336', bg: '#ffebee' }; // Red (< 1.3)
    };

    const { stars, label, color, bg } = getRatingDetails(rating);

    const renderStars = () => {
        const starElements = [];
        const fullStars = Math.floor(stars);
        const hasHalfStar = stars % 1 !== 0;

        // Full Stars
        for (let i = 0; i < fullStars; i++) {
            starElements.push(
                <div key={`full-${i}`} className="star-wrapper">
                    <div className="star-bg">
                        <Star size={size} color="#e0e0e0" fill="#e0e0e0" />
                    </div>
                    <div className="star-fg">
                        <Star size={size} color={color} fill={color} />
                    </div>
                </div>
            );
        }

        // Half Star
        if (hasHalfStar) {
            starElements.push(
                <div key="half" className="star-wrapper">
                    <div className="star-bg">
                        <Star size={size} color="#e0e0e0" fill="#e0e0e0" />
                    </div>
                    {/* Render half star logic or utilize clip-path if needed, but simple overlap works for now if we had a HalfStar icon that matched perfectly. 
                        Lucide's StarHalf is usually left-half filled. */}
                    <div className="star-fg">
                        <StarHalf size={size} color={color} fill={color} />
                    </div>
                </div>
            );
        }

        // Empty Stars to fill up to 5
        const currentCount = starElements.length;
        for (let i = currentCount; i < 5; i++) {
            starElements.push(
                <div key={`empty-${i}`} className="star-wrapper">
                    <Star size={size} color="#e0e0e0" fill="#e0e0e0" />
                </div>
            );
        }

        return starElements;
    };


    // Simple Lucide Approach without complex stacking for now to ensure compatibility
    // Revamped simple renderer
    const renderSimpleStars = () => {
        const els = [];
        // The table maps ranges to specific visual star counts (1, 1.5, 2, 2.5 etc)
        // So strictly following that mapping:

        for (let i = 1; i <= 5; i++) {
            if (stars >= i) {
                // Full star
                els.push(<Star key={i} size={size} fill={color} color={color} />);
            } else if (stars >= i - 0.5) {
                // Half star
                els.push(
                    <div key={i} style={{ position: 'relative', width: size, height: size }}>
                        <Star size={size} color="#e2e8f0" fill="#e2e8f0" style={{ position: 'absolute', top: 0, left: 0 }} />
                        <StarHalf size={size} fill={color} color={color} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
                    </div>
                );
            } else {
                // Empty
                els.push(<Star key={i} size={size} fill="#e2e8f0" color="#e2e8f0" />); // gray-200
            }
        }
        return els;
    };

    return (
        <div className="star-rating-container">
            <div className="stars-flex" style={{ gap: size > 20 ? 4 : 2 }}>
                {renderSimpleStars()}
            </div>
            {showLabel && (
                <span className="rating-label" style={{ backgroundColor: bg, color: color, borderColor: color }}>
                    {label}
                </span>
            )}
        </div>
    );
};

export default StarRating;

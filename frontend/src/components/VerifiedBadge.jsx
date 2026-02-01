import React from 'react';
import { ShieldCheck } from 'lucide-react';
import './VerifiedBadge.css';

const VerifiedBadge = ({ isVerified, isClaimed, business, size = 'medium', showText = true, className = '' }) => {
    // Logic: Must be verified AND claimed to show the badge
    // Support passing explicit props OR a business object
    const verified = isVerified || (business && business.isVerified);
    const claimed = isClaimed || (business && (business.isClaimed || business.claimStatus === 'claimed'));

    if (!verified || !claimed) return null;

    const sizeMap = {
        small: 14,
        medium: 16,
        large: 20
    };

    return (
        <span className={`verified-badge verified-badge-${size} ${className}`} title="Verified Business">
            <ShieldCheck size={sizeMap[size]} />
            {showText && <span>Verified</span>}
        </span>
    );
};

export default VerifiedBadge;

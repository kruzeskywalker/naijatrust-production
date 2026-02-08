import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="container footer-content">
                <div className="footer-brand">
                    <div className="logo-section">
                        <img src="/logo.png" alt="NaijaTrust" className="logo" />
                        <span className="logo-text">NaijaTrust</span>
                    </div>
                    <p>The most trusted review platform in Nigeria. Empowering consumers and helping businesses grow through transparency.</p>
                </div>

                <div className="footer-links">
                    <div className="link-group">
                        <h3>About</h3>
                        <Link to="/about">About Us</Link>
                        <Link to="/jobs">Jobs</Link>
                        <Link to="/contact">Contact</Link>
                    </div>
                    <div className="link-group">
                        <h3>Community</h3>
                        <Link to="/help">Help Center</Link>
                    </div>
                    <div className="link-group">
                        <h3>Businesses</h3>
                        <Link to="/business/login">NaijaTrust for Business</Link>
                        <Link to="/plans">Plans & Pricing</Link>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container footer-bottom-content">
                    <p>&copy; 2026 NaijaTrust. All rights reserved.</p>
                    <div className="legal-links">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Use</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

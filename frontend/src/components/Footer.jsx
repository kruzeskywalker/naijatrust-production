import React from 'react';
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
                        <a href="/about">About Us</a>
                        <a href="/jobs">Jobs</a>
                        <a href="/contact">Contact</a>
                    </div>
                    <div className="link-group">
                        <h3>Community</h3>
                        <a href="/trust">Trust in reviews</a>
                        <a href="/guidelines">Guidelines</a>
                        <a href="/verify">Verify reviews</a>
                    </div>
                    <div className="link-group">
                        <h3>Businesses</h3>
                        <a href="/business">NaijaTrust for Business</a>
                        <a href="/plans">Plans & Pricing</a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container footer-bottom-content">
                    <p>&copy; 2025 NaijaTrust. All rights reserved.</p>
                    <div className="legal-links">
                        <a href="/legal/privacy">Privacy Policy</a>
                        <a href="/legal/terms">Terms of Use</a>
                    </div>
                    <div className="language-selector">
                        <button className="active">English</button>
                        <button>Pidgin</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

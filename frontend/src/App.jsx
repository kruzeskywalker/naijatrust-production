import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import ReactGA from 'react-ga4';
import { Helmet } from 'react-helmet-async';
import PageTransition from './components/PageTransition';

import Home from './pages/Home';
import Search from './pages/Search';
import BusinessProfile from './pages/BusinessProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Categories from './pages/Categories';
import WriteReview from './pages/WriteReview';

import OtpVerification from './pages/Auth/OtpVerification';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import Settings from './pages/Settings';
import About from './pages/About';
import Contact from './pages/Contact';
import Jobs from './pages/Jobs';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Plans from './pages/Plans';
import HelpCenter from './pages/HelpCenter';

// Business Portal Pages
import BusinessSignup from './pages/business/BusinessSignup';
import BusinessLogin from './pages/business/BusinessLogin';
import BusinessForgotPassword from './pages/business/BusinessForgotPassword';
import BusinessResetPassword from './pages/business/BusinessResetPassword';
import EmailVerification from './pages/business/EmailVerification';
import BusinessDashboard from './pages/business/BusinessDashboard';
import ClaimBusiness from './pages/business/ClaimBusiness';
import RegisterBusiness from './pages/business/RegisterBusiness';
import BusinessSettings from './pages/business/BusinessSettings';
import BusinessReviews from './pages/business/BusinessReviews';
import BusinessAllReviews from './pages/business/BusinessAllReviews';
import BusinessAnalytics from './pages/business/BusinessAnalytics';
import PaymentCallback from './pages/business/PaymentCallback';

// Admin Portal Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClaimRequests from './pages/admin/ClaimRequests';
import ManageBusinesses from './pages/admin/ManageBusinesses';
import ManageReviews from './pages/admin/ManageReviews';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBusinessOwners from './pages/admin/ManageBusinessOwners';
import AdminAccountDeletions from './pages/admin/AdminAccountDeletions';

import { AuthProvider, useAuth } from './context/AuthContext';
import { BusinessAuthProvider } from './context/BusinessAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import './index.css';

// OAuth Callback Handler Component
const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleGoogleOAuthCallback } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      const processLogin = async () => {
        await handleGoogleOAuthCallback(token);
        navigate('/dashboard');
      };
      processLogin();
    } else {
      navigate('/login');
    }
  }, [location, handleGoogleOAuthCallback, navigate]);

  return (
    <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Completing authentication...</h2>
    </div>
  );
};

// Wrapper for business routes to hide main header/footer if desired
const BusinessLayout = ({ children }) => {
  return (
    <div className="business-layout">
      {children}
    </div>
  );
};

const SEO = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title ? `${title} | NaijaTrust` : 'NaijaTrust - Find Trusted Businesses & Reviews in Nigeria'}</title>
      <meta name="description" content={description || "Discover verified businesses, read authentic customer reviews, and avoid scams in Nigeria."} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={title ? `${title} | NaijaTrust` : 'NaijaTrust - Find Trusted Businesses & Reviews in Nigeria'} />
      <meta property="og:description" content={description || "Discover verified businesses, read authentic customer reviews, and avoid scams in Nigeria."} />
      <meta property="twitter:title" content={title ? `${title} | NaijaTrust` : 'NaijaTrust - Find Trusted Businesses & Reviews in Nigeria'} />
      <meta property="twitter:description" content={description || "Discover verified businesses, read authentic customer reviews, and avoid scams in Nigeria."} />
    </Helmet>
  );
};

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-N79WYC1LFD';
    ReactGA.initialize(measurementId);
  }, []);

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  // Paths where we don't want the GLOBAL Header/Footer (e.g. Admin, Login, Signup)
  const isAdminPath = location.pathname.startsWith('/admin');
  const isBusinessPortalRoute = ['dashboard', 'settings', 'reviews', 'analytics', 'claim', 'register', 'subscription', 'payment-callback'].some(route => location.pathname.startsWith(`/business/${route}`));
  const isBusinessPath = isBusinessPortalRoute;
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password', '/business/login', '/business/signup'].some(p => location.pathname.startsWith(p));
  const isOAuthCallback = location.pathname.startsWith('/auth/callback');

  // Show global header/footer for main site (Home, Search, Categories, etc.)
  // But hide them for Admin portal, Business portal, and Auth pages
  const showGlobalHeader = !isAdminPath && !isBusinessPath && !isAuthPage && !isOAuthCallback;
  const showGlobalFooter = !isAdminPath && !isAuthPage && !isOAuthCallback; // Keep footer on business path for now or hide if desired
  return (
    <>
      <AnalyticsTracker />
      {showGlobalHeader && <Header />}

      <main style={{ minHeight: showGlobalHeader ? '80vh' : 'auto' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Business Portal Routes */}
            <Route path="/business/signup" element={<PageTransition><BusinessSignup /></PageTransition>} />
            <Route path="/business/login" element={<PageTransition><BusinessLogin /></PageTransition>} />
            <Route path="/business/forgot-password" element={<PageTransition><BusinessForgotPassword /></PageTransition>} />
            <Route path="/business/reset-password/:token" element={<PageTransition><BusinessResetPassword /></PageTransition>} />
            <Route path="/business/verify-email/:token" element={<PageTransition><EmailVerification /></PageTransition>} />
            <Route path="/business/dashboard" element={<PageTransition><BusinessDashboard /></PageTransition>} />
            <Route path="/business/claim" element={<PageTransition><ClaimBusiness /></PageTransition>} />
            <Route path="/business/claim/:id" element={<PageTransition><ClaimBusiness /></PageTransition>} />
            <Route path="/business/claim/search" element={<PageTransition><ClaimBusiness /></PageTransition>} />
            <Route path="/business/register" element={<PageTransition><RegisterBusiness /></PageTransition>} />
            <Route path="/business/settings" element={<PageTransition><BusinessSettings /></PageTransition>} />
            <Route path="/business/reviews/:businessId" element={<PageTransition><BusinessReviews /></PageTransition>} />
            <Route path="/business/reviews" element={<PageTransition><BusinessAllReviews /></PageTransition>} />
            <Route path="/business/analytics" element={<PageTransition><BusinessAnalytics /></PageTransition>} />
            <Route path="/business/subscription/payment-callback" element={<PageTransition><PaymentCallback /></PageTransition>} />

            {/* Admin Portal Routes */}
            <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
            <Route path="/admin/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
            <Route path="/admin/claims" element={<PageTransition><ClaimRequests /></PageTransition>} />
            <Route path="/admin/businesses" element={<PageTransition><ManageBusinesses /></PageTransition>} />
            <Route path="/admin/business-owners" element={<PageTransition><ManageBusinessOwners /></PageTransition>} />
            <Route path="/admin/reviews" element={<PageTransition><ManageReviews /></PageTransition>} />
            <Route path="/admin/users" element={<PageTransition><ManageUsers /></PageTransition>} />
            <Route path="/admin/deletions" element={<PageTransition><AdminAccountDeletions /></PageTransition>} />

            {/* Main Site Routes */}
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
            <Route path="/business/:id" element={<PageTransition><BusinessProfile /></PageTransition>} />
            <Route path="/categories" element={<PageTransition><Categories /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
            <Route path="/review/:id" element={<PageTransition><WriteReview /></PageTransition>} />
            <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
            <Route path="/verify-otp" element={<PageTransition><OtpVerification /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/dashboard/reviews" element={<PageTransition><Dashboard key="reviews" /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/jobs" element={<PageTransition><Jobs /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
            <Route path="/plans" element={<PageTransition><Plans /></PageTransition>} />
            <Route path="/help" element={<PageTransition><HelpCenter /></PageTransition>} />

            {/* Catch-all to Home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </main>

      {showGlobalFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <BusinessAuthProvider>
          <AdminAuthProvider>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <div className="app">
              <AnimatedRoutes />
            </div>
          </AdminAuthProvider>
        </BusinessAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export { SEO };
export default App;

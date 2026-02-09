import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import PageTransition from './components/PageTransition';

import Home from './pages/Home';
import Search from './pages/Search';
import BusinessProfile from './pages/BusinessProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Categories from './pages/Categories';
import WriteReview from './pages/WriteReview';

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
      handleGoogleOAuthCallback(token);
      navigate('/dashboard');
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

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Business Portal Routes */}
        <Route path="/business/signup" element={<BusinessSignup />} />
        <Route path="/business/login" element={<BusinessLogin />} />
        <Route path="/business/forgot-password" element={<BusinessForgotPassword />} />
        <Route path="/business/reset-password/:token" element={<BusinessResetPassword />} />
        <Route path="/business/verify-email/:token" element={<EmailVerification />} />
        <Route path="/business/dashboard" element={<BusinessDashboard />} />
        <Route path="/business/claim" element={<ClaimBusiness />} />
        <Route path="/business/claim/:id" element={<ClaimBusiness />} />
        <Route path="/business/claim/search" element={<ClaimBusiness />} />
        <Route path="/business/register" element={<RegisterBusiness />} />
        <Route path="/business/settings" element={<BusinessSettings />} />
        <Route path="/business/reviews/:businessId" element={<BusinessReviews />} />
        <Route path="/business/reviews" element={<BusinessAllReviews />} />
        <Route path="/business/analytics" element={<BusinessAnalytics />} />
        <Route path="/business/subscription/payment-callback" element={<PaymentCallback />} />

        {/* Admin Portal Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/claims" element={<ClaimRequests />} />
        <Route path="/admin/businesses" element={<ManageBusinesses />} />
        <Route path="/admin/business-owners" element={<ManageBusinessOwners />} />
        <Route path="/admin/reviews" element={<ManageReviews />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/deletions" element={<AdminAccountDeletions />} />

        {/* Main Site Routes */}
        <Route path="*" element={
          <>
            <Header />
            <main style={{ minHeight: '80vh' }}>
              <PageTransition>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/business/:id" element={<BusinessProfile />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/review/:id" element={<WriteReview />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/auth/callback" element={<OAuthCallback />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/reviews" element={<Dashboard key="reviews" />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/help" element={<HelpCenter />} />
                </Routes>
              </PageTransition>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </AnimatePresence>
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

export default App;

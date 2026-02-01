require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Set security HTTP headers
const helmet = require('helmet');
app.use(helmet());

// Limit requests from same API
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    max: 10000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
if (process.env.NODE_ENV !== 'test') {
    app.use('/api', limiter);
}

// const mongoSanitize = require('express-mongo-sanitize');
// if (process.env.NODE_ENV !== 'test') {
//    app.use(mongoSanitize());
// }

// Data sanitization against XSS
const xss = require('xss-clean');
// if (process.env.NODE_ENV !== 'test') {
//    app.use(xss());
// }
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'naijatrust-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/business-auth', require('./routes/businessAuthRoutes').router);
app.use('/api/business-portal', require('./routes/businessPortalRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Basic health check

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Enforce critical environment variables in production
        if (process.env.NODE_ENV === 'production') {
            if (!process.env.MONGODB_URI) {
                throw new Error('FATAL: MONGODB_URI is not defined in production environment');
            }
            if (!process.env.JWT_SECRET) {
                throw new Error('FATAL: JWT_SECRET is not defined in production environment');
            }
        }

        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB');
        } else {
            console.log('MONGODB_URI not found, running without database');
        }

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = app;

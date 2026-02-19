require('dotenv').config();
// Production Deploy: Force sync for Render
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

// Trust the first proxy (Render Load Balancer)
app.set('trust proxy', 1);

// Compression middleware - reduces response size by 60-80%
const compression = require('compression');
app.use(compression());

app.use(express.json());

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://www.naijatrust.ng',
            'https://naijatrust.ng',
            'https://naijatrust-production.vercel.app',
            'http://localhost:5173',
            'http://localhost:5001'
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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
const { MongoStore } = require('connect-mongo');

app.use(session({
    secret: process.env.SESSION_SECRET || 'naijatrust-session-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
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
app.use('/api/admin', require('./routes/adminTierRoutes')); // Admin tier management routes
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes')); // Paystack payment routes

// Basic health check

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Enforce critical environment variables in production
        if (process.env.NODE_ENV === 'production') {
            const missingVars = [];
            if (!process.env.MONGODB_URI) missingVars.push('MONGODB_URI');
            if (!process.env.JWT_SECRET) missingVars.push('JWT_SECRET');

            console.log('--- Production Startup Verification ---');
            console.log('NODE_ENV:', process.env.NODE_ENV);
            console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);
            console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
            console.log('---------------------------------------');

            if (missingVars.length > 0) {
                throw new Error(`FATAL: Missing environment variables: ${missingVars.join(', ')}`);
            }
        }

        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB');

            // Start subscription cron jobs in production
            if (process.env.NODE_ENV === 'production') {
                const { startCronJobs } = require('./cronJobs');
                startCronJobs();
            }
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

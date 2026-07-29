/**
 * server.js — Navari API
 * 
 * VAPT-Hardened Express server.
 * All security middleware applied in correct order.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const xssSanitizer = require('./middleware/xssSanitizer');
const { generalLimiter, authLimiter, uploadLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

// Backup scheduler — runs daily at 00:10 AM IST
const { initBackupScheduler } = require('./utils/backupScheduler');

// Connect to MongoDB
connectDB();

// Start daily backup scheduler after DB is connected
// All models are imported above (via route files), so mongoose.modelNames() is populated
initBackupScheduler();

const app = express();

// =====================================================================
// SECURITY MIDDLEWARE (must be first)
// =====================================================================

// 1. Remove fingerprinting header
app.disable('x-powered-by');

// 2. Helmet — sets 15+ security headers
//    Configured to allow API responses while blocking browser-level attacks
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],    // Clickjacking protection
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow /uploads images to load cross-origin
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000,       // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,             // X-Content-Type-Options: nosniff
    xssFilter: true,           // X-XSS-Protection (legacy browsers)
    frameguard: { action: 'deny' }, // X-Frame-Options: DENY
    hidePoweredBy: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// 3. CORS — strict origin whitelist
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  })
);

// 4. Body parsing — small limits to prevent DoS
//    API only receives JSON (no file bodies here; multipart via multer)
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
// text/plain needed for navigator.sendBeacon (logout-beacon endpoint)
app.use(express.text({ limit: '4kb' }));

// 5. NoSQL Injection prevention — strips $, . from req.body/query/params
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitizeError: (req, res) => {
    res.status(400).json({
      success: false,
      message: 'Invalid characters detected in request',
    });
  },
}));

// 6. XSS — strips HTML tags from all string inputs
app.use(xssSanitizer);

// 7. HTTP Parameter Pollution — keeps last value for duplicated params
//    Whitelist params that are legitimately repeated (e.g., tags[]=a&tags[]=b)
app.use(hpp({ whitelist: ['tags', 'colors', 'sizes', 'images'] }));

// 8. General API rate limiter — 200 requests / 15 min / IP
app.use('/api', generalLimiter);

// =====================================================================
// LOGGING
// =====================================================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production: combined log format for audit trail
  app.use(morgan('combined'));
}

// =====================================================================
// STATIC FILES — Uploaded images
// Served with strict headers; no directory listing
// =====================================================================
app.use(
  '/uploads',
  (req, res, next) => {
    // Prevent path traversal — block any ../ in URL
    if (req.path.includes('..') || req.path.includes('%2e%2e') || req.path.includes('%2E%2E')) {
      return res.status(400).json({ success: false, message: 'Invalid path' });
    }
    next();
  },
  express.static(path.join(__dirname, 'uploads'), {
    dotfiles: 'deny',       // Block access to .htaccess, .env etc
    index: false,           // No directory listing
    setHeaders: (res) => {
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('Cache-Control', 'public, max-age=31536000');
    },
  })
);

// =====================================================================
// API ROUTES (with specific rate limiters on sensitive endpoints)
// =====================================================================

// Auth routes — tighter rate limit (brute force protection)
app.use('/api/auth', authLimiter, authRoutes);

// Upload routes — upload flood protection
app.use('/api/upload', uploadLimiter, uploadRoutes);

// Standard routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);

// =====================================================================
// HEALTH CHECK
// =====================================================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// =====================================================================
// 404 HANDLER
// =====================================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    // Do NOT echo req.originalUrl to prevent log injection
  });
});

// =====================================================================
// GLOBAL ERROR HANDLER
// =====================================================================
app.use(errorHandler);

// =====================================================================
// START SERVER
// =====================================================================
const PORT = parseInt(process.env.PORT, 10) || 5000;

// Bind to localhost only in development (not 0.0.0.0)
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 API:     http://localhost:${PORT}/api`);
  console.log(`🖼️  Uploads: http://localhost:${PORT}/uploads`);
  console.log(`🔒 Security headers: Helmet ✅ | Rate Limit ✅ | NoSQL sanitize ✅ | XSS ✅ | HPP ✅\n`);
});

module.exports = app;

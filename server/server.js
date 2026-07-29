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

// ✅ VAPT (MED-03): Trust proxy — required for correct client IP resolution behind Render/Heroku/nginx.
// Without this, express-rate-limit sees the proxy IP (same for all users), which either
// disables rate-limiting entirely or blocks all users at once.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

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

// 3. CORS — origin whitelist (supports Vercel previews, custom domains, and localhost)
const rawUrls = [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean).join(',');

const defaultDevOrigins = [
  'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4000',
  'http://127.0.0.1:5173',
];

const allowedOrigins = (rawUrls ? rawUrls.split(',') : defaultDevOrigins)
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/$/, '');

      // 1. Allow wildcard '*' or exact match in allowedOrigins list
      if (allowedOrigins.includes('*') || allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }

      // 2. Allow any .vercel.app domain (frontend & admin deployments) and localhost
      if (normalized.endsWith('.vercel.app') || normalized.includes('localhost') || normalized.includes('127.0.0.1')) {
        return callback(null, true);
      }

      // 3. Allow subdomain matches for custom domain configs
      const isDomainMatch = allowedOrigins.some((allowed) => {
        try {
          const allowedHost = new URL(allowed.startsWith('http') ? allowed : `https://${allowed}`).hostname;
          const originHost = new URL(normalized).hostname;
          return originHost === allowedHost || originHost.endsWith(`.${allowedHost}`);
        } catch {
          return false;
        }
      });

      if (isDomainMatch) {
        return callback(null, true);
      }

      console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
    optionsSuccessStatus: 200,
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
// ✅ VAPT (LOW-01): Custom Morgan token that redacts sensitive query parameters from logs.
// e.g. GET /api/orders/track?q=VE001001&phone=9876543210 → logs &phone=[REDACTED]
morgan.token('safe-url', (req) => {
  try {
    const REDACTED_PARAMS = ['phone', 'email', 'password', 'token', 'resetToken'];
    const url = new URL(req.originalUrl, 'http://localhost');
    REDACTED_PARAMS.forEach((param) => {
      if (url.searchParams.has(param)) url.searchParams.set(param, '[REDACTED]');
    });
    return url.pathname + (url.search || '');
  } catch {
    return req.originalUrl; // fallback — should not happen in practice
  }
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production: combined log format with PII-safe URL token
  app.use(
    morgan(
      ':remote-addr - :remote-user [:date[clf]] ":method :safe-url HTTP/:http-version" ' +
      ':status :res[content-length] ":referrer" ":user-agent"'
    )
  );
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
    // ✅ VAPT (MED-04): env field removed — do not leak deployment environment to callers
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

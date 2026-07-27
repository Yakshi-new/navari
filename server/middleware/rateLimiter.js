const rateLimit = require('express-rate-limit');

/**
 * Auth Rate Limiter — VAPT Hardening
 * Prevents brute-force attacks on login/register.
 * Max 10 attempts per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers
  skipSuccessfulRequests: false,
});

/**
 * General API Rate Limiter — VAPT Hardening
 * Prevents API abuse and DDoS.
 * Max 200 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Upload Rate Limiter — VAPT Hardening
 * Prevents file upload flooding.
 * Max 20 uploads per hour per IP.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    message: 'Upload limit reached. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter, uploadLimiter };

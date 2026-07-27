/**
 * errorHandler.js — VAPT-Hardened Global Error Handler
 * 
 * Hardening:
 * - Stack traces NEVER sent in responses (not even in development)
 * - Internal DB error messages (CastError, ValidationError) safely mapped
 * - Mongoose duplicate key reveals only field name, not raw query
 * - JWT errors mapped generically (no token internals exposed)
 * - Multer (upload) errors handled and sanitized
 * - Log errors server-side for audit, never in client response
 */

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'An unexpected error occurred';

  // ----------------------------------------------------------------
  // VAPT: Log the full error internally (never sent to client)
  // In production, replace console.error with a proper logger (Winston)
  // ----------------------------------------------------------------
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${req.method} ${req.path} — ${statusCode}: ${message}`);
    if (err.stack && process.env.NODE_ENV === 'development') {
      // Stack only printed to server console, never to response
      console.error(err.stack);
    }
  }

  // ----------------------------------------------------------------
  // Mongoose — Invalid ObjectId (e.g., /api/products/not-valid-id)
  // ----------------------------------------------------------------
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // ----------------------------------------------------------------
  // Mongoose — Duplicate key (e.g., duplicate email, slug)
  // VAPT: Only reveal field name, not the duplicate value (could be PII)
  // ----------------------------------------------------------------
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // ----------------------------------------------------------------
  // Mongoose — Validation errors (schema-level constraints)
  // ----------------------------------------------------------------
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
  }

  // ----------------------------------------------------------------
  // JWT errors
  // VAPT: Generic messages — do not expose token structure or algorithm
  // ----------------------------------------------------------------
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Authentication failed. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }
  if (err.name === 'NotBeforeError') {
    statusCode = 401;
    message = 'Authentication failed. Please log in again.';
  }

  // ----------------------------------------------------------------
  // Multer (file upload) errors
  // ----------------------------------------------------------------
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large. Maximum allowed size is 5MB.';
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files. Maximum 5 files allowed per upload.';
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected field name in upload.';
  }

  // ----------------------------------------------------------------
  // CORS errors
  // ----------------------------------------------------------------
  if (err.message && err.message.startsWith('CORS:')) {
    statusCode = 403;
    message = 'Request origin not allowed';
  }

  // ----------------------------------------------------------------
  // VAPT: Final response — never include stack, never echo raw error internals
  // ----------------------------------------------------------------
  res.status(statusCode).json({
    success: false,
    message,
    // No 'stack', no 'error' object, no internal details
  });
};

module.exports = errorHandler;

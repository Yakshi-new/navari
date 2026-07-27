/**
 * auth.js — VAPT-Hardened JWT Authentication Middleware
 * 
 * Hardening:
 * - Strict Bearer token format check (regex)
 * - ObjectId format validated before DB query
 * - Inactive/deleted user check
 * - Generic error messages (no token internals exposed)
 * - Admin guard as separate middleware
 */

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * protect — Verify JWT and attach user to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ✅ VAPT: Strict Bearer format — must be exactly "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (authHeader && /^Bearer\s[\w\-._~+/]+=*$/.test(authHeader)) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Authentication required');
  }

  // Verify the token — errors caught by asyncHandler → errorHandler
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // ✅ VAPT: Validate decoded id is a valid ObjectId format before DB query
  if (!decoded.id || !/^[a-f\d]{24}$/i.test(decoded.id)) {
    res.status(401);
    throw new Error('Authentication failed. Please log in again.');
  }

  // Fetch user and exclude password
  const user = await User.findById(decoded.id).select('-password');

  // ✅ VAPT: User must exist and be active (handles deleted/banned accounts)
  if (!user) {
    res.status(401);
    throw new Error('Authentication failed. Please log in again.');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Please contact support.');
  }

  req.user = user;
  next();
});

/**
 * adminOnly — Must be used after protect middleware
 * Ensures req.user has role === 'admin'
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied. Admin privileges required.');
  }
  next();
};

module.exports = { protect, adminOnly };

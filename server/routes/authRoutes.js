const express = require('express');
const router = express.Router();
const {
  register, login, adminLogout, getMe, updateProfile, changePassword,
  addAddress, deleteAddress, setDefaultAddress, toggleWishlist,
  forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.put('/addresses/:addressId/default', protect, setDefaultAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Logout — clears sessionId from DB (used by inactivity timer + manual logout)
router.post('/logout', protect, adminLogout);

// Beacon logout — called via navigator.sendBeacon on window/tab close.
// sendBeacon sends Content-Type: text/plain and cannot set Authorization headers,
// so the raw JWT is passed as the request body and verified here manually.
//
// Body formats handled:
//   1. Raw string:        "eyJhbGciOiJIUzI1..."   (sendBeacon with plain token)
//   2. JSON object:       {"token":"eyJ..."}       (fallback / test clients)
router.post('/logout-beacon', async (req, res) => {
  // Always respond 204 immediately — browser tab may already be closing
  res.status(204).end();

  try {
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');

    // Extract token from whichever body format arrived
    let token;
    if (typeof req.body === 'string') {
      // text/plain — raw token string sent by sendBeacon
      token = req.body.trim();
    } else if (req.body && typeof req.body === 'object') {
      // JSON body fallback
      token = req.body.token || '';
    } else {
      return; // Nothing to parse
    }

    // Strip "Bearer " prefix if accidentally included
    token = token.replace(/^Bearer\s+/i, '').trim();

    if (!token) return;

    // Validate ObjectId format before DB query to prevent NoSQL injection
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id || !/^[a-f\d]{24}$/i.test(decoded.id)) return;

    // Clear sessionId so the old JWT is immediately invalidated server-side
    await User.findByIdAndUpdate(decoded.id, { sessionId: null });
  } catch {
    // Silently ignore — tab is closing, JWT may already be expired, etc.
  }
});

module.exports = router;

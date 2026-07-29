const express = require('express');
const router = express.Router();
const {
  createOrder, verifyPayment, handlePaymentFailure, getMyOrders, getOrder,
  getAllOrders, updateOrderStatus, cancelOrder, validateCoupon, trackOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Public route — guest order tracking (no auth needed)
router.get('/track', trackOrder);

router.use(protect);
router.post('/', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/validate-coupon', validateCoupon);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);
router.post('/:id/payment-failed', handlePaymentFailure);

// Admin routes
router.get('/', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

module.exports = router;

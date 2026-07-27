const express = require('express');
const router = express.Router();
const {
  createOrder, verifyPayment, getMyOrders, getOrder,
  getAllOrders, updateOrderStatus, cancelOrder, validateCoupon,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect);
router.post('/', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/validate-coupon', validateCoupon);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.get('/', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

module.exports = router;

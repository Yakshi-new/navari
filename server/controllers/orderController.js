const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// @desc   Create order
// @route  POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Verify items and compute prices from DB (trust server prices)
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for: ${product.name}`);
    }

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    subtotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price,
      quantity: item.quantity,
      size: item.size || '',
      color: item.color || '',
    });
  }

  // Coupon validation
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && coupon.expiresAt > new Date() && subtotal >= coupon.minOrderAmount) {
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount > 0) discount = Math.min(discount, coupon.maxDiscountAmount);
      } else {
        discount = coupon.discountValue;
      }
      coupon.usedCount += 1;
      await coupon.save();
    }
  }

  const shippingCharge = subtotal >= 999 ? 0 : 99;
  const totalAmount = subtotal - discount + shippingCharge;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCharge,
    discount,
    couponCode: couponCode || '',
    totalAmount,
    statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
  });

  // Decrement stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  // If Razorpay, create payment order
  if (paymentMethod === 'razorpay') {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: order._id.toString(),
    });
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
    return res.status(201).json({
      success: true,
      data: order,
      razorpayOrderId: razorpayOrder.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  }

  res.status(201).json({ success: true, data: order });
});

// @desc   Verify Razorpay payment
// @route  POST /api/orders/verify-payment
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      $push: { statusHistory: { status: 'confirmed', note: 'Payment received' } },
    },
    { new: true }
  );

  res.json({ success: true, data: order });
});

// @desc   Get user orders
// @route  GET /api/orders/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .select('-__v');
  res.json({ success: true, data: orders });
});

// @desc   Get single order
// @route  GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images slug');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Non-admin can only see their own orders
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, data: order });
});

// @desc   Get all orders (admin)
// @route  GET /api/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc   Update order status (admin)
// @route  PUT /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, note, trackingNumber } = req.body;
  const update = {
    orderStatus,
    $push: { statusHistory: { status: orderStatus, note: note || '' } },
  };
  if (trackingNumber) update.trackingNumber = trackingNumber;
  if (orderStatus === 'delivered') update.deliveredAt = new Date();

  const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json({ success: true, data: order });
});

// @desc   Cancel order
// @route  PUT /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (['shipped', 'delivered'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error('Cannot cancel a shipped or delivered order');
  }

  order.orderStatus = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by customer' });
  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  res.json({ success: true, data: order });
});

// @desc   Validate coupon
// @route  POST /api/orders/validate-coupon
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date())) {
    res.status(404);
    throw new Error('Invalid or expired coupon');
  }
  if (subtotal < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount ₹${coupon.minOrderAmount} required`);
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount > 0) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
  } else {
    discountAmount = coupon.discountValue;
  }

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discountAmount),
      description: coupon.description,
    },
  });
});

module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  validateCoupon,
};

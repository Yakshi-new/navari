const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc   Get all coupons (admin)
// @route  GET /api/coupons
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, data: coupons });
});

// @desc   Create coupon (admin)
// @route  POST /api/coupons
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

// @desc   Update coupon (admin)
// @route  PUT /api/coupons/:id
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  res.json({ success: true, data: coupon });
});

// @desc   Delete coupon (admin)
// @route  DELETE /api/coupons/:id
const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon };

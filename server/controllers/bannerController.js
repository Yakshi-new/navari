const asyncHandler = require('express-async-handler');
const Banner = require('../models/Banner');

// @desc   Get active hero banners
// @route  GET /api/banners?type=hero
const getBanners = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.type) filter.type = req.query.type;
  const banners = await Banner.find(filter).sort('displayOrder');
  res.json({ success: true, data: banners });
});

// @desc   Get all banners (admin)
// @route  GET /api/banners/admin/all
const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort('type displayOrder');
  res.json({ success: true, data: banners });
});

// @desc   Create banner (admin)
// @route  POST /api/banners
const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, data: banner });
});

// @desc   Update banner (admin)
// @route  PUT /api/banners/:id
const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!banner) { res.status(404); throw new Error('Banner not found'); }
  res.json({ success: true, data: banner });
});

// @desc   Delete banner (admin)
// @route  DELETE /api/banners/:id
const deleteBanner = asyncHandler(async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Banner deleted' });
});

module.exports = { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner };

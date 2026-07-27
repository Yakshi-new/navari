const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');

// @desc   Get reviews for a product
// @route  GET /api/reviews?product=:productId
const getReviews = asyncHandler(async (req, res) => {
  const filter = { isApproved: true };
  if (req.query.product) filter.product = req.query.product;
  const reviews = await Review.find(filter)
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.json({ success: true, data: reviews });
});

// @desc   Create review
// @route  POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;
  const review = await Review.create(req.body);
  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, data: review });
});

// @desc   Update review approval (admin)
// @route  PUT /api/reviews/:id
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!review) { res.status(404); throw new Error('Review not found'); }
  res.json({ success: true, data: review });
});

// @desc   Delete review (admin or owner)
// @route  DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  await review.deleteOne();
  await Review.calcAverageRatings(review.product);
  res.json({ success: true, message: 'Review deleted' });
});

// @desc   Get all reviews (admin)
// @route  GET /api/reviews/admin/all
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('user', 'name email')
    .populate('product', 'name')
    .sort('-createdAt');
  res.json({ success: true, data: reviews });
});

module.exports = { getReviews, createReview, updateReview, deleteReview, getAllReviews };

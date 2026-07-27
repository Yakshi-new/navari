const asyncHandler = require('express-async-handler');
const Newsletter = require('../models/Newsletter');

// @desc   Subscribe to newsletter
// @route  POST /api/newsletter/subscribe
// @access Public
const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = await Newsletter.findOne({ email: cleanEmail });

  if (existing) {
    return res.json({
      success: true,
      message: 'You are already subscribed to the Navari newsletter!',
    });
  }

  await Newsletter.create({ email: cleanEmail });

  res.status(201).json({
    success: true,
    message: 'Thank you for subscribing! Check your inbox for exclusive updates.',
  });
});

// @desc   Get all newsletter subscribers
// @route  GET /api/newsletter
// @access Private/Admin
const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Newsletter.find().sort('-createdAt');
  res.json({
    success: true,
    data: subscribers,
  });
});

// @desc   Delete a subscriber
// @route  DELETE /api/newsletter/:id
// @access Private/Admin
const deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

  if (!subscriber) {
    res.status(404);
    throw new Error('Subscriber record not found');
  }

  res.json({
    success: true,
    message: 'Subscriber removed successfully',
  });
});

module.exports = {
  subscribeNewsletter,
  getSubscribers,
  deleteSubscriber,
};

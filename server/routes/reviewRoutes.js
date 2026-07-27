const express = require('express');
const router = express.Router();
const { getReviews, createReview, updateReview, deleteReview, getAllReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getReviews);
router.get('/admin/all', protect, adminOnly, getAllReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, adminOnly, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  subscribeNewsletter,
  getSubscribers,
  deleteSubscriber,
} = require('../controllers/newsletterController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.post('/subscribe', subscribeNewsletter);
router.get('/', protect, adminOnly, getSubscribers);
router.delete('/:id', protect, adminOnly, deleteSubscriber);

module.exports = router;

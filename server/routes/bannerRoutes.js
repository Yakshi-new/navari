const express = require('express');
const router = express.Router();
const { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getBanners);
router.get('/admin/all', protect, adminOnly, getAllBanners);
router.post('/', protect, adminOnly, createBanner);
router.put('/:id', protect, adminOnly, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

module.exports = router;

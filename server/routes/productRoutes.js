const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getFeaturedProducts, getNewArrivals,
  createProduct, updateProduct, deleteProduct, getAdminProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/admin/all', protect, adminOnly, getAdminProducts);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;

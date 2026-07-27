const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, updateUser } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, updateUser } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const backupRoutes = require('./backupRoutes');

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

// ── Backup management routes ── POST /api/admin/backup/run, GET /api/admin/backup/list, etc.
router.use('/backup', backupRoutes);

module.exports = router;


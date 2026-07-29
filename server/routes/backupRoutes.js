/**
 * backupRoutes.js — Admin Backup API Routes
 *
 * All routes require: protect + adminOnly middleware.
 *
 * POST /api/admin/backup/run    → Trigger manual backup now
 * GET  /api/admin/backup/list   → List all stored backups
 * GET  /api/admin/backup/status → Scheduler status + next run time
 */

const express = require('express');
const router = express.Router();
const { triggerManualBackup, getBackupList, getBackupStatus } = require('../controllers/backupController');

// All backup routes are admin-only (protect + adminOnly applied in adminRoutes.js via router.use())
router.post('/run', triggerManualBackup);
router.get('/list', getBackupList);
router.get('/status', getBackupStatus);

module.exports = router;

/**
 * backupController.js — Admin API endpoints for data backup management
 *
 * Routes (all admin-protected):
 *   POST   /api/admin/backup/run     — Trigger a manual backup immediately
 *   GET    /api/admin/backup/list    — List all available backups
 *   GET    /api/admin/backup/status  — Get scheduler status + next run info
 */

const asyncHandler = require('express-async-handler');
const { runBackup, listBackups } = require('../utils/backupService');

// =====================================================================
// TRIGGER MANUAL BACKUP
// @route  POST /api/admin/backup/run
// =====================================================================
const triggerManualBackup = asyncHandler(async (req, res) => {
  console.log(`🛠️  [Backup] Manual backup triggered by admin: ${req.user?.email}`);

  const result = await runBackup({ manual: true });

  res.status(result.success ? 200 : 207).json({
    success: result.success,
    message: result.success
      ? `Backup completed successfully (${result.size})`
      : `Backup completed with ${result.errors.length} error(s)`,
    data: {
      folder: result.folder,
      collections: result.collections,
      size: result.size,
      errors: result.errors,
    },
  });
});

// =====================================================================
// LIST ALL BACKUPS
// @route  GET /api/admin/backup/list
// =====================================================================
const getBackupList = asyncHandler(async (req, res) => {
  const backups = listBackups();
  res.json({
    success: true,
    count: backups.length,
    data: backups,
  });
});

// =====================================================================
// SCHEDULER STATUS
// @route  GET /api/admin/backup/status
// =====================================================================
const getBackupStatus = asyncHandler(async (req, res) => {
  const backups = listBackups();
  const latest = backups[0] || null;

  // Calculate next backup time (00:10 AM IST)
  const now = new Date();
  const nextRun = new Date();
  nextRun.setHours(0, 10, 0, 0);
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1); // tomorrow 00:10 AM
  }

  res.json({
    success: true,
    data: {
      schedulerActive: true,
      schedule: 'Daily at 00:10 AM IST',
      timezone: 'Asia/Kolkata',
      nextRun: nextRun.toISOString(),
      totalBackups: backups.length,
      maxBackups: 15,
      latestBackup: latest,
    },
  });
});

module.exports = { triggerManualBackup, getBackupList, getBackupStatus };

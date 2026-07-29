/**
 * backupScheduler.js — Daily Backup Cron Job
 *
 * Registers a node-cron job that fires at 00:10 AM every day.
 * Import and call initBackupScheduler() once in server.js after DB connects.
 *
 * Cron expression: "10 0 * * *"
 *   ┌───── minute  (10)
 *   │ ┌─── hour    (0 = midnight)
 *   │ │ ┌─ day of month (*)
 *   │ │ │ ┌ month (*)
 *   │ │ │ │ ┌ day of week (*)
 *   10 0 * * *
 */

const cron = require('node-cron');
const { runBackup } = require('../utils/backupService');

/** Cron schedule: every day at 00:10 AM */
const BACKUP_CRON = '10 0 * * *';

/**
 * initBackupScheduler — registers the scheduled backup job.
 * Safe to call multiple times (node-cron prevents double-registration internally).
 */
const initBackupScheduler = () => {
  if (!cron.validate(BACKUP_CRON)) {
    console.error('❌ [Backup Scheduler] Invalid cron expression:', BACKUP_CRON);
    return;
  }

  cron.schedule(BACKUP_CRON, async () => {
    console.log('\n⏰ [Backup Scheduler] Daily backup triggered at 00:10 AM');
    try {
      const result = await runBackup({ manual: false });
      if (result.success) {
        console.log(`✅ [Backup Scheduler] Daily backup completed successfully → ${result.folder} (${result.size})`);
      } else {
        console.warn(`⚠️  [Backup Scheduler] Daily backup completed with errors → ${result.folder}`);
        if (result.errors.length) {
          result.errors.forEach((e) => console.warn(`   - ${e}`));
        }
      }
    } catch (err) {
      console.error('❌ [Backup Scheduler] Unexpected error during daily backup:', err.message);
    }
  }, {
    timezone: 'Asia/Kolkata', // IST — change to your server timezone if needed
  });

  console.log('⏰ [Backup Scheduler] Daily backup scheduled at 00:10 AM IST (cron: ' + BACKUP_CRON + ')');
};

module.exports = { initBackupScheduler };

/**
 * backupService.js — Automated Daily Data Backup
 *
 * Strategy:
 *   - Uses Mongoose to query all collections and serialize to JSON.
 *   - Does NOT shell out to mongodump (no binary dependency needed).
 *   - Each backup is a folder:  backup/navari/data/YYYY-MM-DD_HH-MM-SS/
 *     containing one <CollectionName>.json per collection.
 *   - Runs automatically every day at 00:10 AM (cron: "10 0 * * *").
 *   - Keeps only the 15 most recent backups; older ones are deleted automatically.
 *
 * Backup folder layout:
 *   <project_root>/backup/navari/data/
 *     ├── 2025-07-01_00-10-00/
 *     │   ├── users.json
 *     │   ├── orders.json
 *     │   ├── products.json
 *     │   └── ...
 *     ├── 2025-07-02_00-10-00/
 *     │   └── ...
 *     └── ...
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// ── Configuration ──────────────────────────────────────────────────────────────

/** Root folder for all backups — relative to project root */
const BACKUP_ROOT = path.resolve(__dirname, '../../backup/navari/data');

/** Maximum number of daily backups to retain */
const MAX_BACKUPS = 15;

/**
 * Collections to back up.
 * Each entry is the Mongoose model name as registered with mongoose.model().
 * We use mongoose.modelNames() at runtime so any model registered anywhere is captured.
 */
const EXCLUDED_COLLECTIONS = []; // Add collection names here to skip them

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Pad a number to 2 digits.
 */
const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Generate a timestamp string suitable for folder names.
 * Format: YYYY-MM-DD_HH-MM-SS (local time)
 */
const getTimestamp = () => {
  const d = new Date();
  return (
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` +
    `_${pad2(d.getHours())}-${pad2(d.getMinutes())}-${pad2(d.getSeconds())}`
  );
};

/**
 * Ensure a directory exists (mkdir -p equivalent).
 */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Delete backup folders older than MAX_BACKUPS.
 * Folders are sorted by name (YYYY-MM-DD_HH-MM-SS) — oldest first.
 */
const pruneOldBackups = () => {
  ensureDir(BACKUP_ROOT);

  const entries = fs
    .readdirSync(BACKUP_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort(); // lexicographic sort = chronological for our timestamp format

  const toDelete = entries.slice(0, Math.max(0, entries.length - MAX_BACKUPS));

  for (const folder of toDelete) {
    const fullPath = path.join(BACKUP_ROOT, folder);
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`🗑️  [Backup] Removed old backup: ${folder}`);
    } catch (err) {
      console.error(`❌ [Backup] Failed to remove old backup ${folder}:`, err.message);
    }
  }
};

// ── Core Backup Function ───────────────────────────────────────────────────────

/**
 * runBackup — performs a full data dump of all registered Mongoose collections.
 *
 * @param {Object} options
 * @param {boolean} options.manual - If true, called from admin API; if false, scheduled.
 * @returns {Promise<{ success: boolean, folder: string, collections: string[], errors: string[], size: string }>}
 */
const runBackup = async ({ manual = false } = {}) => {
  const label = manual ? '🛠️  Manual' : '⏰ Scheduled';
  const timestamp = getTimestamp();
  const backupDir = path.join(BACKUP_ROOT, timestamp);
  const errors = [];
  const backedUp = [];

  console.log(`\n${label} backup started → ${backupDir}`);

  try {
    ensureDir(backupDir);

    // Get all registered Mongoose model names at runtime
    const modelNames = mongoose.modelNames().filter(
      (name) => !EXCLUDED_COLLECTIONS.includes(name)
    );

    if (modelNames.length === 0) {
      throw new Error('No Mongoose models registered. Ensure models are imported before backup runs.');
    }

    for (const modelName of modelNames) {
      try {
        const Model = mongoose.model(modelName);
        const documents = await Model.find({}).lean();
        const filePath = path.join(backupDir, `${modelName.toLowerCase()}s.json`);
        fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), 'utf8');
        backedUp.push(modelName);
        console.log(`  ✅ ${modelName}: ${documents.length} documents`);
      } catch (err) {
        const msg = `${modelName}: ${err.message}`;
        errors.push(msg);
        console.error(`  ❌ ${msg}`);
      }
    }

    // Write a backup manifest
    const manifest = {
      timestamp,
      manual,
      collections: backedUp,
      errors,
      generatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(
      path.join(backupDir, '_manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf8'
    );

    // Calculate total backup size
    const totalBytes = fs.readdirSync(backupDir).reduce((sum, file) => {
      try {
        return sum + fs.statSync(path.join(backupDir, file)).size;
      } catch {
        return sum;
      }
    }, 0);
    const sizeMB = (totalBytes / 1024 / 1024).toFixed(2);

    console.log(`\n${label} backup complete ✅`);
    console.log(`  📁 Folder:       ${backupDir}`);
    console.log(`  📦 Collections:  ${backedUp.length}`);
    console.log(`  📐 Total size:   ${sizeMB} MB`);
    if (errors.length) console.warn(`  ⚠️  Errors:       ${errors.length}`);

    // Prune old backups AFTER successful write
    pruneOldBackups();

    return {
      success: errors.length === 0,
      folder: timestamp,
      collections: backedUp,
      errors,
      size: `${sizeMB} MB`,
    };
  } catch (err) {
    console.error(`\n❌ [Backup] Fatal error during ${label.toLowerCase()} backup:`, err.message);
    // Remove empty / partial backup folder
    try {
      if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true });
    } catch {}
    return {
      success: false,
      folder: timestamp,
      collections: backedUp,
      errors: [...errors, err.message],
      size: '0 MB',
    };
  }
};

// ── List Backups ───────────────────────────────────────────────────────────────

/**
 * listBackups — returns metadata about all stored backup folders.
 */
const listBackups = () => {
  ensureDir(BACKUP_ROOT);

  const entries = fs
    .readdirSync(BACKUP_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .reverse(); // newest first

  return entries.map((folder) => {
    const folderPath = path.join(BACKUP_ROOT, folder);
    const manifestPath = path.join(folderPath, '_manifest.json');

    let manifest = null;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {}

    // Calculate folder size
    let totalBytes = 0;
    try {
      fs.readdirSync(folderPath).forEach((file) => {
        try {
          totalBytes += fs.statSync(path.join(folderPath, file)).size;
        } catch {}
      });
    } catch {}

    return {
      folder,
      size: `${(totalBytes / 1024 / 1024).toFixed(2)} MB`,
      collections: manifest?.collections || [],
      manual: manifest?.manual || false,
      errors: manifest?.errors || [],
      generatedAt: manifest?.generatedAt || null,
    };
  });
};

module.exports = { runBackup, listBackups, BACKUP_ROOT };

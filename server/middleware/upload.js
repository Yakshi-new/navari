/**
 * upload.js — VAPT-Hardened Multer Middleware
 *
 * Production:  stores files in Cloudinary (persistent, CDN-served).
 * Development: stores files on local disk (when CLOUDINARY_CLOUD_NAME is not set).
 *
 * Security:
 * 1. Path traversal    — category whitelisted; path validated to stay inside uploads/
 * 2. Filename safety   — only timestamp + random in filename (no originalname used)
 * 3. MIME double-check — extension + mimetype must both be image types
 * 4. File size limit   — 5MB max
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ VAPT: Whitelist of allowed category folders — prevents directory traversal
const ALLOWED_CATEGORIES = new Set([
  'sarees', 'lehengas', 'kurtis', 'accessories',
  'banners', 'general', 'products', 'categories',
]);

// ✅ VAPT: File filter — validates BOTH extension and MIME type
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);
const ALLOWED_EXTS = /\.(jpeg|jpg|png|gif|webp)$/i;

const fileFilter = (req, file, cb) => {
  const extOk = ALLOWED_EXTS.test(path.extname(file.originalname));
  const mimeOk = ALLOWED_MIMES.has(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(
      new Error('Only image files are allowed: JPEG, JPG, PNG, GIF, WEBP'),
      false
    );
  }
};

const multerLimits = {
  fileSize: 5 * 1024 * 1024, // 5MB max
  files: 5,
  fields: 10,
};

// ─────────────────────────────────────────────
// PRODUCTION: Cloudinary storage
// ─────────────────────────────────────────────
let upload;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  const cloudinary = require('../config/cloudinary');
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: (req) => {
      let rawCategory = (req.query.category || req.body.category || 'general')
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '');

      if (!ALLOWED_CATEGORIES.has(rawCategory)) rawCategory = 'general';

      return {
        folder: `vastra/${rawCategory}`,           // Organised by category in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }], // Auto-optimise
        public_id: `${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
      };
    },
  });

  upload = multer({ storage: cloudinaryStorage, fileFilter, limits: multerLimits });

} else {
  // ─────────────────────────────────────────────
  // DEVELOPMENT: Local disk storage (fallback)
  // ─────────────────────────────────────────────
  const UPLOADS_ROOT = path.resolve(__dirname, '..', 'uploads');

  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      let rawCategory = (req.query.category || req.body.category || 'general')
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '');

      if (!ALLOWED_CATEGORIES.has(rawCategory)) rawCategory = 'general';

      const uploadPath = path.resolve(UPLOADS_ROOT, rawCategory);

      // ✅ VAPT: Boundary check
      if (!uploadPath.startsWith(UPLOADS_ROOT + path.sep) && uploadPath !== UPLOADS_ROOT) {
        return cb(new Error('Invalid upload destination'));
      }

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      const MIME_TO_EXT = {
        'image/jpeg': '.jpg',
        'image/jpg':  '.jpg',
        'image/png':  '.png',
        'image/gif':  '.gif',
        'image/webp': '.webp',
      };
      const ext = MIME_TO_EXT[file.mimetype] || '.jpg';
      const safeName = `${Date.now()}-${Math.floor(Math.random() * 1e9)}${ext}`;
      cb(null, safeName);
    },
  });

  upload = multer({ storage: diskStorage, fileFilter, limits: multerLimits });
}

module.exports = upload;

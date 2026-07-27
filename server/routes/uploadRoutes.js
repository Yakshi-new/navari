const express = require('express');
const router = express.Router();
const path = require('path');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

/**
 * Returns the public URL for an uploaded file.
 * - Cloudinary: req.file.path is the full CDN URL
 * - Local disk:  build a relative /uploads/<category>/<filename> path
 */
function resolveUrl(file) {
  // Cloudinary sets file.path to the secure CDN URL
  if (file.path && file.path.startsWith('http')) return file.path;

  // Local disk: build relative URL
  const categoryFolder = path.basename(file.destination || '');
  return `/uploads/${categoryFolder}/${file.filename}`;
}

// @desc   Upload single image
// @route  POST /api/upload/single?category=sarees
router.post('/single', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const url = resolveUrl(req.file);
  res.json({ success: true, url, filename: req.file.filename || path.basename(url) });
});

// @desc   Upload multiple images
// @route  POST /api/upload/multiple?category=sarees
router.post('/multiple', protect, adminOnly, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }
  const urls = req.files.map(resolveUrl);
  res.json({ success: true, urls });
});

module.exports = router;

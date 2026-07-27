const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['hero', 'announcement', 'promo', 'offer'],
      required: true,
    },
    // Hero slide fields
    badge: { type: String },
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String }, // /uploads/banners/imagename.jpg
    primaryBtnText: { type: String },
    primaryBtnLink: { type: String },
    secondaryBtnText: { type: String },
    secondaryBtnLink: { type: String },
    topTagText: { type: String, default: 'Premium Silk • ₹4,999' },
    bottomTagText: { type: String, default: '4.9 · 2,300 Reviews' },
    // Special offer fields
    couponCode: { type: String },
    offerEndDate: { type: Date },
    // Announcement bar fields
    announcements: [
      {
        text: String,
        order: { type: Number, default: 0 },
      },
    ],
    // Common
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    bgColor: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);

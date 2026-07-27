const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: [true, 'Description is required'] },
    shortDescription: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subcategory: { type: String, trim: true },
    occasion: {
      type: String,
      enum: ['bridal', 'festive', 'party', 'casual', 'office', 'all'],
      default: 'all',
    },
    fabric: { type: String, trim: true },
    // Images stored as server paths: /uploads/category/imagename.jpg
    images: [{ type: String }],
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 0 },
    sizes: [{ type: String }],
    colors: [
      {
        name: String,
        hex: String,
      },
    ],
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isSale: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    weight: { type: String },
    careInstructions: { type: String },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

// Auto-generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Index for text search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Product', productSchema);

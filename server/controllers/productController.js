const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// Build filter object from query params
const buildFilter = (query) => {
  const filter = { isActive: true };

  if (query.category) filter.category = query.category;
  if (query.occasion) filter.occasion = query.occasion;
  if (query.isFeatured === 'true') filter.isFeatured = true;
  if (query.isNew === 'true') filter.isNew = true;
  if (query.isSale === 'true') filter.isSale = true;
  if (query.fabric) filter.fabric = { $regex: query.fabric, $options: 'i' };
  if (query.sizes) filter.sizes = { $in: query.sizes.split(',') };

  // Price range
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  // Full text search
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

// @desc   Get all products (public)
// @route  GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const filter = buildFilter(req.query);

  // Sort
  let sort = '-createdAt';
  if (req.query.sort === 'price-asc') sort = 'price';
  if (req.query.sort === 'price-desc') sort = '-price';
  if (req.query.sort === 'rating') sort = '-ratingsAverage';
  if (req.query.sort === 'popular') sort = '-soldCount';
  if (req.query.sort === 'new') sort = '-createdAt';

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v'),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc   Get single product by id or slug
// @route  GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const idOrSlug = req.params.id;
  const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);

  const product = await Product.findOne(
    isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }
  )
    .populate('category', 'name slug')
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'name avatar' },
      match: { isApproved: true },
    });

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, data: product });
});

// @desc   Get featured products
// @route  GET /api/products/featured
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8)
    .sort('-createdAt');
  res.json({ success: true, data: products });
});

// @desc   Get new arrivals products
// @route  GET /api/products/new-arrivals
const getNewArrivals = asyncHandler(async (req, res) => {
  let products = await Product.find({ isNew: true, isActive: true })
    .populate('category', 'name slug')
    .limit(6)
    .sort('-createdAt');

  if (products.length < 6) {
    const existingIds = products.map((p) => p._id);
    const additional = await Product.find({ isActive: true, _id: { $nin: existingIds } })
      .populate('category', 'name slug')
      .limit(6 - products.length)
      .sort('-createdAt');
    products = [...products, ...additional];
  }
  res.json({ success: true, data: products });
});

// @desc   Create product (admin)
// @route  POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc   Update product (admin)
// @route  PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, data: product });
});

// @desc   Delete product (admin)
// @route  DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, message: 'Product deactivated successfully' });
});

// @desc   Get all products for admin (including inactive)
// @route  GET /api/products/admin/all
const getAdminProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search) filter.$text = { $search: req.query.search };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getNewArrivals,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
};

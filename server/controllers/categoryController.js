const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

// @desc   Get all categories
// @route  GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort('displayOrder name')
    .populate('children')
    .populate('parent', 'name');
  res.json({ success: true, data: categories });
});

// @desc   Get single category
// @route  GET /api/categories/:id
const getCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id).populate('children');
  if (!cat) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, data: cat });
});

// @desc   Create category (admin)
// @route  POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

// @desc   Update category (admin)
// @route  PUT /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, data: category });
});

// @desc   Delete category (admin)
// @route  DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, message: 'Category deactivated' });
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };

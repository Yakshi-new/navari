const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

// @desc   Get dashboard stats
// @route  GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    totalOrders,
    monthOrders,
    pendingOrders,
    totalProducts,
    totalUsers,
    recentOrders,
    topProducts,
    ordersByStatus,
    revenueByDay,
  ] = await Promise.all([
    // Total revenue (delivered orders)
    Order.aggregate([
      { $match: { orderStatus: { $in: ['delivered', 'shipped', 'confirmed'] }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    // This month revenue
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    // Last month revenue
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ orderStatus: 'placed' }),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'customer' }),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Product.find().sort('-soldCount').limit(5).select('name images soldCount ratingsAverage price'),
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]),
    // Revenue by last 7 days
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: monthRevenue[0]?.total || 0,
        lastMonth: lastMonthRevenue[0]?.total || 0,
      },
      orders: {
        total: totalOrders,
        thisMonth: monthOrders,
        pending: pendingOrders,
      },
      products: totalProducts,
      users: totalUsers,
      recentOrders,
      topProducts,
      ordersByStatus,
      revenueByDay,
    },
  });
});

// @desc   Get all users (admin)
// @route  GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc   Toggle user active status or role
// @route  PUT /api/admin/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...(isActive !== undefined && { isActive }), ...(role && { role }) },
    { new: true }
  );
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

module.exports = { getDashboardStats, getAllUsers, updateUser };

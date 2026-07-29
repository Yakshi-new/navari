const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');
require('dotenv').config();

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Banner = require('./models/Banner');
const Coupon = require('./models/Coupon');

const connectDB = require('./config/db');

const makeSlug = (name) => slugify(name, { lower: true, strict: true });

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...\n');

  // Drop indexes that may conflict, then clear data
  try {
    await Product.collection.dropIndex('slug_1');
  } catch (e) { /* ignore if doesn't exist */ }

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Banner.deleteMany({}),
    Coupon.deleteMany({}),
  ]);
  console.log('✅ Cleared existing data');

  // ---- USERS ----
  await User.create({
    name: 'Admin',
    email: 'admin@vastraelegance.com',
    password: 'admin123',
    role: 'admin',
    phone: '9999999999',
  });
  await User.create({
    name: 'Test Customer',
    email: 'customer@test.com',
    password: 'test123',
    role: 'customer',
    phone: '8888888888',
  });
  console.log('✅ Users created (admin@vastraelegance.com / admin123)');

  // ---- CATEGORIES ----
  const sarees = await Category.create({ name: 'Sarees', description: 'Handwoven and designer sarees', image: '/uploads/sarees/hero-saree.png', displayOrder: 1 });
  const lehengas = await Category.create({ name: 'Lehengas', description: 'Bridal and festive lehengas', image: '/uploads/banners/collection.png', displayOrder: 2 });
  const kurtis = await Category.create({ name: 'Kurtis & Suits', description: 'Ethnic and fusion kurtis', image: '/uploads/kurtis/product-kurti.png', displayOrder: 3 });
  const accessories = await Category.create({ name: 'Accessories', description: 'Ethnic jewelry and accessories', image: '/uploads/accessories/product-kurti.png', displayOrder: 4 });
  console.log('✅ Categories created');

  // ---- PRODUCTS (with slugs pre-generated) ----
  const products = [
    {
      name: 'Royal Crimson Banarasi Silk Saree',
      slug: makeSlug('Royal Crimson Banarasi Silk Saree'),
      description: 'Handcrafted crimson Banarasi silk saree with authentic gold zari weave. Perfect for bridal and festive occasions. Each piece takes 15–20 days to weave by master artisans in Varanasi.',
      shortDescription: 'Premium Banarasi silk with gold zari',
      category: sarees._id,
      subcategory: 'Banarasi Sarees',
      occasion: 'bridal',
      fabric: 'Pure Silk',
      images: ['/uploads/sarees/hero-saree.png'],
      price: 8999,
      discountPrice: 6999,
      stock: 15,
      sizes: ['Free Size'],
      colors: [{ name: 'Crimson', hex: '#C41E3A' }, { name: 'Maroon', hex: '#800000' }],
      isFeatured: true,
      isNew: true,
      isSale: true,
      isActive: true,
      ratingsAverage: 4.9,
      ratingsCount: 230,
      soldCount: 450,
      tags: ['silk', 'banarasi', 'bridal', 'zari'],
    },
    {
      name: 'Royal Bridal Lehenga',
      slug: makeSlug('Royal Bridal Lehenga'),
      description: 'Exquisite bridal lehenga adorned with real zardozi and mirror work. Makes every bride look divine on her special day.',
      shortDescription: 'Zardozi mirror work bridal lehenga',
      category: lehengas._id,
      subcategory: 'Bridal Lehengas',
      occasion: 'bridal',
      fabric: 'Net with Silk Lining',
      images: ['/uploads/lehengas/hero-lehenga.png'],
      price: 24999,
      discountPrice: 18999,
      stock: 8,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: [{ name: 'Gold', hex: '#C9963C' }, { name: 'Ivory', hex: '#FFFFF0' }],
      isFeatured: true,
      isNew: false,
      isSale: true,
      isActive: true,
      ratingsAverage: 4.8,
      ratingsCount: 185,
      soldCount: 320,
      tags: ['lehenga', 'bridal', 'zardozi', 'mirror work'],
    },
    {
      name: 'Anarkali Kurti Set',
      slug: makeSlug('Anarkali Kurti Set'),
      description: 'Elegant Anarkali style kurti with palazzo pants. Perfect for festive and casual occasions. Made from premium georgette with intricate print work.',
      shortDescription: 'Festive Anarkali with palazzo',
      category: kurtis._id,
      subcategory: 'Anarkali Suits',
      occasion: 'festive',
      fabric: 'Georgette',
      images: ['/uploads/kurtis/product-kurti.png'],
      price: 3499,
      discountPrice: 2499,
      stock: 30,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: [{ name: 'Pink', hex: '#F4A7B9' }, { name: 'Blue', hex: '#4169E1' }],
      isFeatured: true,
      isNew: true,
      isSale: false,
      isActive: true,
      ratingsAverage: 4.6,
      ratingsCount: 94,
      soldCount: 210,
      tags: ['anarkali', 'festive', 'kurti', 'palazzo'],
    },
    {
      name: 'Kanjivaram Silk Saree',
      slug: makeSlug('Kanjivaram Silk Saree'),
      description: 'Authentic Kanjivaram silk saree from Tamil Nadu weavers with temple border design. Each piece is a one-of-a-kind work of art.',
      shortDescription: 'Authentic Kanjivaram temple border',
      category: sarees._id,
      subcategory: 'Kanjivaram Sarees',
      occasion: 'festive',
      fabric: 'Pure Kanjivaram Silk',
      images: ['/uploads/sarees/product-saree.png'],
      price: 12999,
      discountPrice: 0,
      stock: 12,
      sizes: ['Free Size'],
      colors: [{ name: 'Green', hex: '#2D6A4F' }, { name: 'Purple', hex: '#7B2FBE' }],
      isFeatured: false,
      isNew: false,
      isSale: false,
      isActive: true,
      ratingsAverage: 4.7,
      ratingsCount: 67,
      soldCount: 130,
      tags: ['kanjivaram', 'silk', 'temple border', 'south indian'],
    },
    {
      name: 'Festive Party Lehenga',
      slug: makeSlug('Festive Party Lehenga'),
      description: 'Glamorous party wear lehenga with sequin embroidery and flared skirt for a stunning look. Comes with matching dupatta.',
      shortDescription: 'Sequin party wear lehenga',
      category: lehengas._id,
      subcategory: 'Party Wear',
      occasion: 'party',
      fabric: 'Velvet with Net',
      images: ['/uploads/lehengas/product-lehenga.png'],
      price: 9999,
      discountPrice: 7499,
      stock: 20,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ name: 'Navy', hex: '#003153' }, { name: 'Wine', hex: '#722F37' }],
      isFeatured: true,
      isNew: true,
      isSale: true,
      isActive: true,
      ratingsAverage: 4.5,
      ratingsCount: 112,
      soldCount: 280,
      tags: ['party', 'lehenga', 'sequin', 'festive'],
    },
    {
      name: 'Chikankari Cotton Kurti',
      slug: makeSlug('Chikankari Cotton Kurti'),
      description: 'Hand embroidered Lucknawi chikankari kurti. Light, breathable and perfect for summer outings or daily wear.',
      shortDescription: 'Lucknawi chikankari cotton kurti',
      category: kurtis._id,
      subcategory: 'Straight Kurtis',
      occasion: 'casual',
      fabric: 'Pure Cotton',
      images: ['/uploads/kurtis/product-kurti.png'],
      price: 1899,
      discountPrice: 1499,
      stock: 50,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Peach', hex: '#FFDAB9' }],
      isFeatured: false,
      isNew: true,
      isSale: true,
      isActive: true,
      ratingsAverage: 4.4,
      ratingsCount: 57,
      soldCount: 180,
      tags: ['chikankari', 'cotton', 'summer', 'casual'],
    },
    {
      name: 'Designer Silk Salwar Suit',
      slug: makeSlug('Designer Silk Salwar Suit'),
      description: 'Premium designer salwar suit in pure silk with intricate thread embroidery. Ideal for weddings and celebrations.',
      shortDescription: 'Pure silk salwar with thread work',
      category: kurtis._id,
      subcategory: 'Salwar Kameez',
      occasion: 'festive',
      fabric: 'Pure Silk',
      images: ['/uploads/kurtis/product-kurti.png'],
      price: 6499,
      discountPrice: 5299,
      stock: 18,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Teal', hex: '#008080' }, { name: 'Mauve', hex: '#E0B0FF' }],
      isFeatured: true,
      isNew: false,
      isSale: true,
      isActive: true,
      ratingsAverage: 4.7,
      ratingsCount: 88,
      soldCount: 175,
      tags: ['salwar', 'silk', 'designer', 'festive'],
    },
    {
      name: 'Ethnic Silver Jewelry Set',
      slug: makeSlug('Ethnic Silver Jewelry Set'),
      description: 'Oxidized silver ethnic jewelry set including necklace, earrings and bangles. Perfect to pair with any ethnic outfit.',
      shortDescription: 'Oxidized silver necklace, earrings & bangles',
      category: accessories._id,
      subcategory: 'Jewelry',
      occasion: 'all',
      fabric: 'Metal',
      images: ['/uploads/accessories/product-kurti.png'],
      price: 2499,
      discountPrice: 1799,
      stock: 40,
      sizes: ['Free Size'],
      colors: [{ name: 'Silver', hex: '#C0C0C0' }],
      isFeatured: false,
      isNew: true,
      isSale: true,
      isActive: true,
      ratingsAverage: 4.3,
      ratingsCount: 42,
      soldCount: 95,
      tags: ['jewelry', 'silver', 'oxidized', 'accessories'],
    },
  ];

  await Product.insertMany(products);
  console.log('✅ Products created');

  // ---- BANNERS ----
  await Banner.create({
    type: 'announcement',
    title: 'Announcements',
    announcements: [
      { text: '✨ Free Shipping on orders above ₹999', order: 1 },
      { text: '🎁 Use code VASTRA20 for 20% OFF', order: 2 },
      { text: '🌸 New Arrivals Every Week!', order: 3 },
    ],
    isActive: true,
  });

  await Banner.insertMany([
    {
      type: 'hero',
      badge: '✨ New Collection 2025',
      title: 'Drape Yourself in <span>Royal Silk</span> Elegance',
      subtitle: 'Discover our exquisite collection of handwoven Banarasi silk sarees — each a masterpiece of centuries-old artistry.',
      image: '/uploads/banners/hero-saree.png',
      primaryBtnText: 'Shop Sarees',
      primaryBtnLink: '/shop?category=Sarees',
      secondaryBtnText: 'Explore Collection',
      secondaryBtnLink: '/shop',
      isActive: true,
      displayOrder: 1,
    },
    {
      type: 'hero',
      badge: '👑 Bridal Special',
      title: 'Bridal <span>Lehenga</span> Dreams Come True',
      subtitle: 'Shine on your most special day with our meticulously crafted bridal lehengas adorned with real zardozi and mirror work.',
      image: '/uploads/banners/hero-lehenga.png',
      primaryBtnText: 'Bridal Collection',
      primaryBtnLink: '/shop?category=Lehengas',
      secondaryBtnText: 'View Lookbook',
      secondaryBtnLink: '/shop',
      isActive: true,
      displayOrder: 2,
    },
    {
      type: 'hero',
      badge: '🌸 Festival Season',
      title: 'Celebrate Every <span>Festive Moment</span> in Style',
      subtitle: 'From Navratri to Diwali — our festive collection has designer kurtis, salwar suits, and ethnic sets to make you shine.',
      image: '/uploads/banners/collection.png',
      primaryBtnText: 'Shop Festive',
      primaryBtnLink: '/shop?occasion=festive',
      secondaryBtnText: 'Upto 40% OFF',
      secondaryBtnLink: '/shop?sort=sale',
      isActive: true,
      displayOrder: 3,
    },
  ]);
  console.log('✅ Banners created');

  // ---- COUPONS ----
  await Coupon.insertMany([
    {
      code: 'VASTRA20',
      description: '20% off on all orders above ₹999',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 999,
      maxDiscountAmount: 500,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'WELCOME100',
      description: '₹100 flat off for new customers',
      discountType: 'fixed',
      discountValue: 100,
      minOrderAmount: 500,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'BRIDE2025',
      description: '15% off on Bridal collection',
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 5000,
      maxDiscountAmount: 2000,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log('✅ Coupons created');

  console.log('\n🎉 Seeding complete!');
  console.log('👤 Admin: admin@vastraelegance.com / admin123');
  console.log('👤 Customer: customer@test.com / test123');
  console.log('🏷️  Coupons: VASTRA20 (20% off), WELCOME100 (₹100 off), BRIDE2025 (15% off)\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});

const { connectDatabase, disconnectDatabase } = require('./database');
const { Voucher } = require('../models/Voucher');
const { Promotion } = require('../models/Promotion');
const { Order } = require('../models/Order');
const { Product } = require('../models/Product');
const { Category } = require('../models/Category');
const { Types } = require('mongoose');

const categories = [
  'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors',
  'Books', 'Toys & Games', 'Health & Beauty', 'Automotive',
  'Food & Beverages', 'Pet Supplies', 'Office Supplies', 'Jewelry'
];

const productNames = [
  'Wireless Headphones', 'Smart Watch', 'Laptop Stand', 'USB-C Cable',
  'Running Shoes', 'Yoga Mat', 'Water Bottle', 'Backpack',
  'Coffee Maker', 'Blender', 'Microwave', 'Air Fryer',
  'Novel Collection', 'Cookbook', 'Children Book', 'Comic Book',
  'Action Figure', 'Board Game', 'Puzzle', 'LEGO Set',
  'Face Cream', 'Shampoo', 'Toothbrush', 'Vitamins',
  'Car Battery', 'Tire Pressure Gauge', 'Car Phone Mount', 'Dash Cam',
  'Chocolate Bar', 'Energy Drink', 'Protein Powder', 'Snack Mix',
  'Dog Food', 'Cat Litter', 'Pet Toy', 'Pet Bed',
  'Notebook', 'Pen Set', 'Desk Organizer', 'Monitor Stand',
  'Gold Necklace', 'Silver Ring', 'Diamond Earrings', 'Watch'
];

const discountCodes = [
  'SUMMER2025', 'WINTER2025', 'SPRING2025', 'FALL2025',
  'BLACKFRIDAY', 'CYBERMONDAY', 'NEWYEAR', 'CHRISTMAS',
  'STUDENT10', 'WELCOME20', 'LOYALTY15', 'BIRTHDAY25'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDecimal(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

async function seedCategories() {
  console.log('🌱 Seeding Categories...');
  await Category.deleteMany({});
  
  const categoryDocs = categories.map(name => ({
    name,
    description: `${name} category with various products`,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const inserted = await Category.insertMany(categoryDocs);
  console.log(`✅ Created ${inserted.length} categories`);
  return inserted.map(cat => cat._id);
}

async function seedProducts(categoryIds) {
  console.log('🌱 Seeding Products...');
  await Product.deleteMany({});
  
  const products = [];
  for (let i = 0; i < 30; i++) {
    const categoryId = getRandomElement(categoryIds);
    const name = getRandomElement(productNames);
    const price = getRandomDecimal(10, 500, 2);
    
    products.push({
      name: `${name} ${i + 1}`,
      description: `High-quality ${name.toLowerCase()} with excellent features`,
      price,
      categoryId: categoryId,
      stock: getRandomNumber(10, 500),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  const inserted = await Product.insertMany(products);
  console.log(`✅ Created ${inserted.length} products`);
  return inserted.map(prod => prod._id);
}

async function seedVouchers() {
  console.log('🌱 Seeding Vouchers...');
  await Voucher.deleteMany({});
  
  const vouchers = [];
  const now = new Date();
  
  for (let i = 0; i < 8; i++) {
    const discountType = getRandomElement(['percentage', 'fixed']);
    const discountValue = discountType === 'percentage' 
      ? getRandomNumber(5, 30) 
      : getRandomNumber(10, 100);
    
    vouchers.push({
      code: discountCodes[i] || `VCH-${String(i + 1).padStart(6, '0')}`,
      discountType,
      discountValue,
      expirationDate: getRandomDate(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
      usageLimit: getRandomNumber(50, 500),
      usedCount: getRandomNumber(0, 50),
      minOrderValue: getRandomNumber(20, 200),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  for (let i = 0; i < 2; i++) {
    vouchers.push({
      code: `INACTIVE-${i + 1}`,
      discountType: getRandomElement(['percentage', 'fixed']),
      discountValue: getRandomNumber(10, 50),
      expirationDate: getRandomDate(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
      usageLimit: getRandomNumber(50, 200),
      usedCount: 0,
      minOrderValue: getRandomNumber(20, 100),
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  for (let i = 0; i < 2; i++) {
    vouchers.push({
      code: `EXPIRED-${i + 1}`,
      discountType: getRandomElement(['percentage', 'fixed']),
      discountValue: getRandomNumber(10, 50),
      expirationDate: getRandomDate(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), now),
      usageLimit: getRandomNumber(50, 200),
      usedCount: getRandomNumber(0, 50),
      minOrderValue: getRandomNumber(20, 100),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  const inserted = await Voucher.insertMany(vouchers);
  console.log(`✅ Created ${inserted.length} vouchers`);
  return inserted.map(v => v._id);
}

async function seedPromotions(categoryIds, productIds) {
  console.log('🌱 Seeding Promotions...');
  await Promotion.deleteMany({});
  
  const promotions = [];
  const now = new Date();
  
  for (let i = 0; i < 4; i++) {
    const discountType = getRandomElement(['percentage', 'fixed']);
    const discountValue = discountType === 'percentage' 
      ? getRandomNumber(10, 25) 
      : getRandomNumber(15, 75);
    
    promotions.push({
      code: `PROMO-CAT-${i + 1}`,
      eligibleCategories: getRandomElements(categoryIds, getRandomNumber(1, 3)),
      eligibleItems: [],
      discountType,
      discountValue,
      expirationDate: getRandomDate(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
      usageLimit: getRandomNumber(100, 1000),
      usedCount: getRandomNumber(0, 100),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  for (let i = 0; i < 4; i++) {
    const discountType = getRandomElement(['percentage', 'fixed']);
    const discountValue = discountType === 'percentage' 
      ? getRandomNumber(10, 25) 
      : getRandomNumber(15, 75);
    
    promotions.push({
      code: `PROMO-PROD-${i + 1}`,
      eligibleCategories: [],
      eligibleItems: getRandomElements(productIds, getRandomNumber(2, 5)),
      discountType,
      discountValue,
      expirationDate: getRandomDate(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
      usageLimit: getRandomNumber(100, 1000),
      usedCount: getRandomNumber(0, 100),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  for (let i = 0; i < 2; i++) {
    const discountType = getRandomElement(['percentage', 'fixed']);
    const discountValue = discountType === 'percentage' 
      ? getRandomNumber(15, 30) 
      : getRandomNumber(20, 100);
    
    promotions.push({
      code: `PROMO-BOTH-${i + 1}`,
      eligibleCategories: getRandomElements(categoryIds, getRandomNumber(1, 2)),
      eligibleItems: getRandomElements(productIds, getRandomNumber(1, 3)),
      discountType,
      discountValue,
      expirationDate: getRandomDate(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
      usageLimit: getRandomNumber(100, 1000),
      usedCount: getRandomNumber(0, 100),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  for (let i = 0; i < 2; i++) {
    promotions.push({
      code: `INACTIVE-PROMO-${i + 1}`,
      eligibleCategories: getRandomElements(categoryIds, 1),
      eligibleItems: [],
      discountType: getRandomElement(['percentage', 'fixed']),
      discountValue: getRandomNumber(10, 50),
      expirationDate: getRandomDate(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
      usageLimit: getRandomNumber(100, 500),
      usedCount: 0,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  const inserted = await Promotion.insertMany(promotions);
  console.log(`✅ Created ${inserted.length} promotions`);
  return inserted.map(p => p._id);
}

async function seedOrders(productIds, voucherIds, promotionIds) {
  console.log('🌱 Seeding Orders...');
  await Order.deleteMany({});
  
  const orders = [];
  const userIds = Array.from({ length: 10 }, (_, i) => new Types.ObjectId());
  
  for (let i = 0; i < 5; i++) {
    const userId = getRandomElement(userIds);
    const itemCount = getRandomNumber(1, 4);
    const items = getRandomElements(productIds, itemCount).map(prodId => ({
      productId: prodId,
      category: getRandomElement(categories),
      price: getRandomDecimal(20, 200, 2),
      quantity: getRandomNumber(1, 5)
    }));
    
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const voucher = await Voucher.findById(getRandomElement(voucherIds));
    
    let discountApplied = 0;
    let appliedVoucher = null;
    
    if (voucher && voucher.isActive && new Date() < voucher.expirationDate) {
      if (totalAmount >= voucher.minOrderValue) {
        if (voucher.discountType === 'percentage') {
          discountApplied = Math.min((totalAmount * voucher.discountValue) / 100, (totalAmount * 50) / 100);
        } else {
          discountApplied = Math.min(voucher.discountValue, totalAmount);
        }
        
        appliedVoucher = {
          voucherId: voucher._id,
          code: voucher.code,
          discountAmount: discountApplied
        };
      }
    }
    
    const finalAmount = totalAmount - discountApplied;
    
    orders.push({
      userId,
      items,
      totalAmount,
      discountApplied,
      finalAmount,
      appliedVoucher,
      appliedPromotions: [],
      createdAt: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
      updatedAt: new Date()
    });
  }
  
  for (let i = 0; i < 5; i++) {
    const userId = getRandomElement(userIds);
    const itemCount = getRandomNumber(1, 4);
    const items = getRandomElements(productIds, itemCount).map(prodId => ({
      productId: prodId,
      category: getRandomElement(categories),
      price: getRandomDecimal(20, 200, 2),
      quantity: getRandomNumber(1, 5)
    }));
    
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const promotion = await Promotion.findById(getRandomElement(promotionIds));
    
    let discountApplied = 0;
    const appliedPromotions = [];
    
    if (promotion && promotion.isActive && new Date() < promotion.expirationDate) {
      const eligibleAmount = totalAmount; // Simplified for seeding
      if (promotion.discountType === 'percentage') {
        discountApplied = Math.min((eligibleAmount * promotion.discountValue) / 100, (eligibleAmount * 50) / 100);
      } else {
        discountApplied = Math.min(promotion.discountValue, eligibleAmount);
      }
      
      appliedPromotions.push({
        promotionId: promotion._id,
        code: promotion.code,
        discountAmount: discountApplied
      });
    }
    
    const finalAmount = totalAmount - discountApplied;
    
    orders.push({
      userId,
      items,
      totalAmount,
      discountApplied,
      finalAmount,
      appliedPromotions,
      createdAt: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
      updatedAt: new Date()
    });
  }
  
  for (let i = 0; i < 5; i++) {
    const userId = getRandomElement(userIds);
    const itemCount = getRandomNumber(1, 4);
    const items = getRandomElements(productIds, itemCount).map(prodId => ({
      productId: prodId,
      category: getRandomElement(categories),
      price: getRandomDecimal(20, 200, 2),
      quantity: getRandomNumber(1, 5)
    }));
    
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    orders.push({
      userId,
      items,
      totalAmount,
      discountApplied: 0,
      finalAmount: totalAmount,
      appliedPromotions: [],
      createdAt: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
      updatedAt: new Date()
    });
  }

  await Order.insertMany(orders);
  console.log(`✅ Created ${orders.length} orders`);
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...\n');
    
    await connectDatabase();
    
    const categoryIds = await seedCategories();
    const productIds = await seedProducts(categoryIds);
    const voucherIds = await seedVouchers();
    const promotionIds = await seedPromotions(categoryIds, productIds);
    await seedOrders(productIds, voucherIds, promotionIds);
    
    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categoryIds.length}`);
    console.log(`   - Products: ${productIds.length}`);
    console.log(`   - Vouchers: ${voucherIds.length}`);
    console.log(`   - Promotions: ${promotionIds.length}`);
    console.log(`   - Orders: 15`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };


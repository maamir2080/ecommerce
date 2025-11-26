const { OrderService } = require('../src/services/order.service');
const { VoucherService } = require('../src/services/voucher.service');
const { PromotionService } = require('../src/services/promotion.service');
const { Order } = require('../src/models/Order');
const { Voucher } = require('../src/models/Voucher');
const { Promotion } = require('../src/models/Promotion');
const { Product } = require('../src/models/Product');
const { Category } = require('../src/models/Category');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const { Types } = require('mongoose');

describe('OrderService', () => {
  let testCategory;
  let testProduct;
  let testVoucher;
  let testPromotion;

  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    await Voucher.deleteMany({});
    await Promotion.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    testCategory = await Category.create({
      name: 'Test Category',
      description: 'Test Description'
    });

    testProduct = await Product.create({
      name: 'Test Product',
      categoryId: testCategory._id,
      price: 100,
      stock: 10
    });

    testVoucher = await VoucherService.createVoucher({
      discountType: 'percentage',
      discountValue: 10,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 100,
      minOrderValue: 0
    });

    testPromotion = await PromotionService.createPromotion({
      discountType: 'fixed',
      discountValue: 20,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 100,
      eligibleItems: [testProduct._id.toString()]
    });
  });

  describe('applyDiscounts', () => {
    it('should create order with voucher discount', async () => {
      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 2
          }
        ],
        voucherCode: testVoucher.code
      };

      const order = await OrderService.applyDiscounts(orderData);

      expect(order).toBeDefined();
      expect(order.totalAmount).toBe(200);
      expect(order.discountApplied).toBe(20); // 10% of 200
      expect(order.finalAmount).toBe(180);
      expect(order.appliedVoucher).toBeDefined();
      expect(order.appliedVoucher.code).toBe(testVoucher.code);
    });

    it('should create order with promotion discount', async () => {
      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 1
          }
        ],
        promotionCodes: [testPromotion.code]
      };

      const order = await OrderService.applyDiscounts(orderData);

      expect(order).toBeDefined();
      expect(order.totalAmount).toBe(100);
      expect(order.discountApplied).toBe(20); // Fixed 20
      expect(order.finalAmount).toBe(80);
      expect(order.appliedPromotions).toHaveLength(1);
    });

    it('should create order with both voucher and promotion', async () => {
      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 2
          }
        ],
        voucherCode: testVoucher.code,
        promotionCodes: [testPromotion.code]
      };

      const order = await OrderService.applyDiscounts(orderData);

      expect(order).toBeDefined();
      expect(order.totalAmount).toBe(200);
      expect(order.discountApplied).toBeGreaterThan(0);
      expect(order.appliedVoucher).toBeDefined();
      expect(order.appliedPromotions).toHaveLength(1);
    });

    it('should enforce maximum discount percentage (50%)', async () => {
      const highDiscountVoucher = await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 60, // More than 50%
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 1
          }
        ],
        voucherCode: highDiscountVoucher.code
      };

      const order = await OrderService.applyDiscounts(orderData);

      expect(order.discountApplied).toBe(50); // Capped at 50%
      expect(order.finalAmount).toBe(50);
    });

    it('should enforce maximum discount when combining multiple discounts', async () => {
      const voucher1 = await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 30,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      const promotion1 = await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 30,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        eligibleItems: [testProduct._id.toString()]
      });

      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 1
          }
        ],
        voucherCode: voucher1.code,
        promotionCodes: [promotion1.code]
      };

      const order = await OrderService.applyDiscounts(orderData);

      // Total would be 60% but should be capped at 50%
      expect(order.discountApplied).toBeLessThanOrEqual(50);
      expect(order.finalAmount).toBeGreaterThanOrEqual(50);
    });

    it('should reject duplicate promotion codes', async () => {
      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 1
          }
        ],
        promotionCodes: [testPromotion.code, testPromotion.code]
      };

      await expect(OrderService.applyDiscounts(orderData)).rejects.toThrow('Duplicate promotion codes');
    });

    it('should reject order with no items', async () => {
      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: []
      };

      await expect(OrderService.applyDiscounts(orderData)).rejects.toThrow('Order must contain at least one item');
    });

    it('should reject order with invalid voucher code', async () => {
      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 1
          }
        ],
        voucherCode: 'INVALID-CODE'
      };

      await expect(OrderService.applyDiscounts(orderData)).rejects.toThrow('Voucher not found');
    });

    it('should reject order with invalid promotion code', async () => {
      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 1
          }
        ],
        promotionCodes: ['INVALID-CODE']
      };

      await expect(OrderService.applyDiscounts(orderData)).rejects.toThrow('Promotion not found');
    });

    it('should reject order when voucher and promotion code are the same', async () => {
      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 1
          }
        ],
        voucherCode: testVoucher.code,
        promotionCodes: [testVoucher.code]
      };

      await expect(OrderService.applyDiscounts(orderData)).rejects.toThrow('The same code cannot be used as both a voucher and a promotion');
    });

    it('should reject order below voucher minimum order value', async () => {
      const minOrderVoucher = await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        minOrderValue: 200
      });

      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 1
          }
        ],
        voucherCode: minOrderVoucher.code
      };

      await expect(OrderService.applyDiscounts(orderData)).rejects.toThrow('Minimum order value');
    });

    it('should apply promotion only to eligible items', async () => {
      const categoryOnlyPromotion = await PromotionService.createPromotion({
        discountType: 'fixed',
        discountValue: 20,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        eligibleCategories: [testCategory._id.toString()],
        eligibleItems: []
      });

      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 1
          }
        ],
        promotionCodes: [categoryOnlyPromotion.code]
      };

      const order = await OrderService.applyDiscounts(orderData);

      expect(order.discountApplied).toBe(20);
      expect(order.appliedPromotions).toHaveLength(1);
    });

    it('should reject promotion for non-eligible items', async () => {
      const otherCategory = await Category.create({
        name: 'Other Category',
        description: 'Other Description'
      });

      const specificPromotion = await PromotionService.createPromotion({
        discountType: 'fixed',
        discountValue: 20,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        eligibleCategories: [otherCategory._id.toString()],
        eligibleItems: []
      });

      const orderData = {
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(), // Different category
            price: 100,
            quantity: 1
          }
        ],
        promotionCodes: [specificPromotion.code]
      };

      await expect(OrderService.applyDiscounts(orderData)).rejects.toThrow('No eligible items in order for this promotion');
    });
  });

  describe('getUserOrders', () => {
    it('should retrieve orders for a specific user', async () => {
      const userId = new Types.ObjectId().toString();

      await OrderService.applyDiscounts({
        userId,
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 1
          }
        ]
      });

      const orders = await OrderService.getUserOrders(userId);

      expect(orders).toBeDefined();
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThan(0);
    });
  });

  describe('getOrderById', () => {
    it('should retrieve an order by ID', async () => {
      const order = await OrderService.applyDiscounts({
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 1
          }
        ]
      });

      const retrieved = await OrderService.getOrderById(order._id.toString());

      expect(retrieved).toBeDefined();
      expect(retrieved._id.toString()).toBe(order._id.toString());
    });

    it('should throw error for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(OrderService.getOrderById(fakeId)).rejects.toThrow('Order not found');
    });
  });

  describe('getAllOrders', () => {
    it('should retrieve all orders', async () => {
      await OrderService.applyDiscounts({
        userId: new Types.ObjectId().toString(),
        items: [
          {
            productId: testProduct._id.toString(),
            category: testCategory._id.toString(),
            price: 100,
            quantity: 1
          }
        ]
      });

      const orders = await OrderService.getAllOrders();

      expect(orders).toBeDefined();
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThan(0);
    });
  });
});


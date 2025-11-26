const { PromotionService } = require('../src/services/promotion.service');
const { PromotionRepository } = require('../src/repositories/promotion.repository');
const { Promotion } = require('../src/models/Promotion');
const { Product } = require('../src/models/Product');
const { Category } = require('../src/models/Category');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const { Types } = require('mongoose');

describe('PromotionService', () => {
  let testCategory;
  let testProduct;

  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  beforeEach(async () => {
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
  });

  describe('createPromotion', () => {
    it('should create a promotion with auto-generated code', async () => {
      const promotionData = {
        discountType: 'percentage',
        discountValue: 15,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      };

      const promotion = await PromotionService.createPromotion(promotionData);

      expect(promotion).toBeDefined();
      expect(promotion.code).toBeDefined();
      expect(promotion.code).toMatch(/^PRM-/);
      expect(promotion.discountType).toBe('percentage');
      expect(promotion.discountValue).toBe(15);
      expect(promotion.usedCount).toBe(0);
      expect(promotion.isActive).toBe(true);
    });

    it('should create a promotion with custom code', async () => {
      const promotionData = {
        code: 'CUSTOM-PROMO',
        discountType: 'fixed',
        discountValue: 25,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 50
      };

      const promotion = await PromotionService.createPromotion(promotionData);

      expect(promotion.code).toBe('CUSTOM-PROMO');
    });

    it('should create a promotion with eligible categories', async () => {
      const promotionData = {
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        eligibleCategories: [testCategory._id.toString()]
      };

      const promotion = await PromotionService.createPromotion(promotionData);

      expect(promotion.eligibleCategories).toBeDefined();
      expect(promotion.eligibleCategories.length).toBe(1);
    });

    it('should create a promotion with eligible items', async () => {
      const promotionData = {
        discountType: 'fixed',
        discountValue: 20,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        eligibleItems: [testProduct._id.toString()]
      };

      const promotion = await PromotionService.createPromotion(promotionData);

      expect(promotion.eligibleItems).toBeDefined();
      expect(promotion.eligibleItems.length).toBe(1);
    });

    it('should throw error for duplicate code', async () => {
      const promotionData = {
        code: 'DUPLICATE-PROMO',
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      };

      await PromotionService.createPromotion(promotionData);

      await expect(PromotionService.createPromotion(promotionData)).rejects.toThrow('Promotion code already exists');
    });

    it('should throw error for percentage discount exceeding 100', async () => {
      const promotionData = {
        discountType: 'percentage',
        discountValue: 150,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      };

      await expect(PromotionService.createPromotion(promotionData)).rejects.toThrow('Percentage discount cannot exceed 100');
    });
  });

  describe('getPromotions', () => {
    it('should retrieve all promotions', async () => {
      await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      const promotions = await PromotionService.getPromotions();

      expect(promotions).toBeDefined();
      expect(Array.isArray(promotions)).toBe(true);
      expect(promotions.length).toBeGreaterThan(0);
    });

    it('should filter promotions by active status', async () => {
      await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isActive: true
      });

      await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isActive: false
      });

      const activePromotions = await PromotionService.getPromotions({ isActive: true });
      const inactivePromotions = await PromotionService.getPromotions({ isActive: false });

      expect(activePromotions.every(p => p.isActive === true)).toBe(true);
      expect(inactivePromotions.every(p => p.isActive === false)).toBe(true);
    });
  });

  describe('getPromotionById', () => {
    it('should retrieve a promotion by ID', async () => {
      const createdPromotion = await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      const promotion = await PromotionService.getPromotionById(createdPromotion._id.toString());

      expect(promotion).toBeDefined();
      expect(promotion._id.toString()).toBe(createdPromotion._id.toString());
    });

    it('should throw error for non-existent promotion', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(PromotionService.getPromotionById(fakeId)).rejects.toThrow('Promotion not found');
    });
  });

  describe('updatePromotion', () => {
    it('should update a promotion', async () => {
      const promotion = await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      const updated = await PromotionService.updatePromotion(promotion._id.toString(), {
        discountValue: 20
      });

      expect(updated.discountValue).toBe(20);
    });

    it('should throw error when updating non-existent promotion', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(PromotionService.updatePromotion(fakeId, { discountValue: 20 })).rejects.toThrow('Promotion not found');
    });
  });

  describe('deletePromotion', () => {
    it('should delete a promotion', async () => {
      const promotion = await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      await PromotionService.deletePromotion(promotion._id.toString());

      await expect(PromotionService.getPromotionById(promotion._id.toString())).rejects.toThrow('Promotion not found');
    });

    it('should throw error when deleting non-existent promotion', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(PromotionService.deletePromotion(fakeId)).rejects.toThrow('Promotion not found');
    });
  });

  describe('validatePromotion', () => {
    it('should validate a valid promotion with no eligibility restrictions', async () => {
      const promotion = await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      const validation = await PromotionService.validatePromotion(promotion.code, [
        {
          productId: testProduct._id.toString(),
          category: testCategory._id.toString()
        }
      ]);

      expect(validation.valid).toBe(true);
      expect(validation.promotion).toBeDefined();
    });

    it('should validate a promotion with eligible items', async () => {
      const promotion = await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        eligibleItems: [testProduct._id.toString()]
      });

      const validation = await PromotionService.validatePromotion(promotion.code, [
        {
          productId: testProduct._id.toString(),
          category: testCategory._id.toString()
        }
      ]);

      expect(validation.valid).toBe(true);
    });

    it('should validate a promotion with eligible categories', async () => {
      const promotion = await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        eligibleCategories: [testCategory._id.toString()]
      });

      const validation = await PromotionService.validatePromotion(promotion.code, [
        {
          productId: testProduct._id.toString(),
          category: testCategory._id.toString()
        }
      ]);

      expect(validation.valid).toBe(true);
    });

    it('should reject expired promotion', async () => {
      const promotion = await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() - 1000), // Expired
        usageLimit: 100
      });

      const validation = await PromotionService.validatePromotion(promotion.code, [
        {
          productId: testProduct._id.toString(),
          category: testCategory._id.toString()
        }
      ]);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('expired');
    });

    it('should reject inactive promotion', async () => {
      const promotion = await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isActive: false
      });

      const validation = await PromotionService.validatePromotion(promotion.code, [
        {
          productId: testProduct._id.toString(),
          category: testCategory._id.toString()
        }
      ]);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('not active');
    });

    it('should reject promotion with exceeded usage limit', async () => {
      const promotion = await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 5,
        usedCount: 5
      });

      const validation = await PromotionService.validatePromotion(promotion.code, [
        {
          productId: testProduct._id.toString(),
          category: testCategory._id.toString()
        }
      ]);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('usage limit exceeded');
    });

    it('should reject promotion for non-eligible items', async () => {
      const otherProduct = await Product.create({
        name: 'Other Product',
        categoryId: testCategory._id,
        price: 50,
        stock: 5
      });

      const promotion = await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        eligibleItems: [testProduct._id.toString()] // Only testProduct is eligible
      });

      const validation = await PromotionService.validatePromotion(promotion.code, [
        {
          productId: otherProduct._id.toString(), // Different product
          category: testCategory._id.toString()
        }
      ]);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('No eligible items');
    });
  });

  describe('incrementUsage', () => {
    it('should increment promotion usage count', async () => {
      const promotion = await PromotionService.createPromotion({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      const initialCount = promotion.usedCount;
      await PromotionService.incrementUsage(promotion._id.toString());

      const updated = await PromotionService.getPromotionById(promotion._id.toString());
      expect(updated.usedCount).toBe(initialCount + 1);
    });
  });
});


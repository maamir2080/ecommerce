const { VoucherService } = require('../src/services/voucher.service');
const { VoucherRepository } = require('../src/repositories/voucher.repository');
const { Voucher } = require('../src/models/Voucher');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');

describe('VoucherService', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await Voucher.deleteMany({});
  });

  describe('createVoucher', () => {
    it('should create a voucher with auto-generated code', async () => {
      const voucherData = {
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        usageLimit: 100,
        minOrderValue: 50
      };

      const voucher = await VoucherService.createVoucher(voucherData);

      expect(voucher).toBeDefined();
      expect(voucher.code).toBeDefined();
      expect(voucher.code).toMatch(/^VCH-/);
      expect(voucher.discountType).toBe('percentage');
      expect(voucher.discountValue).toBe(10);
      expect(voucher.usedCount).toBe(0);
      expect(voucher.isActive).toBe(true);
    });

    it('should create a voucher with custom code', async () => {
      const voucherData = {
        code: 'CUSTOM-CODE',
        discountType: 'fixed',
        discountValue: 20,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 50
      };

      const voucher = await VoucherService.createVoucher(voucherData);

      expect(voucher.code).toBe('CUSTOM-CODE');
    });

    it('should throw error for duplicate code', async () => {
      const voucherData = {
        code: 'DUPLICATE',
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      };

      await VoucherService.createVoucher(voucherData);

      await expect(VoucherService.createVoucher(voucherData)).rejects.toThrow('Voucher code already exists');
    });

    it('should throw error for percentage discount exceeding 100', async () => {
      const voucherData = {
        discountType: 'percentage',
        discountValue: 150,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      };

      await expect(VoucherService.createVoucher(voucherData)).rejects.toThrow('Percentage discount cannot exceed 100');
    });
  });

  describe('getVouchers', () => {
    it('should retrieve all vouchers', async () => {
      await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      const vouchers = await VoucherService.getVouchers();

      expect(vouchers).toBeDefined();
      expect(Array.isArray(vouchers)).toBe(true);
      expect(vouchers.length).toBeGreaterThan(0);
    });

    it('should filter vouchers by active status', async () => {
      await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isActive: true
      });

      await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isActive: false
      });

      const activeVouchers = await VoucherService.getVouchers({ isActive: true });
      const inactiveVouchers = await VoucherService.getVouchers({ isActive: false });

      expect(activeVouchers.every(v => v.isActive === true)).toBe(true);
      expect(inactiveVouchers.every(v => v.isActive === false)).toBe(true);
    });
  });

  describe('getVoucherById', () => {
    it('should retrieve a voucher by ID', async () => {
      const createdVoucher = await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      const voucher = await VoucherService.getVoucherById(createdVoucher._id.toString());

      expect(voucher).toBeDefined();
      expect(voucher._id.toString()).toBe(createdVoucher._id.toString());
    });

    it('should throw error for non-existent voucher', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(VoucherService.getVoucherById(fakeId)).rejects.toThrow('Voucher not found');
    });
  });

  describe('updateVoucher', () => {
    it('should update a voucher', async () => {
      const voucher = await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      const updated = await VoucherService.updateVoucher(voucher._id.toString(), {
        discountValue: 20
      });

      expect(updated.discountValue).toBe(20);
    });

    it('should throw error when updating non-existent voucher', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(VoucherService.updateVoucher(fakeId, { discountValue: 20 })).rejects.toThrow('Voucher not found');
    });
  });

  describe('deleteVoucher', () => {
    it('should delete a voucher', async () => {
      const voucher = await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      await VoucherService.deleteVoucher(voucher._id.toString());

      await expect(VoucherService.getVoucherById(voucher._id.toString())).rejects.toThrow('Voucher not found');
    });

    it('should throw error when deleting non-existent voucher', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(VoucherService.deleteVoucher(fakeId)).rejects.toThrow('Voucher not found');
    });
  });

  describe('validateVoucher', () => {
    it('should validate a valid voucher', async () => {
      const voucher = await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        minOrderValue: 50
      });

      const validation = await VoucherService.validateVoucher(voucher.code, 100);

      expect(validation.valid).toBe(true);
      expect(validation.voucher).toBeDefined();
    });

    it('should reject expired voucher', async () => {
      const voucher = await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() - 1000), // Expired
        usageLimit: 100
      });

      const validation = await VoucherService.validateVoucher(voucher.code, 100);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('expired');
    });

    it('should reject voucher below minimum order value', async () => {
      const voucher = await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        minOrderValue: 100
      });

      const validation = await VoucherService.validateVoucher(voucher.code, 50);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Minimum order value');
    });

    it('should reject inactive voucher', async () => {
      const voucher = await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isActive: false
      });

      const validation = await VoucherService.validateVoucher(voucher.code, 100);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('not active');
    });

    it('should reject voucher with exceeded usage limit', async () => {
      const voucher = await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 5,
        usedCount: 5
      });

      const validation = await VoucherService.validateVoucher(voucher.code, 100);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('usage limit exceeded');
    });
  });

  describe('incrementUsage', () => {
    it('should increment voucher usage count', async () => {
      const voucher = await VoucherService.createVoucher({
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100
      });

      const initialCount = voucher.usedCount;
      await VoucherService.incrementUsage(voucher._id.toString());

      const updated = await VoucherService.getVoucherById(voucher._id.toString());
      expect(updated.usedCount).toBe(initialCount + 1);
    });
  });
});


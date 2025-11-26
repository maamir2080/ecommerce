const { VoucherRepository } = require('../repositories/voucher.repository');
const { AppError } = require('../middleware/errorHandler');

class VoucherService {
  static repository = new VoucherRepository();

  static generateVoucherCode() {
    const prefix = 'VCH';
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}-${random}`;
  }

  static async createVoucher(data) {
    try {
      if (data.discountType === 'percentage' && data.discountValue > 100) {
        throw new AppError('Percentage discount cannot exceed 100', 400);
      }

      const code = data.code?.trim() || this.generateVoucherCode();
      
      if (!code || code.length < 3) {
        throw new AppError('Voucher code must be at least 3 characters', 400);
      }
      
      const codeExists = await this.repository.codeExists(code);
      if (codeExists) {
        throw new AppError('Voucher code already exists', 400);
      }

      const normalizedData = {
        ...data,
        discountType: data.discountType?.toLowerCase(),
        code,
        usedCount: 0,
        isActive: data.isActive !== undefined ? data.isActive : true
      };

      return await this.repository.create(normalizedData);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to create voucher: ${error.message}`, 500);
    }
  }

  static async getVouchers(filters) {
    try {
      if (filters?.isActive !== undefined) {
        return await this.repository.findByActiveStatus(filters.isActive);
      }
      return await this.repository.findMany();
    } catch (error) {
      throw new AppError(`Failed to retrieve vouchers: ${error.message}`, 500);
    }
  }

  static async getVoucherById(id) {
    try {
      const voucher = await this.repository.findById(id);
      if (!voucher) {
        throw new AppError('Voucher not found', 404);
      }
      return voucher;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to retrieve voucher: ${error.message}`, 500);
    }
  }

  static async getVoucherByCode(code) {
    try {
      return await this.repository.findByCode(code);
    } catch (error) {
      throw new AppError(`Failed to retrieve voucher by code: ${error.message}`, 500);
    }
  }

  static async updateVoucher(id, data) {
    try {
      const existingVoucher = await this.repository.findById(id);
      if (!existingVoucher) {
        throw new AppError('Voucher not found', 404);
      }

      if (data.discountType === 'percentage' && data.discountValue !== undefined && data.discountValue > 100) {
        throw new AppError('Percentage discount cannot exceed 100', 400);
      }

      if (data.code) {
        const trimmedCode = data.code.trim();
        if (trimmedCode.length < 3) {
          throw new AppError('Voucher code must be at least 3 characters', 400);
        }
        const codeExists = await this.repository.codeExists(trimmedCode, id);
        if (codeExists) {
          throw new AppError('Voucher code already exists', 400);
        }
      }

      const updateData = { ...data };
      if (updateData.discountType) {
        updateData.discountType = updateData.discountType.toLowerCase();
      }
      if (updateData.code) {
        updateData.code = updateData.code.trim();
      }

      return await this.repository.update(id, updateData);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to update voucher: ${error.message}`, 500);
    }
  }

  static async deleteVoucher(id) {
    try {
      const voucher = await this.repository.findById(id);
      if (!voucher) {
        throw new AppError('Voucher not found', 404);
      }
      return await this.repository.delete(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to delete voucher: ${error.message}`, 500);
    }
  }

  static async validateVoucher(code, orderTotal) {
    try {
      const voucher = await this.getVoucherByCode(code);
      
      if (!voucher) {
        return { valid: false, error: 'Voucher not found' };
      }

      if (!voucher.isActive) {
        return { valid: false, error: 'Voucher is not active' };
      }

      if (new Date() > voucher.expirationDate) {
        return { valid: false, error: 'Voucher has expired' };
      }

      if (voucher.usedCount >= voucher.usageLimit) {
        return { valid: false, error: 'Voucher usage limit exceeded' };
      }

      if (orderTotal < voucher.minOrderValue) {
        return { valid: false, error: `Minimum order value of ${voucher.minOrderValue} required` };
      }

      return { valid: true, voucher };
    } catch (error) {
      throw new AppError(`Failed to validate voucher: ${error.message}`, 500);
    }
  }

  static async incrementUsage(id) {
    try {
      await this.repository.incrementUsage(id);
    } catch (error) {
      throw new AppError(`Failed to increment voucher usage: ${error.message}`, 500);
    }
  }
}

module.exports = { VoucherService };



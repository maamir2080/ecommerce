const { PromotionRepository } = require('../repositories/promotion.repository');
const { Types } = require('mongoose');
const { AppError } = require('../middleware/errorHandler');

class PromotionService {
  static repository = new PromotionRepository();

  static generatePromotionCode() {
    const prefix = 'PRM';
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}-${random}`;
  }

  static async createPromotion(data) {
    try {
      if (data.discountType === 'percentage' && data.discountValue > 100) {
        throw new AppError('Percentage discount cannot exceed 100', 400);
      }

      const code = data.code?.trim() || this.generatePromotionCode();
      
      if (!code || code.length < 3) {
        throw new AppError('Promotion code must be at least 3 characters', 400);
      }
      
      const codeExists = await this.repository.codeExists(code);
      if (codeExists) {
        throw new AppError('Promotion code already exists', 400);
      }

      const normalizedData = {
        ...data,
        discountType: data.discountType?.toLowerCase(),
        code,
        eligibleCategories: data.eligibleCategories?.map(id => new Types.ObjectId(id)) || [],
        eligibleItems: data.eligibleItems?.map(id => new Types.ObjectId(id)) || [],
        usedCount: 0,
        isActive: data.isActive !== undefined ? data.isActive : true
      };

      return await this.repository.create(normalizedData);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to create promotion: ${error.message}`, 500);
    }
  }

  static async getPromotions(filters) {
    try {
      if (filters?.isActive !== undefined) {
        return await this.repository.findByActiveStatus(filters.isActive);
      }
      return await this.repository.findMany();
    } catch (error) {
      throw new AppError(`Failed to retrieve promotions: ${error.message}`, 500);
    }
  }

  static async getPromotionById(id) {
    try {
      const promotion = await this.repository.findByIdWithPopulate(id);
      if (!promotion) {
        throw new AppError('Promotion not found', 404);
      }
      return promotion;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to retrieve promotion: ${error.message}`, 500);
    }
  }

  static async getPromotionByCode(code) {
    try {
      return await this.repository.findByCode(code);
    } catch (error) {
      throw new AppError(`Failed to retrieve promotion by code: ${error.message}`, 500);
    }
  }

  static async updatePromotion(id, data) {
    try {
      const existingPromotion = await this.repository.findById(id);
      if (!existingPromotion) {
        throw new AppError('Promotion not found', 404);
      }

      if (data.discountType === 'percentage' && data.discountValue !== undefined && data.discountValue > 100) {
        throw new AppError('Percentage discount cannot exceed 100', 400);
      }

      if (data.code) {
        const trimmedCode = data.code.trim();
        if (trimmedCode.length < 3) {
          throw new AppError('Promotion code must be at least 3 characters', 400);
        }
        const codeExists = await this.repository.codeExists(trimmedCode, id);
        if (codeExists) {
          throw new AppError('Promotion code already exists', 400);
        }
      }

      const updateData = { ...data };
      
      if (updateData.discountType) {
        updateData.discountType = updateData.discountType.toLowerCase();
      }
      if (updateData.code) {
        updateData.code = updateData.code.trim();
      }
      
      if (data.eligibleCategories) {
        updateData.eligibleCategories = data.eligibleCategories.map(id => new Types.ObjectId(id));
      }
      
      if (data.eligibleItems) {
        updateData.eligibleItems = data.eligibleItems.map(id => new Types.ObjectId(id));
      }

      await this.repository.update(id, updateData);
      return await this.repository.findByIdWithPopulate(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to update promotion: ${error.message}`, 500);
    }
  }

  static async deletePromotion(id) {
    try {
      const promotion = await this.repository.findById(id);
      if (!promotion) {
        throw new AppError('Promotion not found', 404);
      }
      return await this.repository.delete(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to delete promotion: ${error.message}`, 500);
    }
  }

  static async validatePromotion(code, orderItems) {
    try {
      const promotion = await this.getPromotionByCode(code);
      
      if (!promotion) {
        return { valid: false, error: 'Promotion not found' };
      }

      if (!promotion.isActive) {
        return { valid: false, error: 'Promotion is not active' };
      }

      if (new Date() > promotion.expirationDate) {
        return { valid: false, error: 'Promotion has expired' };
      }

      if (promotion.usedCount >= promotion.usageLimit) {
        return { valid: false, error: 'Promotion usage limit exceeded' };
      }

      const eligibleProductIds = promotion.eligibleItems.map((item) => 
        (item._id || item).toString()
      );
      const eligibleCategoryIds = promotion.eligibleCategories.map((cat) => 
        (cat._id || cat).toString()
      );
      
      if (eligibleProductIds.length === 0 && eligibleCategoryIds.length === 0) {
        return { valid: true, promotion };
      }
      
      const hasEligibleItem = orderItems.some(item => {
        const isEligibleProduct = eligibleProductIds.includes(item.productId);
        const isEligibleCategory = eligibleCategoryIds.includes(item.category);
        return isEligibleProduct || isEligibleCategory;
      });

      if (!hasEligibleItem) {
        return { valid: false, error: 'No eligible items in order for this promotion' };
      }

      return { valid: true, promotion };
    } catch (error) {
      throw new AppError(`Failed to validate promotion: ${error.message}`, 500);
    }
  }

  static async incrementUsage(id) {
    try {
      await this.repository.incrementUsage(id);
    } catch (error) {
      throw new AppError(`Failed to increment promotion usage: ${error.message}`, 500);
    }
  }
}

module.exports = { PromotionService };



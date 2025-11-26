const { VoucherService } = require('./voucher.service');
const { PromotionService } = require('./promotion.service');
const { OrderRepository } = require('../repositories/order.repository');
const { Types } = require('mongoose');
const { AppError } = require('../middleware/errorHandler');

const MAX_DISCOUNT_PERCENTAGE = 50;

class OrderService {
  static repository = new OrderRepository();

  static calculateDiscount(discountType, discountValue, orderTotal) {
    if (discountType === 'percentage') {
      return (orderTotal * discountValue) / 100;
    } else {
      return Math.min(discountValue, orderTotal);
    }
  }

  static async applyDiscounts(data) {
    try {
      const { userId, items, voucherCode, promotionCodes } = data;

      if (!items || items.length === 0) {
        throw new AppError('Order must contain at least one item', 400);
      }

      if (voucherCode && promotionCodes && promotionCodes.includes(voucherCode)) {
        throw new AppError('The same code cannot be used as both a voucher and a promotion', 400);
      }

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      if (totalAmount <= 0) {
        throw new AppError('Order total must be greater than zero', 400);
      }

      let discountApplied = 0;
      let appliedVoucher = null;
      const appliedPromotions = [];

      if (voucherCode) {
        const validation = await VoucherService.validateVoucher(voucherCode, totalAmount);
        
        if (!validation.valid || !validation.voucher) {
          throw new AppError(validation.error || 'Invalid voucher', 400);
        }

        const voucherDiscount = this.calculateDiscount(
          validation.voucher.discountType,
          validation.voucher.discountValue,
          totalAmount
        );

        discountApplied += voucherDiscount;

        appliedVoucher = {
          voucherId: validation.voucher._id,
          code: validation.voucher.code,
          discountAmount: voucherDiscount
        };

        await VoucherService.incrementUsage(validation.voucher._id.toString());
      }

      if (promotionCodes && promotionCodes.length > 0) {
        const uniqueCodes = [...new Set(promotionCodes)];
        if (uniqueCodes.length !== promotionCodes.length) {
          throw new AppError('Duplicate promotion codes are not allowed', 400);
        }

        const promotionValidations = await Promise.all(
          uniqueCodes.map(code => PromotionService.validatePromotion(code, items))
        );

        for (let i = 0; i < promotionValidations.length; i++) {
          const validation = promotionValidations[i];
          
          if (!validation.valid || !validation.promotion) {
            throw new AppError(validation.error || `Invalid promotion: ${uniqueCodes[i]}`, 400);
          }

          const eligibleProductIds = validation.promotion.eligibleItems.map((p) => 
            (p._id || p).toString()
          );
          const eligibleCategoryIds = validation.promotion.eligibleCategories.map((c) => 
            (c._id || c).toString()
          );
          
          const eligibleItemsTotal = (eligibleProductIds.length === 0 && eligibleCategoryIds.length === 0)
            ? totalAmount
            : items
                .filter(item => {
                  const isEligibleProduct = eligibleProductIds.includes(item.productId);
                  const isEligibleCategory = eligibleCategoryIds.includes(item.category);
                  return isEligibleProduct || isEligibleCategory;
                })
                .reduce((sum, item) => sum + (item.price * item.quantity), 0);

          const promotionDiscount = this.calculateDiscount(
            validation.promotion.discountType,
            validation.promotion.discountValue,
            eligibleItemsTotal
          );

          discountApplied += promotionDiscount;

          appliedPromotions.push({
            promotionId: validation.promotion._id,
            code: validation.promotion.code,
            discountAmount: promotionDiscount
          });

          await PromotionService.incrementUsage(validation.promotion._id.toString());
        }
      }

      const maxAllowedDiscount = (totalAmount * MAX_DISCOUNT_PERCENTAGE) / 100;
      const originalDiscountApplied = discountApplied;
      discountApplied = Math.min(discountApplied, maxAllowedDiscount, totalAmount);
      
      if (originalDiscountApplied > discountApplied && originalDiscountApplied > 0) {
        const adjustmentRatio = discountApplied / originalDiscountApplied;
        
        if (appliedVoucher) {
          appliedVoucher.discountAmount = Math.round((appliedVoucher.discountAmount * adjustmentRatio) * 100) / 100;
        }
        
        appliedPromotions.forEach(promo => {
          promo.discountAmount = Math.round((promo.discountAmount * adjustmentRatio) * 100) / 100;
        });
      }
      
      const finalAmount = totalAmount - discountApplied;

      const orderData = {
        userId: new Types.ObjectId(userId),
        items: items.map(item => ({
          productId: new Types.ObjectId(item.productId),
          category: item.category,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount,
        discountApplied,
        finalAmount,
        appliedVoucher: appliedVoucher || undefined,
        appliedPromotions
      };

      return await this.repository.create(orderData);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to apply discounts: ${error.message}`, 500);
    }
  }

  static async getUserOrders(userId) {
    try {
      return await this.repository.findByUserId(userId);
    } catch (error) {
      throw new AppError(`Failed to retrieve user orders: ${error.message}`, 500);
    }
  }

  static async getOrderById(id) {
    try {
      const order = await this.repository.findByIdWithPopulate(id);
      if (!order) {
        throw new AppError('Order not found', 404);
      }
      return order;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to retrieve order: ${error.message}`, 500);
    }
  }

  static async getAllOrders() {
    try {
      return await this.repository.findAllWithPopulate();
    } catch (error) {
      throw new AppError(`Failed to retrieve orders: ${error.message}`, 500);
    }
  }
}

module.exports = { OrderService };



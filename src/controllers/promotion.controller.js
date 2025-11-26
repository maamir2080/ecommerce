const { PromotionService } = require('../services/promotion.service');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

class PromotionController {
  static createPromotion = asyncHandler(async (req, res) => {
    try {
      const promotion = await PromotionService.createPromotion(req.body);
      
      const response = {
        success: true,
        message: 'Promotion created successfully',
        data: promotion
      };
      
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to create promotion: ${error.message}`, 500);
    }
  });

  static getPromotions = asyncHandler(async (req, res) => {
    try {
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      const promotions = await PromotionService.getPromotions({ isActive });
      
      const response = {
        success: true,
        message: 'Promotions retrieved successfully',
        data: promotions
      };
      
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to retrieve promotions: ${error.message}`, 500);
    }
  });

  static getPromotionById = asyncHandler(async (req, res) => {
    try {
      const promotion = await PromotionService.getPromotionById(req.params.id);
      
      const response = {
        success: true,
        message: 'Promotion retrieved successfully',
        data: promotion
      };
      
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to retrieve promotion: ${error.message}`, 500);
    }
  });

  static updatePromotion = asyncHandler(async (req, res) => {
    try {
      const promotion = await PromotionService.updatePromotion(req.params.id, req.body);
      
      const response = {
        success: true,
        message: 'Promotion updated successfully',
        data: promotion
      };
      
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to update promotion: ${error.message}`, 500);
    }
  });

  static deletePromotion = asyncHandler(async (req, res) => {
    try {
      await PromotionService.deletePromotion(req.params.id);
      
      const response = {
        success: true,
        message: 'Promotion deleted successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to delete promotion: ${error.message}`, 500);
    }
  });
}

module.exports = { PromotionController };



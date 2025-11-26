const { PromotionService } = require('../services/promotion.service');
const { asyncHandler } = require('../middleware/errorHandler');

class PromotionController {
  static createPromotion = asyncHandler(async (req, res) => {
    const promotion = await PromotionService.createPromotion(req.body);
    
    const response = {
      success: true,
      message: 'Promotion created successfully',
      data: promotion
    };
    
    res.status(201).json(response);
  });

  static getPromotions = asyncHandler(async (req, res) => {
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const promotions = await PromotionService.getPromotions({ isActive });
    
    const response = {
      success: true,
      message: 'Promotions retrieved successfully',
      data: promotions
    };
    
    res.status(200).json(response);
  });

  static getPromotionById = asyncHandler(async (req, res) => {
    const promotion = await PromotionService.getPromotionById(req.params.id);
    
    const response = {
      success: true,
      message: 'Promotion retrieved successfully',
      data: promotion
    };
    
    res.status(200).json(response);
  });

  static updatePromotion = asyncHandler(async (req, res) => {
    const promotion = await PromotionService.updatePromotion(req.params.id, req.body);
    
    const response = {
      success: true,
      message: 'Promotion updated successfully',
      data: promotion
    };
    
    res.status(200).json(response);
  });

  static deletePromotion = asyncHandler(async (req, res) => {
    await PromotionService.deletePromotion(req.params.id);
    
    const response = {
      success: true,
      message: 'Promotion deleted successfully'
    };
    
    res.status(200).json(response);
  });
}

module.exports = { PromotionController };



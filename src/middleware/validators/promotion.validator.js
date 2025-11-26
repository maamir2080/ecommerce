const { body, param } = require('express-validator');
const { validate } = require('./validate.middleware');
const {
  validateDiscountType,
  validateDiscountValue,
  validateCode,
  validateExpirationDate,
  validateAtLeastOneField
} = require('./shared.validators');

const validateCreatePromotion = [
  validateDiscountType('discountType', false),
  validateDiscountValue('discountValue', false),
  validateExpirationDate(false),
  body('usageLimit')
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('eligibleCategories')
    .optional()
    .isArray()
    .withMessage('Eligible categories must be an array'),
  body('eligibleCategories.*')
    .optional()
    .isMongoId()
    .withMessage('Each eligible category must be a valid MongoDB ID'),
  body('eligibleItems')
    .optional()
    .isArray()
    .withMessage('Eligible items must be an array'),
  body('eligibleItems.*')
    .optional()
    .isMongoId()
    .withMessage('Each eligible item must be a valid MongoDB ID'),
  validateCode('code', true),
  validate
];

const validateUpdatePromotion = [
  param('id').isMongoId().withMessage('Invalid promotion ID'),
  validateAtLeastOneField(),
  validateDiscountType('discountType', true),
  validateDiscountValue('discountValue', true),
  validateExpirationDate(true),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('eligibleCategories')
    .optional()
    .isArray()
    .withMessage('Eligible categories must be an array'),
  body('eligibleItems')
    .optional()
    .isArray()
    .withMessage('Eligible items must be an array'),
  validateCode('code', true),
  validate
];

const validatePromotionId = [
  param('id').isMongoId().withMessage('Invalid promotion ID'),
  validate
];

module.exports = {
  validateCreatePromotion,
  validateUpdatePromotion,
  validatePromotionId
};


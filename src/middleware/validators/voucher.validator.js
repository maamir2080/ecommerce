const { body, param } = require('express-validator');
const { validate } = require('./validate.middleware');
const {
  validateDiscountType,
  validateDiscountValue,
  validateCode,
  validateExpirationDate,
  validateAtLeastOneField
} = require('./shared.validators');

const validateCreateVoucher = [
  validateDiscountType('discountType', false),
  validateDiscountValue('discountValue', false),
  validateExpirationDate(false),
  body('usageLimit')
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('minOrderValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order value must be a positive number'),
  validateCode('code', true),
  validate
];

const validateUpdateVoucher = [
  param('id').isMongoId().withMessage('Invalid voucher ID'),
  validateAtLeastOneField(),
  validateDiscountType('discountType', true),
  validateDiscountValue('discountValue', true),
  validateExpirationDate(true),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('minOrderValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order value must be a positive number'),
  validateCode('code', true),
  validate
];

const validateVoucherId = [
  param('id').isMongoId().withMessage('Invalid voucher ID'),
  validate
];

module.exports = {
  validateCreateVoucher,
  validateUpdateVoucher,
  validateVoucherId
};


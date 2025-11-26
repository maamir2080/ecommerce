const { body, param } = require('express-validator');
const { validate } = require('./validate.middleware');

const validateUserId = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  validate
];

const validateOrderId = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  validate
];

const validateApplyDiscount = [
  body('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ID'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Each product ID must be a valid MongoDB ID'),
  body('items.*.category')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category is required for each item'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer for each item'),
  body('voucherCode')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Voucher code must be a non-empty string'),
  body('promotionCodes')
    .optional()
    .isArray()
    .withMessage('Promotion codes must be an array'),
  body('promotionCodes.*')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each promotion code must be a non-empty string'),
  validate
];

module.exports = {
  validateUserId,
  validateOrderId,
  validateApplyDiscount
};


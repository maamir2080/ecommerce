const { body } = require('express-validator');

const validateDiscountType = (field = 'discountType', isOptional = false) => {
  const validator = body(field).custom((value) => {
    if (typeof value !== 'string') {
      throw new Error('Discount type must be a string');
    }
    const trimmed = value.trim().toLowerCase();
    if (!['percentage', 'fixed'].includes(trimmed)) {
      throw new Error('Discount type must be either "percentage" or "fixed"');
    }
    return true;
  });

  return isOptional ? validator.optional() : validator;
};

const validateDiscountValue = (field = 'discountValue', isOptional = false) => {
  const validator = body(field)
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number')
    .custom((value, { req }) => {
      if (value !== undefined && value !== null) {
        const discountType = req.body.discountType?.toLowerCase();
        if (discountType === 'percentage' && value > 100) {
          throw new Error('Percentage discount cannot exceed 100');
        }
      }
      return true;
    });

  return isOptional ? validator.optional() : validator;
};

const validateCode = (field = 'code', isOptional = true) => {
  const validator = body(field).custom((value) => {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') {
        throw new Error('Code must be a string');
      }
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        throw new Error('Code cannot be empty');
      }
      if (trimmed.length < 3 || trimmed.length > 50) {
        throw new Error('Code must be between 3 and 50 characters');
      }
    }
    return true;
  });

  return isOptional ? validator.optional() : validator;
};

const validateExpirationDate = (isOptional = false) => {
  const validator = body('expirationDate')
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date')
    .custom((value) => {
      if (!isOptional && new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    });

  return isOptional ? validator.optional() : validator;
};

const validateAtLeastOneField = () => {
  return body().custom((value) => {
    if (Object.keys(value).length === 0) {
      throw new Error('At least one field must be provided for update');
    }
    return true;
  });
};

module.exports = {
  validateDiscountType,
  validateDiscountValue,
  validateCode,
  validateExpirationDate,
  validateAtLeastOneField
};


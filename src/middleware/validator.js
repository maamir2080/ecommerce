const { validate } = require('./validators/validate.middleware');
const voucherValidators = require('./validators/voucher.validator');
const promotionValidators = require('./validators/promotion.validator');
const orderValidators = require('./validators/order.validator');

module.exports = {
  validate,
  ...voucherValidators,
  ...promotionValidators,
  ...orderValidators
};


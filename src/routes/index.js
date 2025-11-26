const { Router } = require('express');
const voucherRoutes = require('./voucher.routes');
const promotionRoutes = require('./promotion.routes');
const orderRoutes = require('./order.routes');

const router = Router();

router.use('/voucher', voucherRoutes);
router.use('/promotions', promotionRoutes);
router.use('/orders', orderRoutes);

module.exports = router;



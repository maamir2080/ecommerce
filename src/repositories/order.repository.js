const { BaseRepository } = require('./base.repository');
const { Order } = require('../models/Order');
const { Types } = require('mongoose');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async findByUserId(userId) {
    if (!this.isValidObjectId(userId)) {
      return [];
    }
    const results = await this.model.find({ userId: new Types.ObjectId(userId) })
      .populate('items.productId', 'name price')
      .populate('appliedVoucher.voucherId', 'code discountType discountValue')
      .populate('appliedPromotions.promotionId', 'code discountType discountValue')
      .sort({ createdAt: -1 });
    return results;
  }

  async findByIdWithPopulate(id) {
    if (!this.isValidObjectId(id)) {
      return null;
    }
    const result = await this.model.findById(id)
      .populate('items.productId', 'name price')
      .populate('appliedVoucher.voucherId', 'code discountType discountValue')
      .populate('appliedPromotions.promotionId', 'code discountType discountValue');
    return result;
  }

  async findAllWithPopulate() {
    const results = await this.model.find()
      .populate('items.productId', 'name price')
      .populate('appliedVoucher.voucherId', 'code discountType discountValue')
      .populate('appliedPromotions.promotionId', 'code discountType discountValue')
      .sort({ createdAt: -1 });
    return results;
  }

  isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}

module.exports = { OrderRepository };



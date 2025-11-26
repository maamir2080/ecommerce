const { BaseRepository } = require('./base.repository');
const { Promotion } = require('../models/Promotion');

class PromotionRepository extends BaseRepository {
  constructor() {
    super(Promotion);
  }

  async findByCode(code) {
    if (!code || typeof code !== 'string') {
      return null;
    }
    const trimmedCode = code.trim();
    const result = await this.model.findOne({ code: trimmedCode })
      .populate('eligibleCategories', 'name')
      .populate('eligibleItems', 'name price');
    return result;
  }

  async findActive() {
    const results = await this.model.find({ isActive: true })
      .populate('eligibleCategories', 'name')
      .populate('eligibleItems', 'name price')
      .sort({ createdAt: -1 });
    return results;
  }

  async findInactive() {
    const results = await this.model.find({ isActive: false })
      .populate('eligibleCategories', 'name')
      .populate('eligibleItems', 'name price')
      .sort({ createdAt: -1 });
    return results;
  }

  async findByActiveStatus(isActive) {
    const results = await this.model.find({ isActive })
      .populate('eligibleCategories', 'name')
      .populate('eligibleItems', 'name price')
      .sort({ createdAt: -1 });
    return results;
  }

  async findByIdWithPopulate(id) {
    if (!this.isValidObjectId(id)) {
      return null;
    }
    const result = await this.model.findById(id)
      .populate('eligibleCategories', 'name')
      .populate('eligibleItems', 'name price');
    return result;
  }

  async incrementUsage(id) {
    if (!this.isValidObjectId(id)) {
      return;
    }
    await this.model.findByIdAndUpdate(id, { $inc: { usedCount: 1 } });
  }

  async codeExists(code, excludeId) {
    const filter = { code };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    return await this.exists(filter);
  }

  isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}

module.exports = { PromotionRepository };



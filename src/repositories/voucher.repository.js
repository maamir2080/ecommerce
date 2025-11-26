const { BaseRepository } = require('./base.repository');
const { Voucher } = require('../models/Voucher');

class VoucherRepository extends BaseRepository {
  constructor() {
    super(Voucher);
  }

  async findByCode(code) {
    return await this.findOne({ code });
  }

  async findActive() {
    const results = await this.model.find({ isActive: true }).sort({ createdAt: -1 });
    return results;
  }

  async findInactive() {
    const results = await this.model.find({ isActive: false }).sort({ createdAt: -1 });
    return results;
  }

  async findByActiveStatus(isActive) {
    const results = await this.model.find({ isActive }).sort({ createdAt: -1 });
    return results;
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

module.exports = { VoucherRepository };



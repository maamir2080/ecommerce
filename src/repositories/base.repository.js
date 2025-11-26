const { Types } = require('mongoose');

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const document = new this.model(data);
    return await document.save();
  }

  async findById(id) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.model.findById(id);
  }

  async findOne(filter) {
    return await this.model.findOne(filter);
  }

  async findMany(filter) {
    if (filter) {
      return await this.model.find(filter);
    }
    return await this.model.find();
  }

  async update(id, data) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }

  async exists(filter) {
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }
}

module.exports = { BaseRepository };



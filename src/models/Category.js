const { Schema, model } = require('mongoose');

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

CategorySchema.index({ name: 1 }, { unique: true });

const Category = model('Category', CategorySchema);

module.exports = { Category };



const { Schema, model } = require('mongoose');

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    description: { type: String },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ProductSchema.index({ name: 1 });
ProductSchema.index({ categoryId: 1 });

const Product = model('Product', ProductSchema);

module.exports = { Product };



const { Schema, model } = require('mongoose');

const PromotionSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    eligibleCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    eligibleItems: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    usageLimit: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

PromotionSchema.index({ code: 1 }, { unique: true });
PromotionSchema.index({ eligibleCategories: 1 });
PromotionSchema.index({ eligibleItems: 1 });

const Promotion = model('Promotion', PromotionSchema);

module.exports = { Promotion };



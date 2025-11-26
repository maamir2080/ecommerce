const { Schema, model } = require('mongoose');

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    finalAmount: { type: Number },
    appliedVoucher: {
      voucherId: { type: Schema.Types.ObjectId, ref: 'Voucher' },
      code: { type: String },
      discountAmount: { type: Number }
    },
    appliedPromotions: [
      {
        promotionId: { type: Schema.Types.ObjectId, ref: 'Promotion' },
        code: { type: String },
        discountAmount: { type: Number }
      }
    ]
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ 'appliedVoucher.voucherId': 1 });
OrderSchema.index({ 'appliedPromotions.promotionId': 1 });

const Order = model('Order', OrderSchema);

module.exports = { Order };



const { Schema, model } = require('mongoose');

const VoucherSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    usageLimit: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    minOrderValue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

VoucherSchema.index({ code: 1 }, { unique: true });
VoucherSchema.index({ expirationDate: 1 });
VoucherSchema.index({ isActive: 1 });

const Voucher = model('Voucher', VoucherSchema);

module.exports = { Voucher };



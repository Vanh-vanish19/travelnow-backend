const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  discountPercentage: { type: Number, required: true, min: 0, max: 100 },
  validFrom: { type: Date, default: Date.now },
  validTo: { type: Date, required: true },
  type: { type: String, enum: ['public', 'gift'], default: 'gift' },
  usersClaimed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);

const mongoose = require('mongoose');

const moneySchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    value: { type: Number, default: 0 }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    },
    hotel: {
      id: { type: String, trim: true },
      name: { type: String, trim: true },
      address: { type: String, trim: true },
      rating: { type: Number },
      image: { type: String, trim: true }
    },
    roomType: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      pricePerNight: { type: Number, default: 0 },
      bedType: { type: String },
      maxGuests: { type: Number }
    },
    stay: {
      checkIn: { type: Date, required: true },
      checkOut: { type: Date, required: true },
      nights: { type: Number, default: 1 }
    },
    timings: {
      checkIn: { type: String, trim: true },
      checkOut: { type: String, trim: true }
    },
    guests: {
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 },
      rooms: { type: Number, default: 1 }
    },
    pricing: {
      nightly: { type: Number, default: 0 },
      base: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    voucher: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
      code: { type: String },
      discountAmount: { type: Number, default: 0 }
    },
    payment: {
      method: { type: String, trim: true },
      status: {
        type: String,
        enum: ['paid', 'unpaid', 'refunded'],
        default: 'unpaid'
      },
      cardLast4: { type: String, trim: true },
      deadline: { type: Date },
      total: { type: Number, default: 0 },
      breakdown: [moneySchema]
    },
    cancellation: {
      reason: { type: String, trim: true },
      cancelledAt: { type: Date }
    },
    contact: {
      fullName: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true }
    },
    specialRequest: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('booking', bookingSchema);

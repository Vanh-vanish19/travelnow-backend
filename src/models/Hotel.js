const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    description: { type: String },
    pricePerNight: { type: Number, required: true },
    currency: { type: String },
    roomTypes: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String },
      pricePerNight: { type: Number, required: true },
      totalRooms: { type: Number, default: 1 },
      maxGuests: { type: Number, default: 2 },
      bedType: { type: String },
      size: { type: Number },
      amenities: [{ type: String }],
      images: [{ type: String }]
    }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    distanceFromCenterKm: { type: Number, default: 0 },
    imageUrl: { type: String },
    imageUrls: [{ type: String }],
    tags: [{ type: String }],
    amenities: [{ type: String }]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('hotel', hotelSchema);

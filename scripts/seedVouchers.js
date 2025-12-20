require('dotenv').config();
const mongoose = require('mongoose');
const Voucher = require('../src/models/Voucher');
const connectDB = require('../src/config/db');

const vouchers = [
  {
    code: 'WELCOME10',
    description: 'Giảm 10% cho đơn đặt phòng đầu tiên',
    discountPercentage: 10,
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    type: 'gift'
  },
  {
    code: 'SUMMER20',
    description: 'Chào hè rực rỡ - Giảm ngay 20%',
    discountPercentage: 20,
    validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
    type: 'gift'
  },
  {
    code: 'TRAVEL30',
    description: 'Siêu ưu đãi du lịch - Giảm 30%',
    discountPercentage: 30,
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
    type: 'gift'
  },
  {
    code: 'FLASHDEAL15',
    description: 'Flash Deal trong ngày - Giảm 15%',
    discountPercentage: 15,
    validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    type: 'gift'
  }
];

const seedVouchers = async () => {
  try {
    await connectDB();
    
    // Clear existing vouchers
    await Voucher.deleteMany({});
    console.log('Cleared existing vouchers');

    // Insert new vouchers
    await Voucher.insertMany(vouchers);
    console.log('Vouchers seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding vouchers:', error);
    process.exit(1);
  }
};

seedVouchers();

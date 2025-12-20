const Voucher = require('../models/Voucher');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

exports.getVouchers = async (req, res) => {
  try {
    let userId = null;
    
    // Manual token check to support optional auth
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        userId = payload.sub;
      } catch (e) {
        // Ignore invalid token for public view
      }
    }

    const now = new Date();

    // Get all active vouchers that haven't expired
    const vouchers = await Voucher.find({
      isActive: true,
      validTo: { $gt: now }
    }).sort({ discountPercentage: -1 });

    const result = vouchers.map(voucher => {
      const isClaimed = userId ? voucher.usersClaimed.includes(userId) : false;
      // Don't send the full usersClaimed array to frontend for privacy/bandwidth
      const { usersClaimed, ...voucherData } = voucher.toObject();
      return {
        ...voucherData,
        isClaimed
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.claimVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    // req.user is set by authMiddleware
    const userId = req.user.id;

    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher không tồn tại' });
    }

    if (!voucher.isActive) {
        return res.status(400).json({ message: 'Voucher này đã bị vô hiệu hóa' });
    }

    if (new Date() > voucher.validTo) {
        return res.status(400).json({ message: 'Voucher đã hết hạn' });
    }

    if (voucher.usersClaimed.includes(userId)) {
      return res.status(400).json({ message: 'Bạn đã nhận voucher này rồi' });
    }

    voucher.usersClaimed.push(userId);
    await voucher.save();

    res.json({ message: 'Nhận voucher thành công', voucherId: voucher._id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public route (optional auth handled inside)
router.get('/', voucherController.getVouchers);

// Protected route
router.post('/:id/claim', authMiddleware, voucherController.claimVoucher);

module.exports = router;

const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Voucher = require('../models/Voucher');

function randomDigits(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateBookingCode() {
  let code;
  let exists = true;
  while (exists) {
    code = `TRV-${randomDigits(6)}`;
    // eslint-disable-next-line no-await-in-loop
    exists = await Booking.exists({ bookingCode: code });
  }
  return code;
}

function sanitizeBreakdown(breakdown = []) {
  if (!Array.isArray(breakdown)) {
    return [];
  }
  return breakdown
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      label: item.label,
      value: Number(item.value) || 0
    }));
}

async function createBooking(userId, payload) {
  if (!payload?.stay?.checkIn || !payload?.stay?.checkOut) {
    const error = new Error('Thiếu thông tin ngày nhận/trả phòng');
    error.status = 400;
    throw error;
  }

  const hotelId = payload.hotel?.id;
  const roomTypeId = payload.roomType?.id;

  if (!roomTypeId) {
    const error = new Error('Vui lòng chọn loại phòng');
    error.status = 400;
    throw error;
  }

  if (hotelId && roomTypeId) {
    const availabilityCheck = await checkAvailability(
      hotelId,
      payload.stay.checkIn,
      payload.stay.checkOut,
      roomTypeId
    );

    if (!availabilityCheck.available) {
      const error = new Error(availabilityCheck.message || 'Loại phòng này không còn trống');
      error.status = 409;
      error.availabilityInfo = availabilityCheck;
      throw error;
    }

    const requestedRooms = payload.guests?.rooms || 1;
    if (availabilityCheck.roomType && availabilityCheck.roomType.availableRooms < requestedRooms) {
      const error = new Error(
        `Chỉ còn ${availabilityCheck.roomType.availableRooms} phòng trống cho loại phòng này`
      );
      error.status = 409;
      throw error;
    }
  }

  // Handle Voucher Logic
  let discountAmount = 0;
  let voucherData = null;

  if (payload.voucherId) {
    const voucher = await Voucher.findById(payload.voucherId);
    if (!voucher) {
      const error = new Error('Voucher không tồn tại');
      error.status = 400;
      throw error;
    }
    if (!voucher.isActive) {
      const error = new Error('Voucher không còn hiệu lực');
      error.status = 400;
      throw error;
    }
    if (new Date() > voucher.validTo) {
      const error = new Error('Voucher đã hết hạn');
      error.status = 400;
      throw error;
    }
    // Check if user has claimed this voucher
    if (!voucher.usersClaimed.includes(userId)) {
      const error = new Error('Bạn chưa sở hữu voucher này');
      error.status = 400;
      throw error;
    }

    // Calculate discount
    const nightly = payload.pricing?.nightly || 0;
    const nights = payload.stay?.nights || 1;
    const rooms = payload.guests?.rooms || 1;
    const basePrice = nightly * nights * rooms;
    const serviceFee = Math.round(basePrice * 0.1);
    const tax = Math.round(basePrice * 0.08);
    const preDiscountTotal = basePrice + serviceFee + tax;

    discountAmount = Math.round(preDiscountTotal * (voucher.discountPercentage / 100));
    
    voucherData = {
      id: voucher._id,
      code: voucher.code,
      discountAmount: discountAmount
    };
  }

  const bookingCode = await generateBookingCode();
  
  // Recalculate final total if voucher applied
  const finalTotal = (payload.pricing?.total || 0) - discountAmount;

  const bookingData = {
    user: userId,
    bookingCode,
    status: payload.status || (payload.payment?.status === 'paid' ? 'confirmed' : 'pending'),
    hotel: payload.hotel || {},
    roomType: {
      id: payload.roomType.id,
      name: payload.roomType.name,
      pricePerNight: payload.roomType.pricePerNight || 0,
      bedType: payload.roomType.bedType,
      maxGuests: payload.roomType.maxGuests
    },
    stay: {
      checkIn: payload.stay.checkIn,
      checkOut: payload.stay.checkOut,
      nights: payload.stay.nights || 1
    },
    timings: payload.timings || {},
    guests: payload.guests || {},
    pricing: {
      nightly: payload.pricing?.nightly || 0,
      base: payload.pricing?.base || 0,
      serviceFee: payload.pricing?.serviceFee || 0,
      tax: payload.pricing?.tax || 0,
      discount: discountAmount,
      total: finalTotal > 0 ? finalTotal : 0
    },
    voucher: voucherData || {},
    payment: {
      method: payload.payment?.method,
      status: payload.payment?.status || 'unpaid',
      cardLast4: payload.payment?.cardLast4,
      deadline: payload.payment?.deadline || null,
      total: finalTotal > 0 ? finalTotal : 0,
      breakdown: sanitizeBreakdown(payload.payment?.breakdown)
    },
    contact: payload.contact || {},
    specialRequest: payload.specialRequest || ''
  };

  const booking = await Booking.create(bookingData);
  return booking;
}

async function getBookingsByUser(userId) {
  const bookings = await Booking.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
  return bookings;
}

async function getBookingById(userId, bookingId) {
  const booking = await Booking.findOne({ _id: bookingId, user: userId }).lean();
  return booking;
}

async function cancelBooking(userId, bookingId, reason) {
  const booking = await Booking.findOne({ _id: bookingId, user: userId });
  if (!booking) {
    const error = new Error('Không tìm thấy đặt phòng');
    error.status = 404;
    throw error;
  }

  if (booking.status === 'cancelled') {
    return booking.toObject();
  }

  const trimmedReason = typeof reason === 'string' ? reason.trim().slice(0, 200) : '';
  booking.status = 'cancelled';
  if (booking.payment && booking.payment.status === 'paid') {
    booking.payment.status = 'refunded';
  }
  booking.cancellation = {
    reason: trimmedReason || 'Người dùng hủy đặt phòng',
    cancelledAt: new Date()
  };

  await booking.save();
  return booking.toObject();
}

async function checkAvailability(hotelId, checkIn, checkOut, roomTypeId = null) {
  if (!hotelId || !checkIn || !checkOut) {
    return { available: false, message: 'Thiếu thông tin khách sạn hoặc ngày' };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return { available: false, message: 'Ngày không hợp lệ' };
  }

  if (checkInDate >= checkOutDate) {
    return { available: false, message: 'Ngày trả phòng phải sau ngày nhận phòng' };
  }

  const Hotel = require('../models/Hotel');
  const hotel = await Hotel.findById(hotelId).lean();
  if (!hotel) {
    return { available: false, message: 'Không tìm thấy khách sạn' };
  }

  const roomTypes = hotel.roomTypes || [];
  if (roomTypes.length === 0) {
    return { available: false, message: 'Khách sạn chưa có loại phòng nào' };
  }

  const overlappingBookings = await Booking.find({
    'hotel.id': hotelId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        'stay.checkIn': { $lt: checkOutDate },
        'stay.checkOut': { $gt: checkInDate }
      }
    ]
  }).lean();

  const roomTypeAvailability = roomTypes.map((roomType) => {
    const bookedCount = overlappingBookings.filter(
      (booking) => booking.roomType?.id === roomType.id
    ).reduce((sum, booking) => sum + (booking.guests?.rooms || 1), 0);

    const available = roomType.totalRooms - bookedCount;

    return {
      id: roomType.id,
      name: roomType.name,
      description: roomType.description,
      pricePerNight: roomType.pricePerNight,
      totalRooms: roomType.totalRooms,
      availableRooms: Math.max(0, available),
      bookedRooms: bookedCount,
      maxGuests: roomType.maxGuests,
      bedType: roomType.bedType,
      size: roomType.size,
      amenities: roomType.amenities || [],
      images: roomType.images || [],
      available: available > 0
    };
  });

  if (roomTypeId) {
    const specific = roomTypeAvailability.find((rt) => rt.id === roomTypeId);
    if (!specific) {
      return { available: false, message: 'Không tìm thấy loại phòng' };
    }
    return {
      available: specific.available,
      roomType: specific,
      message: specific.available
        ? `Còn ${specific.availableRooms} phòng trống`
        : 'Loại phòng này đã hết trong khoảng thời gian này'
    };
  }

  return {
    available: roomTypeAvailability.some((rt) => rt.available),
    roomTypes: roomTypeAvailability,
    message: 'Danh sách loại phòng và tình trạng'
  };
}

module.exports = {
  createBooking,
  getBookingsByUser,
  getBookingById,
  cancelBooking,
  checkAvailability
};

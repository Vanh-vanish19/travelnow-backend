const bookingService = require('../services/bookingService');

async function createBooking(req, res, next) {
  try {
    const booking = await bookingService.createBooking(req.user.id, req.body);
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
}

async function listBookings(req, res, next) {
  try {
    const bookings = await bookingService.getBookingsByUser(req.user.id);
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
}

async function getBooking(req, res, next) {
  try {
    const booking = await bookingService.getBookingById(req.user.id, req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng' });
    }
    return res.json({ booking });
  } catch (error) {
    next(error);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const booking = await bookingService.cancelBooking(req.user.id, req.params.id, req.body?.reason);
    res.json({ booking });
  } catch (error) {
    next(error);
  }
}

async function checkAvailability(req, res, next) {
  try {
    const { hotelId, checkIn, checkOut, roomTypeId } = req.query;
    const availability = await bookingService.checkAvailability(
      hotelId,
      checkIn,
      checkOut,
      roomTypeId || null
    );
    res.json(availability);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  cancelBooking,
  checkAvailability
};

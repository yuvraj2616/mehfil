const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
  checkInAttendee,
  getEventBookings
} = require("../controllers/bookingController");

// Protected routes (require authentication)
router.post("/", authMiddleware, createBooking);
router.get("/user", authMiddleware, getUserBookings);
router.get("/:bookingId", authMiddleware, getBookingDetails);
router.put("/:bookingId/cancel", authMiddleware, cancelBooking);
router.post("/:bookingId/checkin", authMiddleware, checkInAttendee);
router.get("/event/:eventId", authMiddleware, getEventBookings);

module.exports = router;

const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Payment = require("../models/Payment");
const User = require("../models/User");
const QRCode = require('qrcode');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { eventId, tickets, attendeeDetails, paymentMethod } = req.body;
    
    // Verify event exists and is available
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    if (event.status !== 'published') {
      return res.status(400).json({ error: "Event is not available for booking" });
    }
    
    // Check ticket availability
    let totalAmount = 0;
    let bookingTickets = [];
    
    for (let ticketRequest of tickets) {
      const ticketType = event.ticketing.ticketTypes.find(
        t => t.name === ticketRequest.ticketType
      );
      
      if (!ticketType) {
        return res.status(400).json({ error: `Ticket type ${ticketRequest.ticketType} not found` });
      }
      
      if (ticketType.sold + ticketRequest.quantity > ticketType.quantity) {
        return res.status(400).json({ 
          error: `Not enough ${ticketRequest.ticketType} tickets available` 
        });
      }
      
      const ticketTotal = ticketType.price * ticketRequest.quantity;
      totalAmount += ticketTotal;
      
      bookingTickets.push({
        ticketType: {
          name: ticketType.name,
          price: ticketType.price,
          currency: ticketType.currency
        },
        quantity: ticketRequest.quantity,
        totalPrice: ticketTotal
      });
    }
    
    // Apply discounts (if any)
    let finalAmount = totalAmount;
    let discounts = [];
    
    // Early bird discount
    if (event.ticketing.earlyBirdDiscount && 
        new Date() < event.ticketing.earlyBirdDiscount.validUntil) {
      const discount = (totalAmount * event.ticketing.earlyBirdDiscount.percentage) / 100;
      discounts.push({
        type: 'early_bird',
        amount: discount
      });
      finalAmount -= discount;
    }
    
    // Create booking
    const booking = new Booking({
      event: eventId,
      attendee: req.user._id,
      tickets: bookingTickets,
      totalAmount,
      finalAmount,
      discounts,
      attendeeDetails,
      paymentDetails: {
        method: paymentMethod
      }
    });
    
    // Generate QR code for check-in
    const qrData = {
      bookingId: booking.bookingId,
      eventId: eventId,
      attendeeId: req.user._id
    };
    
    booking.checkIn.qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    
    await booking.save();
    
    // Update ticket quantities (reserve them temporarily)
    for (let ticketRequest of tickets) {
      const ticketType = event.ticketing.ticketTypes.find(
        t => t.name === ticketRequest.ticketType
      );
      ticketType.sold += ticketRequest.quantity;
    }
    await event.save();
    
    res.status(201).json({
      message: "Booking created successfully",
      booking: {
        bookingId: booking.bookingId,
        totalAmount: booking.totalAmount,
        finalAmount: booking.finalAmount,
        status: booking.status,
        expiresAt: booking.expiresAt,
        qrCode: booking.checkIn.qrCode
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ attendee: req.user._id })
      .populate('event', 'title dateTime venue status')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      bookingId: req.params.bookingId,
      attendee: req.user._id 
    }).populate('event');
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      bookingId: req.params.bookingId,
      attendee: req.user._id 
    }).populate('event');
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: "Booking already cancelled" });
    }
    
    // Check cancellation policy
    const event = booking.event;
    const now = new Date();
    const eventDate = new Date(event.dateTime.start);
    const refundDeadline = new Date(eventDate.getTime() - (event.cancellationPolicy.refundDeadline * 60 * 60 * 1000));
    
    let refundAmount = 0;
    if (event.cancellationPolicy.refundable && now < refundDeadline) {
      refundAmount = (booking.finalAmount * event.cancellationPolicy.refundPercentage) / 100;
    }
    
    booking.status = 'cancelled';
    if (refundAmount > 0) {
      booking.paymentDetails.refundAmount = refundAmount;
      booking.paymentDetails.paymentStatus = 'refunded';
      booking.paymentDetails.refundedAt = new Date();
    }
    
    await booking.save();
    
    // Update ticket quantities
    for (let ticket of booking.tickets) {
      const ticketType = event.ticketing.ticketTypes.find(
        t => t.name === ticket.ticketType.name
      );
      if (ticketType) {
        ticketType.sold -= ticket.quantity;
      }
    }
    await event.save();
    
    res.json({
      message: "Booking cancelled successfully",
      refundAmount,
      booking
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check-in attendee (for organizers)
exports.checkInAttendee = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({ bookingId })
      .populate('event');
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Verify the user is the organizer of the event
    if (booking.event.organizer.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to check-in attendees" });
    }
    
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: "Booking is not confirmed" });
    }
    
    if (booking.checkIn.isCheckedIn) {
      return res.status(400).json({ error: "Attendee already checked in" });
    }
    
    booking.checkIn.isCheckedIn = true;
    booking.checkIn.checkInTime = new Date();
    booking.checkIn.checkInBy = req.user._id;
    
    await booking.save();
    
    // Update event total attendees
    booking.event.totalAttendees += booking.attendeeDetails.length;
    await booking.event.save();
    
    res.json({
      message: "Check-in successful",
      checkInTime: booking.checkIn.checkInTime,
      attendeeDetails: booking.attendeeDetails
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get event bookings (for organizers)
exports.getEventBookings = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Verify the user is the organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to view bookings" });
    }
    
    const bookings = await Booking.find({ event: eventId })
      .populate('attendee', 'name email phone')
      .sort({ createdAt: -1 });
    
    const summary = {
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      totalRevenue: bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.finalAmount, 0),
      totalAttendees: bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.attendeeDetails.length, 0),
      checkedIn: bookings.filter(b => b.checkIn.isCheckedIn).length
    };
    
    res.json({
      bookings,
      summary
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;

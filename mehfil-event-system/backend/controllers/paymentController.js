const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

// Process payment for a booking
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardDetails, billingAddress } = req.body;
    
    // Find the booking
    const booking = await Booking.findOne({ 
      bookingId,
      attendee: req.user._id 
    });
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: "Booking is not in pending status" });
    }
    
    // Create payment record
    const payment = new Payment({
      booking: booking._id,
      amount: booking.finalAmount,
      currency: booking.currency,
      paymentMethod,
      billingAddress,
      securityChecks: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    // Simulate payment processing (in real app, integrate with payment gateway)
    try {
      // Mock payment processing
      const paymentResult = await mockPaymentProcessing(payment);
      
      if (paymentResult.success) {
        payment.status = 'completed';
        payment.gateway.transactionId = paymentResult.transactionId;
        payment.completedAt = new Date();
        
        // Update booking status
        booking.status = 'confirmed';
        booking.paymentDetails.paymentStatus = 'completed';
        booking.paymentDetails.transactionId = paymentResult.transactionId;
        booking.paymentDetails.paidAt = new Date();
        
        await payment.save();
        await booking.save();
        
        // Update event revenue
        const event = await Event.findById(booking.event);
        event.finances.totalRevenue += booking.finalAmount;
        event.totalBookings += 1;
        await event.save();
        
        res.json({
          message: "Payment processed successfully",
          paymentId: payment.paymentId,
          transactionId: paymentResult.transactionId,
          booking: {
            bookingId: booking.bookingId,
            status: booking.status
          }
        });
        
      } else {
        payment.status = 'failed';
        payment.failedAt = new Date();
        payment.errorDetails = {
          code: paymentResult.errorCode,
          message: paymentResult.errorMessage
        };
        
        await payment.save();
        
        res.status(400).json({
          error: "Payment failed",
          reason: paymentResult.errorMessage
        });
      }
      
    } catch (paymentError) {
      payment.status = 'failed';
      payment.failedAt = new Date();
      payment.errorDetails = {
        message: paymentError.message
      };
      
      await payment.save();
      
      res.status(500).json({ error: "Payment processing failed" });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findOne({ 
      paymentId: req.params.paymentId 
    }).populate({
      path: 'booking',
      populate: {
        path: 'event',
        select: 'title dateTime venue'
      }
    });
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    // Check if user has access to this payment
    if (payment.booking.attendee.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;
    
    const payment = await Payment.findOne({ paymentId })
      .populate('booking');
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    if (payment.status !== 'completed') {
      return res.status(400).json({ error: "Payment is not completed" });
    }
    
    // Check authorization (only organizer or admin can process refunds)
    const event = await Event.findById(payment.booking.event);
    if (event.organizer.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to process refunds" });
    }
    
    const refundAmount = amount || payment.amount;
    
    if (refundAmount > (payment.amount - payment.totalRefunded)) {
      return res.status(400).json({ error: "Refund amount exceeds available amount" });
    }
    
    // Mock refund processing
    const refundResult = await mockRefundProcessing(payment, refundAmount);
    
    if (refundResult.success) {
      payment.refunds.push({
        amount: refundAmount,
        reason,
        refundId: refundResult.refundId,
        processedAt: new Date(),
        processedBy: req.user._id,
        status: 'completed'
      });
      
      payment.totalRefunded += refundAmount;
      
      if (payment.totalRefunded >= payment.amount) {
        payment.status = 'refunded';
      } else {
        payment.status = 'partially_refunded';
      }
      
      await payment.save();
      
      // Update booking status
      payment.booking.status = 'refunded';
      payment.booking.paymentDetails.refundAmount = payment.totalRefunded;
      payment.booking.paymentDetails.refundedAt = new Date();
      await payment.booking.save();
      
      res.json({
        message: "Refund processed successfully",
        refundId: refundResult.refundId,
        refundAmount,
        totalRefunded: payment.totalRefunded
      });
      
    } else {
      res.status(400).json({
        error: "Refund processing failed",
        reason: refundResult.errorMessage
      });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payment analytics (for organizers)
exports.getPaymentAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Check authorization
    if (event.organizer.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Get all payments for this event
    const payments = await Payment.find()
      .populate({
        path: 'booking',
        match: { event: eventId }
      })
      .exec();
    
    const validPayments = payments.filter(p => p.booking);
    
    const analytics = {
      totalPayments: validPayments.length,
      totalRevenue: validPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
      totalRefunded: validPayments
        .reduce((sum, p) => sum + p.totalRefunded, 0),
      paymentMethods: {},
      dailyRevenue: {},
      failedPayments: validPayments.filter(p => p.status === 'failed').length
    };
    
    // Group by payment method
    validPayments.forEach(payment => {
      if (!analytics.paymentMethods[payment.paymentMethod]) {
        analytics.paymentMethods[payment.paymentMethod] = {
          count: 0,
          amount: 0
        };
      }
      analytics.paymentMethods[payment.paymentMethod].count++;
      analytics.paymentMethods[payment.paymentMethod].amount += payment.amount;
    });
    
    // Group by date
    validPayments.forEach(payment => {
      const date = payment.createdAt.toISOString().split('T')[0];
      if (!analytics.dailyRevenue[date]) {
        analytics.dailyRevenue[date] = 0;
      }
      if (payment.status === 'completed') {
        analytics.dailyRevenue[date] += payment.amount;
      }
    });
    
    res.json(analytics);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mock payment processing function (replace with real payment gateway)
async function mockPaymentProcessing(payment) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      
      if (success) {
        resolve({
          success: true,
          transactionId: 'TXN' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
        });
      } else {
        resolve({
          success: false,
          errorCode: 'PAYMENT_DECLINED',
          errorMessage: 'Payment was declined by the bank'
        });
      }
    }, 1000); // Simulate processing delay
  });
}

// Mock refund processing function
async function mockRefundProcessing(payment, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        refundId: 'REF' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
      });
    }, 500);
  });
}

module.exports = exports;

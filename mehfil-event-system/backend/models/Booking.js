const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  // Booking Reference
  bookingId: { 
    type: String, 
    unique: true, 
    required: true,
    default: function() {
      return 'BK' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  
  // Event and User Information
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Event", 
    required: true 
  },
  attendee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  // Ticket Information
  tickets: [{
    ticketType: {
      name: String,
      price: Number,
      currency: { type: String, default: 'USD' }
    },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  
  // Booking Details
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  
  // Discount Information
  discounts: [{
    type: { type: String, enum: ['early_bird', 'group', 'promo_code', 'student'] },
    amount: Number,
    code: String
  }],
  finalAmount: { type: Number, required: true },
  
  // Booking Status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'refunded', 'expired'], 
    default: 'pending' 
  },
  
  // Payment Information
  paymentDetails: {
    method: { 
      type: String, 
      enum: ['credit_card', 'debit_card', 'paypal', 'mobile_wallet', 'bank_transfer'],
      required: true
    },
    transactionId: String,
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'], 
      default: 'pending' 
    },
    paidAt: Date,
    refundAmount: { type: Number, default: 0 },
    refundedAt: Date
  },
  
  // Attendee Information
  attendeeDetails: [{
    name: { type: String, required: true },
    email: String,
    phone: String,
    age: Number,
    dietaryRestrictions: [String],
    accessibility: [String]
  }],
  
  // Check-in Information
  checkIn: {
    qrCode: String,
    checkInTime: Date,
    isCheckedIn: { type: Boolean, default: false },
    checkInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  
  // Booking Source
  source: { 
    type: String, 
    enum: ['web', 'mobile', 'admin'], 
    default: 'web' 
  },
  
  // Communication
  notifications: [{
    type: { type: String, enum: ['confirmation', 'reminder', 'update', 'cancellation'] },
    sentAt: Date,
    method: { type: String, enum: ['email', 'sms', 'push'] }
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { 
    type: Date, 
    default: function() { 
      return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from creation
    }
  }
});

// TTL index for automatic cleanup of expired bookings
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Indexes for better performance
bookingSchema.index({ attendee: 1 });
bookingSchema.index({ event: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'paymentDetails.paymentStatus': 1 });

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // If booking is confirmed, remove expiration
  if (this.status === 'confirmed') {
    this.expiresAt = undefined;
  }
  
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  // Payment Reference
  paymentId: { 
    type: String, 
    unique: true, 
    required: true,
    default: function() {
      return 'PAY' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  
  // Related Booking
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Booking", 
    required: true 
  },
  
  // Payment Details
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  
  // Payment Method
  paymentMethod: { 
    type: String, 
    enum: ['credit_card', 'debit_card', 'paypal', 'mobile_wallet', 'bank_transfer'],
    required: true
  },
  
  // Card Details (encrypted/tokenized)
  cardDetails: {
    last4: String,
    brand: String, // visa, mastercard, etc.
    expiryMonth: String,
    expiryYear: String,
    token: String // tokenized card info
  },
  
  // Payment Gateway Information
  gateway: {
    provider: { type: String, enum: ['stripe', 'paypal', 'razorpay', 'square'] },
    transactionId: String,
    sessionId: String,
    chargeId: String
  },
  
  // Payment Status
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'], 
    default: 'pending' 
  },
  
  // Refund Information
  refunds: [{
    amount: Number,
    reason: String,
    refundId: String,
    processedAt: Date,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ['pending', 'completed', 'failed'] }
  }],
  totalRefunded: { type: Number, default: 0 },
  
  // Security and Fraud Detection
  securityChecks: {
    riskScore: { type: Number, default: 0 },
    fraudCheck: { type: Boolean, default: false },
    ipAddress: String,
    userAgent: String,
    deviceFingerprint: String
  },
  
  // Billing Information
  billingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Payment Timeline
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  
  // Error Information
  errorDetails: {
    code: String,
    message: String,
    details: String
  },
  
  // Fees and Charges
  processingFee: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  netAmount: Number, // amount after fees
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
paymentSchema.index({ booking: 1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'gateway.transactionId': 1 });
paymentSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate net amount
  this.netAmount = this.amount - (this.processingFee || 0) - (this.platformFee || 0);
  
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);

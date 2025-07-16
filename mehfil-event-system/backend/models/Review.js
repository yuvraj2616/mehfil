const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  // Review Details
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Event", 
    required: true 
  },
  reviewer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  // Ratings (1-5 stars)
  ratings: {
    overall: { type: Number, required: true, min: 1, max: 5 },
    venue: { type: Number, min: 1, max: 5 },
    organization: { type: Number, min: 1, max: 5 },
    performance: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 }
  },
  
  // Review Content
  title: { type: String, required: true },
  content: { type: String, required: true },
  pros: [String],
  cons: [String],
  
  // Media
  images: [String],
  
  // Review Status
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'flagged'], 
    default: 'pending' 
  },
  
  // Moderation
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  moderatedAt: Date,
  moderationReason: String,
  
  // Interaction
  helpfulVotes: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  
  // Verification
  isVerifiedPurchase: { type: Boolean, default: false },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  
  // Response from Organizer
  organizerResponse: {
    content: String,
    respondedAt: Date,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
reviewSchema.index({ event: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ 'ratings.overall': 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

// Ensure one review per user per event
reviewSchema.index({ event: 1, reviewer: 1 }, { unique: true });

// Update the updatedAt field before saving
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Review", reviewSchema);

const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  // Basic Event Information
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["poetry", "music", "dance", "cultural", "literary", "comedy", "theater", "other"],
    required: true
  },
  tags: [String],
  
  // Event Scheduling
  dateTime: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  duration: { type: Number }, // in minutes
  timezone: { type: String, default: 'UTC' },
  
  // Venue Information
  venue: {
    name: { type: String, required: true },
    address: {
      street: String,
      city: { type: String, required: true },
      state: String,
      country: { type: String, required: true },
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    capacity: { type: Number, required: true },
    amenities: [String],
    accessibility: [String]
  },
  
  // Event Organization
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  // Artists and Performers
  artists: [{
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: String, // main performer, supporting, guest, etc.
    fee: Number,
    status: { 
      type: String, 
      enum: ['invited', 'accepted', 'declined', 'confirmed'], 
      default: 'invited' 
    },
    invitedAt: { type: Date, default: Date.now },
    respondedAt: Date
  }],
  
  // Ticketing Information
  ticketing: {
    isTicketed: { type: Boolean, default: true },
    ticketTypes: [{
      name: { type: String, required: true }, // VIP, Standard, Early Bird, etc.
      description: String,
      price: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      quantity: { type: Number, required: true },
      sold: { type: Number, default: 0 },
      benefits: [String],
      isActive: { type: Boolean, default: true }
    }],
    earlyBirdDiscount: {
      percentage: Number,
      validUntil: Date
    },
    groupDiscount: {
      minQuantity: Number,
      percentage: Number
    }
  },
  
  // Financial Information
  finances: {
    totalRevenue: { type: Number, default: 0 },
    expenses: [{
      category: { 
        type: String, 
        enum: ['venue', 'artist_fees', 'marketing', 'equipment', 'catering', 'other'] 
      },
      description: String,
      amount: Number,
      date: { type: Date, default: Date.now }
    }],
    sponsors: [{
      sponsor: { type: mongoose.Schema.Types.ObjectId, ref: "Sponsor" },
      amount: Number,
      benefits: [String],
      status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
      }
    }]
  },
  
  // Event Media
  media: {
    coverImage: String,
    gallery: [String],
    videos: [String],
    livestreamUrl: String
  },
  
  // Event Status and Management
  status: { 
    type: String, 
    enum: ['draft', 'published', 'cancelled', 'completed', 'postponed'], 
    default: 'draft' 
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  
  // Booking and Attendance
  totalBookings: { type: Number, default: 0 },
  totalAttendees: { type: Number, default: 0 },
  checkInCode: String,
  
  // Reviews and Rating
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  
  // Policies
  cancellationPolicy: {
    refundable: { type: Boolean, default: true },
    refundDeadline: Date, // hours before event
    refundPercentage: { type: Number, default: 100 },
    terms: String
  },
  
  // Communication
  announcements: [{
    title: String,
    message: String,
    sentAt: { type: Date, default: Date.now },
    sentTo: { type: String, enum: ['all', 'attendees', 'artists'], default: 'all' }
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: Date
});

// Update the updatedAt field before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

// Indexes for better performance
eventSchema.index({ 'dateTime.start': 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ 'venue.address.city': 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ tags: 1 });

module.exports = mongoose.model("Event", eventSchema);

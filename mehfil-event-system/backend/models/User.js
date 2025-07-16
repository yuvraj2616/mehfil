const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  
  // Role-based Information
  role: { 
    type: String, 
    enum: ["admin", "organizer", "artist", "attendee"], 
    default: "attendee" 
  },
  
  // Profile Information
  bio: { type: String },
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Artist-specific fields
  artistProfile: {
    portfolio: [{
      title: String,
      description: String,
      mediaUrl: String,
      mediaType: { type: String, enum: ['image', 'video', 'audio'] }
    }],
    skills: [String],
    experience: String,
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    availability: [{
      date: Date,
      timeSlots: [String]
    }],
    priceRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' }
    }
  },
  
  // Organizer-specific fields
  organizerProfile: {
    companyName: String,
    companyDescription: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    },
    rating: { type: Number, default: 0 },
    totalEvents: { type: Number, default: 0 },
    verificationStatus: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected'], 
      default: 'pending' 
    }
  },
  
  // Attendee-specific fields
  attendeeProfile: {
    preferences: [String], // event categories they're interested in
    favoriteEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    bookingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    totalEventsAttended: { type: Number, default: 0 }
  },
  
  // Account Information
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.city': 1 });

module.exports = mongoose.model("User", userSchema);

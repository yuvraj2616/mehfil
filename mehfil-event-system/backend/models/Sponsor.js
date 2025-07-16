const mongoose = require("mongoose");

const sponsorSchema = new mongoose.Schema({
  // Company Information
  companyName: { type: String, required: true },
  companyDescription: String,
  logo: String,
  website: String,
  
  // Contact Information
  contactPerson: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    position: String
  },
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Sponsorship Details
  sponsorshipTier: { 
    type: String, 
    enum: ['platinum', 'gold', 'silver', 'bronze', 'partner'], 
    required: true 
  },
  
  // Industry and Categories
  industry: String,
  categories: [String], // types of events they sponsor
  
  // Sponsorship History
  sponsoredEvents: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Event" 
  }],
  totalSponsored: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  
  // Status and Verification
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending_approval', 'suspended'], 
    default: 'pending_approval' 
  },
  isVerified: { type: Boolean, default: false },
  
  // Benefits and Offerings
  sponsorshipBenefits: [{
    tier: String,
    benefits: [String],
    minimumAmount: Number,
    maximumEvents: Number
  }],
  
  // Marketing Preferences
  marketingPreferences: {
    logoPlacement: { type: Boolean, default: true },
    socialMediaMention: { type: Boolean, default: true },
    emailMarketing: { type: Boolean, default: true },
    eventAnnouncements: { type: Boolean, default: true }
  },
  
  // Rating and Reviews
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
sponsorSchema.index({ companyName: 1 });
sponsorSchema.index({ sponsorshipTier: 1 });
sponsorSchema.index({ status: 1 });
sponsorSchema.index({ industry: 1 });

// Update the updatedAt field before saving
sponsorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Sponsor", sponsorSchema);

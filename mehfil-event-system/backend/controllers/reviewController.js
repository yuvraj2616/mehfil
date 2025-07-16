const Review = require("../models/Review");
const Event = require("../models/Event");
const Booking = require("../models/Booking");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { eventId, ratings, title, content, pros, cons } = req.body;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Check if user attended the event
    const booking = await Booking.findOne({
      event: eventId,
      attendee: req.user._id,
      status: 'confirmed',
      'checkIn.isCheckedIn': true
    });
    
    if (!booking) {
      return res.status(403).json({ 
        error: "You can only review events you have attended" 
      });
    }
    
    // Check if user already reviewed this event
    const existingReview = await Review.findOne({
      event: eventId,
      reviewer: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this event" });
    }
    
    // Create review
    const review = new Review({
      event: eventId,
      reviewer: req.user._id,
      ratings,
      title,
      content,
      pros: pros || [],
      cons: cons || [],
      booking: booking._id,
      isVerifiedPurchase: true
    });
    
    await review.save();
    
    // Update event rating
    await updateEventRating(eventId);
    
    res.status(201).json({
      message: "Review created successfully",
      review
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reviews for an event
exports.getEventReviews = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    
    const reviews = await Review.find({ 
      event: eventId, 
      status: 'approved' 
    })
      .populate('reviewer', 'name avatar')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalReviews = await Review.countDocuments({ 
      event: eventId, 
      status: 'approved' 
    });
    
    // Calculate rating summary
    const ratingSummary = await Review.aggregate([
      { $match: { event: mongoose.Types.ObjectId(eventId), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$ratings.overall' },
          totalReviews: { $sum: 1 },
          ratings: {
            $push: {
              overall: '$ratings.overall',
              venue: '$ratings.venue',
              organization: '$ratings.organization',
              performance: '$ratings.performance',
              valueForMoney: '$ratings.valueForMoney'
            }
          }
        }
      }
    ]);
    
    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    if (ratingSummary.length > 0) {
      ratingSummary[0].ratings.forEach(rating => {
        const overall = Math.round(rating.overall);
        ratingDistribution[overall]++;
      });
    }
    
    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page * limit < totalReviews,
        hasPrev: page > 1
      },
      summary: {
        averageRating: ratingSummary.length > 0 ? ratingSummary[0].averageRating : 0,
        totalReviews,
        ratingDistribution
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { ratings, title, content, pros, cons } = req.body;
    
    const review = await Review.findOne({
      _id: reviewId,
      reviewer: req.user._id
    });
    
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    // Update review fields
    if (ratings) review.ratings = ratings;
    if (title) review.title = title;
    if (content) review.content = content;
    if (pros) review.pros = pros;
    if (cons) review.cons = cons;
    
    // Reset status to pending for re-moderation
    review.status = 'pending';
    
    await review.save();
    
    // Update event rating
    await updateEventRating(review.event);
    
    res.json({
      message: "Review updated successfully",
      review
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findOne({
      _id: reviewId,
      reviewer: req.user._id
    });
    
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    const eventId = review.event;
    await Review.findByIdAndDelete(reviewId);
    
    // Update event rating
    await updateEventRating(eventId);
    
    res.json({ message: "Review deleted successfully" });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Moderate review (admin/organizer)
exports.moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, reason } = req.body;
    
    const review = await Review.findById(reviewId).populate('event');
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && 
        review.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to moderate this review" });
    }
    
    review.status = status;
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();
    if (reason) review.moderationReason = reason;
    
    await review.save();
    
    // Update event rating if approved/rejected
    if (status === 'approved' || status === 'rejected') {
      await updateEventRating(review.event._id);
    }
    
    res.json({
      message: "Review moderated successfully",
      review
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add organizer response to review
exports.addOrganizerResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;
    
    const review = await Review.findById(reviewId).populate('event');
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    // Check if user is the organizer
    if (review.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only event organizer can respond to reviews" });
    }
    
    review.organizerResponse = {
      content,
      respondedAt: new Date(),
      respondedBy: req.user._id
    };
    
    await review.save();
    
    res.json({
      message: "Response added successfully",
      response: review.organizerResponse
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vote on review helpfulness
exports.voteOnReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body; // true for helpful, false for not helpful
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    // In a real implementation, you'd track who voted to prevent multiple votes
    review.totalVotes += 1;
    if (helpful) {
      review.helpfulVotes += 1;
    }
    
    await review.save();
    
    res.json({
      message: "Vote recorded successfully",
      helpfulVotes: review.helpfulVotes,
      totalVotes: review.totalVotes,
      helpfulPercentage: (review.helpfulVotes / review.totalVotes) * 100
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pending reviews for moderation
exports.getPendingReviews = async (req, res) => {
  try {
    let query = { status: 'pending' };
    
    // If not admin, only show reviews for organizer's events
    if (req.user.role !== 'admin') {
      const organizerEvents = await Event.find({ organizer: req.user._id }).select('_id');
      const eventIds = organizerEvents.map(e => e._id);
      query.event = { $in: eventIds };
    }
    
    const reviews = await Review.find(query)
      .populate('event', 'title dateTime')
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to update event rating
async function updateEventRating(eventId) {
  try {
    const ratingSummary = await Review.aggregate([
      { $match: { event: mongoose.Types.ObjectId(eventId), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$ratings.overall' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    const event = await Event.findById(eventId);
    if (ratingSummary.length > 0) {
      event.rating = Math.round(ratingSummary[0].averageRating * 10) / 10; // Round to 1 decimal
      event.totalReviews = ratingSummary[0].totalReviews;
    } else {
      event.rating = 0;
      event.totalReviews = 0;
    }
    
    await event.save();
  } catch (error) {
    console.error('Error updating event rating:', error);
  }
}

module.exports = exports;

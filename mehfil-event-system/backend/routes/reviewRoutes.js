const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const {
  createReview,
  getEventReviews,
  updateReview,
  deleteReview,
  moderateReview,
  addOrganizerResponse,
  voteOnReview,
  getPendingReviews
} = require("../controllers/reviewController");

// Public routes
router.get("/event/:eventId", getEventReviews);

// Protected routes (require authentication)
router.post("/", authMiddleware, createReview);
router.put("/:reviewId", authMiddleware, updateReview);
router.delete("/:reviewId", authMiddleware, deleteReview);
router.post("/:reviewId/vote", authMiddleware, voteOnReview);

// Organizer/Admin routes
router.put("/:reviewId/moderate", authMiddleware, moderateReview);
router.post("/:reviewId/response", authMiddleware, addOrganizerResponse);
router.get("/pending", authMiddleware, getPendingReviews);

module.exports = router;

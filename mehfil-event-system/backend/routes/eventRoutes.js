const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent
} = require("../controllers/eventController");

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected routes (require authentication)
router.post("/", authMiddleware, createEvent);
router.put("/:id", authMiddleware, updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);
router.post("/:id/join", authMiddleware, joinEvent);
router.post("/:id/leave", authMiddleware, leaveEvent);

module.exports = router;

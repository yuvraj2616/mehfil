const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const {
  getDashboardStats,
  getUsersList,
  updateUserStatus,
  getEventsList,
  getTransactionsList,
  getSystemAnalytics
} = require("../controllers/adminController");

// All admin routes require authentication
router.use(authMiddleware);

// Dashboard and analytics
router.get("/dashboard", getDashboardStats);
router.get("/analytics", getSystemAnalytics);

// User management
router.get("/users", getUsersList);
router.put("/users/:userId", updateUserStatus);

// Event management
router.get("/events", getEventsList);

// Transaction monitoring
router.get("/transactions", getTransactionsList);

module.exports = router;

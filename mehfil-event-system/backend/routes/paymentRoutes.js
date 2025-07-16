const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const {
  processPayment,
  getPaymentDetails,
  processRefund,
  getPaymentAnalytics
} = require("../controllers/paymentController");

// Protected routes (require authentication)
router.post("/process", authMiddleware, processPayment);
router.get("/:paymentId", authMiddleware, getPaymentDetails);
router.post("/refund", authMiddleware, processRefund);
router.get("/analytics/:eventId", authMiddleware, getPaymentAnalytics);

module.exports = router;

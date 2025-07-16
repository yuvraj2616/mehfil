// Main server file for Mehfil Event System
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes"); // Disabled: conflicts with authRoutes
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

// API Routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes); // Disabled: conflicts with authRoutes
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Mehfil Event System API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to Mehfil Event System API",
    version: "1.0.0",
    documentation: {
      users: "/api/users - User authentication and profile management",
      events: "/api/events - Event creation and management",
      bookings: "/api/bookings - Ticket booking and management",
      payments: "/api/payments - Payment processing and analytics",
      reviews: "/api/reviews - Event reviews and ratings",
      admin: "/api/admin - Administrative functions"
    },
    endpoints: {
      health: "/api/health",
      docs: "/api"
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

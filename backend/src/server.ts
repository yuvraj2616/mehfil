import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import http from "http";
import { initSocketIO } from "./socket";
dotenv.config();

import { optionalAuth } from "./middleware/auth";
import eventsRouter from "./routes/events";
import bookingsRouter from "./routes/bookings";
import paymentsRouter from "./routes/payments";
import reviewsRouter from "./routes/reviews";
import profilesRouter from "./routes/profiles";
import adminRouter from "./routes/admin";
import followsRouter from "./routes/follows";
import interactionsRouter from "./routes/interactions";
import recommendationsRouter from "./routes/recommendations";
import notificationsRouter from "./routes/notifications";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Initialize WebSockets
initSocketIO(server);

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Attach user to all requests if token is present (non-blocking)
app.use(optionalAuth);

// Routes
app.use("/events", eventsRouter);
app.use("/bookings", bookingsRouter);
app.use("/payments", paymentsRouter);
app.use("/reviews", reviewsRouter);
app.use("/profiles", profilesRouter);
app.use("/admin", adminRouter);
app.use("/follows", followsRouter);
app.use("/interactions", interactionsRouter);
app.use("/recommendations", recommendationsRouter);
app.use("/notifications", notificationsRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`✅ Mehfil API + WebSockets running on http://localhost:${PORT}`);
});

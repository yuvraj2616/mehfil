import { Router, Request, Response } from "express";
import { createAuthClient, supabasePublic } from "../supabaseClient";
import { requireAuth } from "../middleware/auth";

const router = Router();

// POST /reviews — submit a review (authenticated)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const user = req.user!;

    const { eventId, ratings, title, content } = req.body;

    if (!eventId || !ratings || typeof ratings.overall !== "number") {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate that the user actually booked and attended this event
    const { data: bookings, error: bookingErr } = await supabase
      .from("bookings")
      .select("id")
      .eq("event_id", eventId)
      .eq("attendee_id", user.id)
      .eq("status", "confirmed")
      .limit(1);

    if (bookingErr || !bookings || bookings.length === 0) {
      return res.status(403).json({ error: "You must have attended this event to leave a review." });
    }

    // Check if the user already reviewed this event
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("event_id", eventId)
      .eq("reviewer_id", user.id)
      .single();

    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this event." });
    }

    // Insert the review
    const { data: review, error: insertError } = await supabase
      .from("reviews")
      .insert({
        event_id: eventId,
        reviewer_id: user.id,
        ratings: ratings,
        title: title || "",
        content: content || "",
        status: "approved",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return res.json({ success: true, review });
  } catch (error: any) {
    console.error("Submit review error:", error);
    return res.status(500).json({ error: error.message || "Failed to submit review" });
  }
});

// GET /reviews?eventId=... — fetch reviews for an event (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const eventId = req.query.eventId as string;

    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const supabase = req.token ? createAuthClient(req.token) : supabasePublic;

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        *,
        reviewer:profiles!reviewer_id(name, avatar)
      `)
      .eq("event_id", eventId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ reviews });
  } catch (error: any) {
    console.error("Fetch reviews error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch reviews" });
  }
});

export default router;

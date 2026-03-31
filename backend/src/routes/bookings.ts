import { Router, Request, Response } from "express";
import { createAuthClient } from "../supabaseClient";
import { requireAuth } from "../middleware/auth";

const router = Router();

// POST /bookings — create a new booking
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const user = req.user!;

    const { eventId, tickets, totalAmount } = req.body;

    if (!eventId || !tickets || tickets.length === 0 || totalAmount === undefined) {
      return res.status(400).json({ error: "Invalid booking data" });
    }

    // Create the booking record in 'pending' status
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        event_id: eventId,
        attendee_id: user.id,
        tickets: tickets,
        total_amount: totalAmount,
        final_amount: totalAmount,
        status: "pending",
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Create a pending payment record associated with this booking
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id: booking.id,
        payer_id: user.id,
        amount: totalAmount,
        net_amount: totalAmount,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    return res.json({ booking, payment });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /bookings — fetch user's bookings
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const user = req.user!;

    const role = (req.query.role as string) || "attendee";

    let query = supabase
      .from("bookings")
      .select(`
        *,
        event:events(id, title, date_time, venue, media, organizer_id),
        attendee:profiles!attendee_id(name, email)
      `)
      .order("created_at", { ascending: false });

    if (role === "organizer") {
      query = query.eq("event.organizer_id", user.id);
    } else {
      query = query.eq("attendee_id", user.id);
    }

    const { data: bookings, error } = await query;
    if (error) throw error;

    const validBookings = role === "organizer"
      ? bookings.filter((b: any) => b.event !== null)
      : bookings;

    return res.json({ bookings: validBookings });
  } catch (error: any) {
    console.error("Fetch bookings error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /bookings/check-in — check in an attendee
router.post("/check-in", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const user = req.user!;

    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Check-in code is required" });
    }

    // Find the booking by the check-in code
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*, event:events(organizer_id, title)")
      .contains("check_in", { code: code.trim().toUpperCase() })
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: "Invalid check-in code or booking not found" });
    }

    // Validate the user scanning is the organizer or an admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (booking.event?.organizer_id !== user.id && profile?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized to check-in this event" });
    }

    // Check if already scanned
    if (booking.check_in?.scanned) {
      return res.status(400).json({
        error: "Already checked in",
        scannedAt: booking.check_in.scannedAt,
      });
    }

    // Check if payment is confirmed
    if (booking.status !== "confirmed") {
      return res.status(400).json({ error: `Booking status is ${booking.status}` });
    }

    // Update the booking to mark as scanned
    const updatedCheckIn = {
      ...booking.check_in,
      scanned: true,
      scannedAt: new Date().toISOString(),
      scannedBy: user.id,
    };

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ check_in: updatedCheckIn })
      .eq("id", booking.id);

    if (updateError) throw updateError;

    return res.json({
      success: true,
      message: "Check-in successful",
      attendeeId: booking.attendee_id,
      tickets: booking.tickets,
      eventTitle: booking.event?.title,
    });
  } catch (error: any) {
    console.error("Check-in error:", error);
    return res.status(500).json({ error: error.message || "An unexpected error occurred" });
  }
});

// GET /bookings/:id — get a single booking by ID
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const { id } = req.params;

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        *,
        event:events!event_id(id, title, date_time, venue, media)
      `)
      .eq("id", id)
      .single();

    if (error || !booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    return res.json({ booking });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

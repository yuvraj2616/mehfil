import { Router, Request, Response } from "express";
import { createAuthClient, supabasePublic } from "../supabaseClient";

const router = Router();

/**
 * POST /interactions
 * Log a user interaction (view, book, save, share).
 * Works for both authenticated and anonymous users.
 * 
 * Body: { eventId, action, metadata? }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { eventId, action, metadata = {} } = req.body;

    if (!eventId || !action) {
      return res.status(400).json({ error: "eventId and action are required" });
    }

    const validActions = ["view", "book", "search", "share", "save"];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `action must be one of: ${validActions.join(", ")}` });
    }

    // Use auth client if user is logged in, else public client
    const supabase = req.token ? createAuthClient(req.token) : supabasePublic;
    const userId = req.user?.id || null;

    const { error } = await supabase
      .from("interaction_logs")
      .insert({
        user_id: userId,
        event_id: eventId,
        action,
        metadata,
      });

    if (error) throw error;

    return res.json({ success: true });
  } catch (error: any) {
    // Silently fail — don't break the user experience for tracking failures
    console.warn("Interaction log error:", error.message);
    return res.json({ success: false });
  }
});

export default router;

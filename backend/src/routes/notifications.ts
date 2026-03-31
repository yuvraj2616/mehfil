import { Router, Request, Response } from "express";
import { createAuthClient } from "../supabaseClient";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * GET /notifications
 * Fetch all notifications for the authenticated user
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const user = req.user!;
    const limit = parseInt((req.query.limit as string) || "50");

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Also fetch unread count fast
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    return res.json({ notifications: data || [], unreadCount: count || 0 });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /notifications/:id/read
 * Mark a specific notification as read
 */
router.put("/:id/read", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const { id } = req.params;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", req.user!.id); // safety check built-in to RLS, but explicit here too

    if (error) throw error;
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /notifications/read-all
 * Mark all notifications as read for current user
 */
router.put("/read-all", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", req.user!.id)
      .eq("is_read", false);

    if (error) throw error;
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

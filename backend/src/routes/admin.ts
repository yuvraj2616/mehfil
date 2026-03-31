import { Router, Request, Response } from "express";
import { createAuthClient } from "../supabaseClient";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /admin/stats — get platform-wide stats (admin only)
router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const user = req.user!;

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Fetch metrics in parallel
    const [
      { count: usersCount },
      { count: eventsCount },
      { data: payments },
      { count: reviewsCount },
      { data: recentUsers },
      { data: recentEvents },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("payments").select("amount").eq("status", "completed"),
      supabase.from("reviews").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("name, email, role, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("events").select("id, title, status, created_at").order("created_at", { ascending: false }).limit(5),
    ]);

    const grossVolume = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

    return res.json({
      usersCount: usersCount || 0,
      eventsCount: eventsCount || 0,
      grossVolume,
      reviewsCount: reviewsCount || 0,
      recentUsers: recentUsers || [],
      recentEvents: recentEvents || [],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

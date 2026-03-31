import { Router, Request, Response } from "express";
import { createAuthClient, supabasePublic } from "../supabaseClient";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /events — list events with filters (public)
router.get("/", async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const city = req.query.city as string | undefined;
  const status = (req.query.status as string) || "published";
  const search = req.query.search as string | undefined;
  const featured = req.query.is_featured as string | undefined;
  const page = parseInt((req.query.page as string) || "1");
  const limit = parseInt((req.query.limit as string) || "12");
  const offset = (page - 1) * limit;

  // Use the user's token if present, otherwise public client
  const supabase = req.token ? createAuthClient(req.token) : supabasePublic;

  let query = supabase
    .from("events")
    .select("*, organizer:profiles!organizer_id(user_id, name, avatar, role)", { count: "exact" })
    .eq("status", status)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (city) {
    query = query.contains("venue", { city });
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (featured === "true") {
    query = query.eq("is_featured", true);
  }

  const { data, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({
    events: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
});

// GET /events/trending — top trending events by recent activity score (public)
// IMPORTANT: This route MUST be defined before GET /events/:id to avoid :id matching "trending"
router.get("/trending", async (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) || "8");
  const supabase = req.token ? createAuthClient(req.token) : supabasePublic;

  try {
    // Get interaction counts over last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: interactions } = await supabase
      .from("interaction_logs")
      .select("event_id, action")
      .gte("created_at", sevenDaysAgo);

    // Score: bookings=3, reviews=2, views=1, shares/saves=1.5
    const actionWeights: Record<string, number> = {
      book: 3,
      view: 1,
      save: 1.5,
      share: 1.5,
      search: 0.5,
    };

    const eventScores: Record<string, number> = {};
    (interactions || []).forEach((log: any) => {
      if (!log.event_id) return;
      const weight = actionWeights[log.action] || 0;
      eventScores[log.event_id] = (eventScores[log.event_id] || 0) + weight;
    });

    // Also factor in review_count from events table
    const topEventIds = Object.entries(eventScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit * 2) // Fetch extra to account for filtering
      .map(([id]) => id);

    let trendingEvents: any[] = [];

    if (topEventIds.length > 0) {
      const { data: events } = await supabase
        .from("events")
        .select("*, organizer:profiles!organizer_id(user_id, name, avatar, role)")
        .eq("status", "published")
        .in("id", topEventIds)
        .limit(limit);

      // Re-sort by our computed score to preserve ranking
      trendingEvents = (events || [])
        .map((e: any) => ({ ...e, trending_score: eventScores[e.id] || 0 }))
        .sort((a: any, b: any) => b.trending_score - a.trending_score)
        .slice(0, limit);
    }

    // Fallback: if no trending data yet, return featured/recent events
    if (trendingEvents.length < limit) {
      const { data: fallback } = await supabase
        .from("events")
        .select("*, organizer:profiles!organizer_id(user_id, name, avatar, role)")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(limit - trendingEvents.length);

      const existingIds = new Set(trendingEvents.map((e: any) => e.id));
      const uniqueFallback = (fallback || [])
        .filter((e: any) => !existingIds.has(e.id))
        .map((e: any) => ({ ...e, trending_score: 0 }));
      trendingEvents = [...trendingEvents, ...uniqueFallback];
    }

    return res.json({ events: trendingEvents, total: trendingEvents.length });
  } catch (error: any) {
    console.error("Trending events error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /events/:id — get single event (public)

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const supabase = req.token ? createAuthClient(req.token) : supabasePublic;

  const { data, error } = await supabase
    .from("events")
    .select("*, organizer:profiles!organizer_id(user_id, name, avatar, bio, role)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Event not found" });
  }

  return res.json({ event: data });
});

// POST /events — create event (organizer/admin only)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const supabase = createAuthClient(req.token!);
  const user = req.user!;

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || !["organizer", "admin"].includes(profile.role)) {
    return res.status(403).json({ error: "Only organizers and admins can create events" });
  }

  const body = req.body;

  const { data, error } = await supabase
    .from("events")
    .insert({
      organizer_id: user.id,
      title: body.title,
      description: body.description || "",
      category: body.category || "cultural",
      tags: body.tags || [],
      date_time: body.date_time || {},
      venue: body.venue || {},
      artists: body.artists || [],
      ticketing: body.ticketing || [],
      media: body.media || {},
      status: body.status || "draft",
      is_featured: body.is_featured || false,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ event: data });
});

// PUT /events/:id — update event (owner or admin)
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const supabase = createAuthClient(req.token!);
  const user = req.user!;

  const { data: event } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", id)
    .single();

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (event.organizer_id !== user.id && profile?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { data: updated, error } = await supabase
    .from("events")
    .update(req.body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ event: updated });
});

// DELETE /events/:id — delete event (owner or admin)
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const supabase = createAuthClient(req.token!);
  const user = req.user!;

  const { data: event } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", id)
    .single();

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (event.organizer_id !== user.id && profile?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: "Event deleted" });
});

export default router;

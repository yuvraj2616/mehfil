import { Router, Request, Response } from "express";
import { createAuthClient } from "../supabaseClient";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * GET /recommendations
 * Returns a list of personalized events for the authenticated user.
 *
 * Algorithm (Content-Based Filtering):
 * 1. Analyze user's booking history → find top categories & cities
 * 2. Analyze user's view history → boost secondary category signals
 * 3. Query upcoming published events not yet booked by user
 * 4. Score each event:
 *    - +40 pts  → matches top booked category
 *    - +25 pts  → matches secondary category
 *    - +25 pts  → matches user's city
 *    - +10 pts  → boosted by high avg_rating (≥ 4.0)
 *    - +0-10 pts → recency bonus (events in next 30 days)
 * 5. Sort by score DESC, return top 8
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const user = req.user!;
    const limit = parseInt((req.query.limit as string) || "8");

    // --- Step 1: Get user's booking history ---
    const { data: bookings } = await supabase
      .from("bookings")
      .select("event:events(id, category, venue)")
      .eq("attendee_id", user.id)
      .eq("status", "confirmed");

    const bookedEventIds = new Set<string>();
    const categoryCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};

    (bookings || []).forEach((b: any) => {
      const event = b.event;
      if (!event) return;
      bookedEventIds.add(event.id);
      if (event.category) {
        categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 3; // bookings weigh more
      }
      const city = event.venue?.city;
      if (city) {
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
    });

    // --- Step 2: Get user's view history ---
    const { data: viewLogs } = await supabase
      .from("interaction_logs")
      .select("event:events(id, category, venue)")
      .eq("user_id", user.id)
      .eq("action", "view")
      .order("created_at", { ascending: false })
      .limit(50);

    (viewLogs || []).forEach((log: any) => {
      const event = log.event;
      if (!event) return;
      if (event.category) {
        categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
      }
      const city = event.venue?.city;
      if (city) {
        cityCounts[city] = (cityCounts[city] || 0) + 0.5;
      }
    });

    // --- Step 3: Get user's profile for city preference ---
    const { data: profile } = await supabase
      .from("profiles")
      .select("city")
      .eq("user_id", user.id)
      .single();

    if (profile?.city) {
      cityCounts[profile.city] = (cityCounts[profile.city] || 0) + 2;
    }

    // --- Step 4: Determine top preferences ---
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    const topCategory = sortedCategories[0] || null;
    const secondaryCategories = sortedCategories.slice(1, 4);

    const sortedCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([city]) => city);

    const topCities = sortedCities.slice(0, 3);

    // --- Step 5: Fetch candidate events ---
    const now = new Date().toISOString();

    // Fetch more than needed so we have enough to score and filter
    const { data: candidateEvents } = await supabase
      .from("events")
      .select("id, title, description, category, date_time, venue, ticketing, media, avg_rating, review_count, organizer:profiles!organizer_id(name, avatar)")
      .eq("status", "published")
      .gt("date_time->>'start'", now)  // Only upcoming events
      .limit(100);

    const events = candidateEvents || [];

    // --- Step 6: Score each event ---
    const scored = events
      .filter((e: any) => !bookedEventIds.has(e.id)) // Exclude already booked
      .map((event: any) => {
        let score = 0;

        // Category match
        if (topCategory && event.category === topCategory) {
          score += 40;
        } else if (secondaryCategories.includes(event.category)) {
          score += 25;
        }

        // City match
        const eventCity = event.venue?.city;
        if (eventCity) {
          if (topCities[0] && eventCity.toLowerCase() === topCities[0].toLowerCase()) {
            score += 25;
          } else if (topCities.some((c) => c.toLowerCase() === eventCity.toLowerCase())) {
            score += 12;
          }
        }

        // Rating bonus
        const rating = event.avg_rating || 0;
        if (rating >= 4.5) score += 10;
        else if (rating >= 4.0) score += 5;

        // Recency bonus: events happening within next 30 days
        const startDate = event.date_time?.start ? new Date(event.date_time.start) : null;
        if (startDate) {
          const daysUntil = (startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          if (daysUntil >= 0 && daysUntil <= 30) {
            score += Math.round((30 - daysUntil) / 30 * 10); // Max +10 for events happening very soon
          }
        }

        return { ...event, _score: score };
      })
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, limit);

    // If user has no history yet, fall back to featured/recent events
    const results = scored.length > 0 ? scored : events.slice(0, limit).map((e: any) => ({ ...e, _score: 0 }));

    return res.json({
      recommendations: results,
      meta: {
        topCategory,
        topCities,
        basedOn: bookings?.length ? "history" : "popular",
        totalCandidates: events.length,
      },
    });
  } catch (error: any) {
    console.error("Recommendations error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;

"use client";

/**
 * RecommendedEvents Component
 *
 * Fetches personalized event recommendations from the AI engine
 * and displays them in a horizontal scrollable carousel.
 * Also logs a 'view' interaction when a user clicks an event.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Calendar, MapPin, IndianRupee, Loader2, ChevronRight } from "lucide-react";
import clientApi from "@/lib/client-api";

interface RecommendedEventsProps {
  userId: string;
}

export function RecommendedEvents({ userId }: RecommendedEventsProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const data = await clientApi.get("/recommendations?limit=8");
        setEvents(data?.recommendations || []);
        setMeta(data?.meta || null);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId]);

  // Log a view interaction when the user clicks a recommendation
  async function logView(eventId: string) {
    try {
      await clientApi.post("/interactions", { eventId, action: "view" });
    } catch {
      // Silently fail — never block navigation
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#FF007A]" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">AI Picks For You</p>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-56 shrink-0 bg-white/5 rounded-2xl h-52 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return null; // Don't show section if no recommendations
  }

  const basedOnLabel = meta?.basedOn === "history"
    ? meta?.topCategory
      ? `Based on your love of ${meta.topCategory}`
      : "Based on your activity"
    : "Popular right now";

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#FF007A]/10 border border-[#FF007A]/20">
            <Sparkles className="h-4 w-4 text-[#FF007A]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              AI Picks For You
            </p>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mt-0.5">
              {basedOnLabel}
            </p>
          </div>
        </div>
        <Link
          href="/events"
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#FF007A] hover:text-white transition-colors"
        >
          View All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Horizontal Scroll Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
        {events.map((event) => {
          const lowestPrice = event.ticketing?.length
            ? Math.min(...event.ticketing.map((t: any) => t.price))
            : null;
          const startDate = event.date_time?.start
            ? new Date(event.date_time.start).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : "TBA";

          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              onClick={() => logView(event.id)}
              className="block group shrink-0 w-52"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#FF007A]/40 hover:shadow-[0_0_20px_rgba(255,0,122,0.15)] transition-all duration-300 hover:-translate-y-1 h-full">
                {/* Image */}
                <div className="relative h-28 bg-[#0A0D15] overflow-hidden">
                  {event.media?.banner ? (
                    <img
                      src={event.media.banner}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FF007A]/20 to-[#00D4FF]/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                  {/* AI Score indicator */}
                  {event._score > 0 && (
                    <div className="absolute top-2 right-2 bg-[#FF007A] text-black text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      ✦ Match
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h4 className="font-black text-sm uppercase tracking-tight line-clamp-1 text-white group-hover:text-[#FF007A] transition-colors mb-2">
                    {event.title}
                  </h4>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <Calendar className="h-2.5 w-2.5 text-[#FF007A] shrink-0" />
                      <span>{startDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <MapPin className="h-2.5 w-2.5 text-[#FF007A] shrink-0" />
                      <span className="truncate">{event.venue?.city || "TBA"}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-sm font-black text-white">
                      <IndianRupee className="h-3 w-3 text-gray-500" />
                      {lowestPrice !== null ? lowestPrice.toLocaleString("en-IN") : "Free"}
                    </div>
                    {event.avg_rating > 0 && (
                      <span className="text-[9px] font-black text-amber-400">
                        ★ {Number(event.avg_rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

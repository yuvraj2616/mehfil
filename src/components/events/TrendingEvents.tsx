"use client";

/**
 * TrendingEvents Component
 *
 * Displays a horizontally-scrollable carousel of trending events
 * based on real activity scores from the last 7 days.
 * Falls back to featured events if no interaction data exists yet.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  MapPin,
  IndianRupee,
  Flame,
  ChevronRight,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const categoryColors: Record<string, string> = {
  poetry: "text-purple-400",
  music: "text-[#FF007A]",
  dance: "text-rose-400",
  theater: "text-blue-400",
  comedy: "text-emerald-400",
  literary: "text-indigo-400",
  cultural: "text-orange-400",
};

export function TrendingEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/events/trending?limit=8`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-12 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Flame className="h-5 w-5 text-orange-400 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Trending Now
            </p>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-64 shrink-0 h-64 bg-[#0A0D15] rounded-2xl border border-gray-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) return null;

  return (
    <section className="py-12 border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-0.5">
                Trending Now
              </p>
              <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">
                Most active in the last 7 days
              </p>
            </div>
          </div>
          <Link
            href="/events"
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-400 hover:text-white transition-colors group"
          >
            Explore All
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Horizontal carousel */}
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
          {events.map((event, index) => {
            const lowestPrice = event.ticketing?.length
              ? Math.min(...event.ticketing.map((t: any) => t.price))
              : null;
            const startDate = event.date_time?.start
              ? new Date(event.date_time.start).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })
              : "TBA";
            const catColor = categoryColors[event.category] || "text-gray-400";

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block group shrink-0 w-64"
              >
                <div className="bg-[#0A0D15] border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-400/40 hover:shadow-[0_0_25px_rgba(251,146,60,0.15)] transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-36 bg-[#151515] overflow-hidden">
                    {event.media?.banner ? (
                      <img
                        src={event.media.banner}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-500/10 to-[#FF007A]/10" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D15] via-transparent to-transparent" />

                    {/* Rank badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-black px-2 py-1 rounded-full border ${
                          index === 0
                            ? "bg-orange-400 text-black border-0"
                            : index === 1
                            ? "bg-gray-200 text-black border-0"
                            : index === 2
                            ? "bg-amber-700/80 text-white border-0"
                            : "bg-black/60 text-gray-300 border-gray-700 backdrop-blur-sm"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      {event.trending_score > 0 && (
                        <span className="flex items-center gap-0.5 text-[8px] font-black text-orange-400 bg-orange-400/10 border border-orange-400/20 px-1.5 py-0.5 rounded-full">
                          <TrendingUp className="h-2 w-2" />
                          {Math.round(event.trending_score)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col flex-grow">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${catColor} mb-2`}>
                      {event.category}
                    </span>

                    <h4 className="font-black text-sm uppercase tracking-tight line-clamp-2 text-white group-hover:text-orange-400 transition-colors leading-tight mb-3">
                      {event.title}
                    </h4>

                    <div className="space-y-1.5 mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <Calendar className="h-2.5 w-2.5 text-orange-400 shrink-0" />
                        <span>{startDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <MapPin className="h-2.5 w-2.5 text-orange-400 shrink-0" />
                        <span className="truncate">{event.venue?.city || "TBA"}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-0.5 text-sm font-black text-white">
                        <IndianRupee className="h-3 w-3 text-gray-500" />
                        {lowestPrice !== null
                          ? lowestPrice.toLocaleString("en-IN")
                          : "Free"}
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
    </section>
  );
}

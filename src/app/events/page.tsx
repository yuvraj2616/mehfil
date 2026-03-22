"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Calendar,
  IndianRupee,
  Sparkles,
  Music,
  Mic2,
  Drama,
  BookOpen,
  Laugh,
  Palette,
  Heart,
  Filter,
} from "lucide-react";

const categories = [
  { value: "all", label: "All Events", icon: <Sparkles className="h-4 w-4" /> },
  { value: "poetry", label: "Poetry", icon: <BookOpen className="h-4 w-4" /> },
  { value: "music", label: "Music", icon: <Music className="h-4 w-4" /> },
  { value: "dance", label: "Dance", icon: <Heart className="h-4 w-4" /> },
  { value: "theater", label: "Theater", icon: <Drama className="h-4 w-4" /> },
  { value: "comedy", label: "Comedy", icon: <Laugh className="h-4 w-4" /> },
  { value: "literary", label: "Literary", icon: <Mic2 className="h-4 w-4" /> },
  { value: "cultural", label: "Cultural", icon: <Palette className="h-4 w-4" /> },
];

const categoryColors: Record<string, string> = {
  poetry: "bg-purple-900/30 text-purple-400 border-purple-500/20",
  music: "bg-primary/20 text-primary border-primary/30",
  dance: "bg-rose-900/30 text-rose-400 border-rose-500/20",
  theater: "bg-blue-900/30 text-blue-400 border-blue-500/20",
  comedy: "bg-emerald-900/30 text-emerald-400 border-emerald-500/20",
  literary: "bg-indigo-900/30 text-indigo-400 border-indigo-500/20",
  cultural: "bg-orange-900/30 text-orange-400 border-orange-500/20",
};

interface EventData {
  id: string;
  title: string;
  description: string;
  category: string;
  date_time: { start?: string; end?: string };
  venue: { name?: string; city?: string; address?: string; capacity?: number };
  ticketing: Array<{ name: string; price: number; quantity: number }>;
  media: { banner?: string };
  status: string;
  is_featured: boolean;
  created_at: string;
  organizer: { user_id: string; name: string; avatar: string; role: string };
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (city) params.set("city", city);
    if (search) params.set("search", search);
    params.set("page", page.toString());
    params.set("limit", "12");

    try {
      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      setEvents(data.events || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setEvents([]);
    }
    setLoading(false);
  }, [category, city, search, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function getLowestPrice(ticketing: EventData["ticketing"]) {
    if (!ticketing || ticketing.length === 0) return null;
    return Math.min(...ticketing.map((t) => t.price));
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "TBA";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-20">
      {/* Header */}
      <section className="bg-black border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10 block sm:flex justify-between items-end">
            <div>
              <h4 className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase mb-4">[Directory]</h4>
              <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tight leading-none">
                Explore <br />
                <span className="font-cursive text-primary text-6xl sm:text-8xl lowercase block -mt-2">shows</span>
              </h1>
            </div>
            <p className="text-gray-400 text-sm font-bold tracking-widest uppercase mt-6 sm:mt-0 max-w-xs text-left sm:text-right">
              Discover poetry, music, dance, and more happening right now
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search artists, venues, or events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 bg-[#0A0D15] border-gray-800 h-14 text-base focus-visible:ring-primary/50 text-white placeholder:text-gray-600 rounded-none border-b-2 border-b-gray-800 focus-visible:border-b-primary"
              />
            </div>
            <Select value={city || undefined} onValueChange={(v) => { setCity(v === "all-cities" ? "" : (v ?? "")); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-64 h-14 bg-[#0A0D15] border-gray-800 rounded-none border-b-2 text-white data-[state=open]:border-b-primary">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <SelectValue placeholder="All Cities" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#0A0D15] border-gray-800 text-white">
                <SelectItem value="all-cities" className="focus:bg-[#111] focus:text-white cursor-pointer py-3">Global (All Cities)</SelectItem>
                <SelectItem value="Delhi" className="focus:bg-[#111] focus:text-white cursor-pointer py-3">Delhi</SelectItem>
                <SelectItem value="Mumbai" className="focus:bg-[#111] focus:text-white cursor-pointer py-3">Mumbai</SelectItem>
                <SelectItem value="Jaipur" className="focus:bg-[#111] focus:text-white cursor-pointer py-3">Jaipur</SelectItem>
                <SelectItem value="Lucknow" className="focus:bg-[#111] focus:text-white cursor-pointer py-3">Lucknow</SelectItem>
                <SelectItem value="Kolkata" className="focus:bg-[#111] focus:text-white cursor-pointer py-3">Kolkata</SelectItem>
                <SelectItem value="Bangalore" className="focus:bg-[#111] focus:text-white cursor-pointer py-3">Bangalore</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Category Chips */}
      <section className="bg-[#0A0D15] border-b border-gray-800 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setCategory(cat.value); setPage(1); }}
                className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all rounded-full ${
                  category === cat.value
                    ? "bg-primary text-black shadow-[0_0_15px_rgba(255,0,122,0.4)]"
                    : "bg-[#050505] text-gray-400 hover:text-white hover:bg-[#111] border border-gray-800"
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Results header */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
            {loading ? "[ scanning network ]" : `[ ${total} EVENT${total !== 1 ? "S" : ""} FOUND ]`}
          </p>
          {total > 0 && (
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
              PAGE {page} OF {totalPages}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-[#0A0D15] border-gray-800 overflow-hidden rounded-xl">
                <div className="h-48 bg-[#111] animate-pulse" />
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 bg-[#111] animate-pulse rounded w-1/3" />
                  <div className="h-6 bg-[#111] animate-pulse rounded w-2/3" />
                  <div className="h-4 bg-[#111] animate-pulse rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-[#0A0D15] border border-gray-800 rounded-2xl">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-8 border border-primary/20">
              <Filter className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-wider mb-4">No events found</h3>
            <p className="text-gray-400 mb-8 max-w-md font-medium">
              Try adjusting your filters or search terms. The network is constantly updating.
            </p>
            <Button
              variant="outline"
              onClick={() => { setSearch(""); setCategory("all"); setCity(""); setPage(1); }}
              className="border-gray-700 hover:border-primary hover:bg-primary/10 text-white rounded-full px-8 py-6 text-xs uppercase tracking-[0.2em] font-bold transition-colors"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Event Grid */}
        {!loading && events.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => {
                const price = getLowestPrice(event.ticketing);
                return (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="bg-[#0A0D15] border-gray-800 overflow-hidden group hover:border-primary/50 transition-all duration-300 rounded-xl flex flex-col h-full bg-gradient-to-b from-transparent to-[#050505]/50 hover:shadow-[0_0_30px_rgba(255,0,122,0.1)]">
                      {/* Image */}
                      <div className="relative h-48 bg-[#151515] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                        {event.media?.banner ? (
                          <img
                            src={event.media.banner}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800')] bg-cover bg-center" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D15] via-transparent to-transparent" />
                        
                        {event.is_featured && (
                          <Badge className="absolute top-4 left-4 bg-primary text-black font-black uppercase tracking-widest text-[9px] px-3 py-1 border-0">
                            ★ Featured
                          </Badge>
                        )}
                        <Badge
                          className={`absolute top-4 right-4 capitalize font-bold text-[9px] tracking-widest px-3 py-1 border ${categoryColors[event.category] || categoryColors.cultural}`}
                        >
                          {event.category}
                        </Badge>
                      </div>

                      <CardContent className="p-6 flex flex-col flex-grow">
                        <h3 className="font-black text-xl mb-3 group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight leading-tight">
                          {event.title}
                        </h3>

                        <div className="space-y-2 mt-auto text-xs font-bold tracking-widest uppercase text-gray-500 mb-6">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span>{formatDate(event.date_time?.start)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span className="line-clamp-1">
                              {event.venue?.name ? `${event.venue.name}, ${event.venue.city || ""}` : "Venue TBA"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                          <div className="flex items-center gap-1 font-black text-white text-lg">
                            <IndianRupee className="h-4 w-4" />
                            {price !== null ? price.toLocaleString("en-IN") : "Free"}
                          </div>
                          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-600 truncate max-w-[100px] text-right">
                            {event.organizer?.name || "Organizer"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16 pb-10">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="bg-[#0A0D15] border-gray-800 hover:bg-primary text-white hover:text-black rounded-full px-6 py-5 text-[10px] uppercase font-bold tracking-widest transition-colors"
                >
                  Prev
                </Button>
                <div className="bg-[#0A0D15] border border-gray-800 rounded-full px-6 py-3">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">
                    <span className="text-white">{page}</span> / {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="bg-[#0A0D15] border-gray-800 hover:bg-primary text-white hover:text-black rounded-full px-6 py-5 text-[10px] uppercase font-bold tracking-widest transition-colors"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

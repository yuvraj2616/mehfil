"use client";

/**
 * EventReviews Component (Enhanced)
 *
 * - Fetches reviews via clientApi (auth-aware)
 * - Shows avg rating breakdown with animated bars per star level
 * - Renders ReviewCards with our new dark theme
 * - Inline review submission form for confirmed attendees
 * - Handles loading, empty, and error states
 */

import { useState, useEffect } from "react";
import { Star, PenLine, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/ui/StarRating";
import { ReviewCard } from "@/components/events/ReviewCard";
import clientApi from "@/lib/client-api";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

interface EventReviewsProps {
  eventId: string;
}

export function EventReviews({ eventId }: EventReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews + auth state on mount
  useEffect(() => {
    async function init() {
      // Check auth
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      // Fetch reviews (public endpoint, no auth needed)
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${API_BASE}/reviews?eventId=${eventId}`);
        const data = await res.json();
        setReviews(data?.reviews || []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [eventId]);

  // Derived stats
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.ratings?.overall ?? 0), 0) / reviews.length
    : 0;

  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.ratings?.overall ?? 0) === star).length,
    pct: reviews.length
      ? (reviews.filter((r) => Math.round(r.ratings?.overall ?? 0) === star).length /
          reviews.length) *
        100
      : 0,
  }));

  // Submit a new review
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    setSubmitting(true);
    try {
      const data = await clientApi.post("/reviews", {
        eventId,
        ratings: { overall: rating },
        title,
        content,
      });

      if (data?.review) {
        setReviews((prev) => [data.review, ...prev]);
        setShowForm(false);
        setRating(0);
        setTitle("");
        setContent("");
        toast.success("Review submitted! Thank you for your feedback.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Loading feedback matrix...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header row with Write Review button */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </p>
        {isLoggedIn && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className="border-amber-400/40 text-amber-400 hover:bg-amber-400/10 rounded-full px-5 h-9 text-[10px] font-black uppercase tracking-widest gap-2"
          >
            <PenLine className="h-3.5 w-3.5" />
            Write Review
          </Button>
        )}
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Big avg score */}
          <div className="shrink-0 text-center">
            <p className="text-5xl font-black text-amber-400 tabular-nums">
              {avgRating.toFixed(1)}
            </p>
            <StarRating value={Math.round(avgRating)} readOnly size="sm" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
              Overall
            </p>
          </div>

          {/* Bar breakdown */}
          <div className="flex-1 min-w-0 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 space-y-2 w-full">
            {starCounts.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-gray-500 w-4 shrink-0">
                  {star}
                </span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-600 w-3 shrink-0 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-amber-400/20 rounded-2xl p-6 space-y-5 relative"
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400/80 to-transparent rounded-t-2xl" />

          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
              [ Submit Feedback ]
            </p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Star picker */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Rating *
            </p>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Title
            </p>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="In one line, sum up the experience..."
              className="bg-[#050505] border-gray-800 focus-visible:ring-amber-400/30 text-white h-12"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Your Experience
            </p>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell the community what made this event unforgettable (or not)..."
              className="bg-[#050505] border-gray-800 focus-visible:ring-amber-400/30 text-white min-h-[120px] resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-widest text-xs h-12 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-transform hover:scale-[1.02] gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitting ? "Submitting..." : "Publish Review"}
          </Button>
        </form>
      )}

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/5 border border-white/10 rounded-2xl">
          <div className="p-5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-5">
            <Star className="h-8 w-8 text-amber-400/50" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
            No reviews yet
          </p>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider">
            {isLoggedIn
              ? "Attended this event? Share your experience above."
              : "Sign in to leave the first review."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

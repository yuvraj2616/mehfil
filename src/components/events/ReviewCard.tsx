"use client";

/**
 * ReviewCard Component
 * 
 * Displays a single review with author avatar, star rating,
 * title, content, and formatted date.
 */

import { StarRating } from "@/components/ui/StarRating";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: {
    id: string;
    title?: string;
    content?: string;
    ratings: { overall: number };
    created_at: string;
    reviewer?: {
      name?: string;
      avatar?: string;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.reviewer?.name?.[0]?.toUpperCase() || "A";
  const timeAgo = formatDistanceToNow(new Date(review.created_at), { addSuffix: true });
  const overallRating = review.ratings?.overall ?? 0;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 group relative overflow-hidden">
      {/* Accent glow top bar */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-400/40 via-amber-400/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {review.reviewer?.avatar ? (
            <img
              src={review.reviewer.avatar}
              alt={review.reviewer.name || "Reviewer"}
              className="h-10 w-10 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400/30 to-[#FF007A]/30 border border-white/10 flex items-center justify-center">
              <span className="text-sm font-black text-white">{initials}</span>
            </div>
          )}

          {/* Name + time */}
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-white">
              {review.reviewer?.name || "Anonymous"}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">
              {timeAgo}
            </p>
          </div>
        </div>

        {/* Rating */}
        <StarRating value={overallRating} readOnly size="sm" showValue />
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-black text-base uppercase tracking-tight text-white mb-2">
          {review.title}
        </h4>
      )}

      {/* Content */}
      {review.content && (
        <p className="text-sm text-gray-400 leading-relaxed font-medium">
          {review.content}
        </p>
      )}
    </div>
  );
}

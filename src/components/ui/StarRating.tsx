"use client";

/**
 * StarRating Component
 * 
 * Interactive star rating with hover preview and click-to-select.
 * Also works in read-only mode for displaying existing ratings.
 *
 * Usage:
 *   // Interactive (form input)
 *   <StarRating value={rating} onChange={setRating} />
 *
 *   // Read-only display
 *   <StarRating value={4.5} readOnly size="sm" />
 */

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  showValue?: boolean;
  totalStars?: number;
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
  showValue = false,
  totalStars = 5,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const iconClass = sizeMap[size];
  const activeValue = hovered || value;

  return (
    <div className="flex items-center gap-1">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => !readOnly && setHovered(0)}
      >
        {Array.from({ length: totalStars }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= activeValue;
          const isHalf = !isFilled && starValue - 0.5 <= activeValue;

          return (
            <button
              key={i}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onChange?.(starValue)}
              onMouseEnter={() => !readOnly && setHovered(starValue)}
              className={`transition-all duration-100 ${
                readOnly ? "cursor-default" : "cursor-pointer hover:scale-125"
              }`}
              aria-label={`Rate ${starValue} star${starValue !== 1 ? "s" : ""}`}
            >
              <Star
                className={`${iconClass} transition-colors duration-100 ${
                  isFilled
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]"
                    : isHalf
                    ? "fill-amber-400/50 text-amber-400"
                    : "fill-transparent text-gray-600 hover:text-amber-400/50"
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && value > 0 && (
        <span className="text-[10px] font-black tracking-widest text-amber-400 ml-1 uppercase tabular-nums">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, PenLine } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EventReviews({ eventId }: { eventId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?eventId=${eventId}`);
        if (res.ok) {
          const { reviews } = await res.json();
          setReviews(reviews || []);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="h-5 w-5" /> Loading reviews...
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 bg-muted/20 rounded-xl border border-border/40">
        <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <h4 className="font-medium text-lg">No reviews yet</h4>
        <p className="text-sm text-muted-foreground mb-4">Be the first to share your experience after attending!</p>
        <Link href={`/events/${eventId}/review`}>
          <Button variant="outline" className="gap-2">
            <PenLine className="h-4 w-4" />
            Write a Review
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate averages
  const avgOverall = (reviews.reduce((acc, r) => acc + r.ratings.overall, 0) / reviews.length).toFixed(1);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <Link href={`/events/${eventId}/review`}>
          <Button variant="outline" className="gap-2">
            <PenLine className="h-4 w-4" />
            Write a Review
          </Button>
        </Link>
      </div>

      {/* Summary Header */}
      <div className="flex items-center gap-6 p-6 bg-card border border-border/40 rounded-xl shadow-sm">
        <div className="text-center shrink-0">
          <div className="text-4xl font-black text-[#7B2FFF]">{avgOverall}</div>
          <div className="flex justify-center text-[#7B2FFF] my-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(avgOverall)) ? "fill-[#7B2FFF]" : "text-muted/30"}`} />
            ))}
          </div>
          <div className="text-xs text-muted-foreground">{reviews.length} review{reviews.length !== 1 && 's'}</div>
        </div>
        
        {/* Simple breakout dummy UI for visual richness */}
        <div className="hidden sm:block flex-1 border-l border-border/40 pl-6 space-y-2">
          {["5", "4", "3", "2", "1"].map((stars) => {
            const count = reviews.filter(r => r.ratings.overall === Number(stars)).length;
            const pct = (count / reviews.length) * 100;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-3 shrink-0 flex items-center">{stars} <Star className="h-3 w-3 ml-0.5 text-muted-foreground" /></span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#7B2FFF] rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-5 bg-background border border-border/50 rounded-xl">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border/50">
                  <AvatarImage src={review.reviewer?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-rose-600/20 text-amber-700">
                    {review.reviewer?.name?.substring(0, 2).toUpperCase() || "CN"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{review.reviewer?.name || "Anonymous User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("en-IN", { month: 'long', year: 'numeric', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex text-[#7B2FFF] gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= review.ratings.overall ? "fill-[#7B2FFF]" : "text-muted/30"}`} />
                ))}
              </div>
            </div>
            
            {review.title && <h5 className="font-semibold mb-1 text-foreground/90">{review.title}</h5>}
            {review.content && <p className="text-sm text-foreground/80 leading-relaxed">{review.content}</p>}
            
            {/* Sub-ratings */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-border/30">
              {['performance', 'venue', 'value'].map(cat => (
                 <div key={cat} className="flex flex-col gap-1 items-center bg-muted/30 px-3 py-1.5 rounded-md">
                   <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{cat}</span>
                   <div className="flex items-center text-xs font-medium">
                     <Star className="h-3 w-3 text-[#7B2FFF] fill-[#7B2FFF] mr-1" />
                     {review.ratings[cat]}
                   </div>
                 </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

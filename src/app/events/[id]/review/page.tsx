"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { fetchAPIClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Star, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function WriteReviewPage() {
  const { id: eventId } = useParams() as { id: string };
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useUser();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [ratings, setRatings] = useState({
    overall: 0,
    venue: 0,
    performance: 0,
    value: 0
  });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    async function init() {
      if (!eventId) return;
      const data = await fetchAPIClient(`/events/${eventId}`, null);
      if (data?.event) setEvent(data.event);
      setLoading(false);
    }
    init();
  }, [eventId]);

  const handleRatingChange = (category: keyof typeof ratings, star: number) => {
    setRatings(prev => ({ ...prev, [category]: star }));
  };

  const StarRating = ({ category, label }: { category: keyof typeof ratings, label: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-800 last:border-0 border-dashed">
      <Label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">{label}</Label>
      <div className="flex gap-2 mt-3 sm:mt-0">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-125"
            onClick={() => handleRatingChange(category, star)}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= ratings[category] 
                  ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(255,0,122,0.8)]" 
                  : "text-gray-800 hover:text-primary/40"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Authentication required.");
      return;
    }

    if (ratings.overall === 0) {
      toast.error("Core rating required to deploy.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || null;

      const data = await fetchAPIClient("/reviews", token, {
        method: "POST",
        body: JSON.stringify({
          eventId,
          ratings,
          title,
          content
        })
      });

      if (data?.error) throw new Error(data.error);

      toast.success("Telemetry received. Thank you.");
      router.push(`/events/${eventId}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || userLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-[#050505]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!event || !user) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center bg-[#050505] text-white p-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-8 border border-primary/20">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-wider mb-4">Target Not Found</h2>
        <p className="text-gray-400 mb-8 font-medium">Event missing or invalid authorization.</p>
        <Button onClick={() => router.push("/dashboard/attendee")} className="border-gray-800 text-white hover:bg-white hover:text-black rounded-full px-8 py-6 text-xs uppercase tracking-widest font-bold" variant="outline">Abort Sequence</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-4 relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none" />

      <div className="container max-w-2xl mx-auto relative z-10">
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-white mb-10 transition-colors border border-gray-800 px-4 py-2 rounded-full bg-[#050505]"
        >
          <ArrowLeft className="h-3 w-3" /> Event Core
        </Link>
        
        <div className="mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-8">Transmit <span className="text-primary font-cursive text-6xl lowercase align-middle">experience</span></h1>
          
          <div className="flex items-center gap-6 p-6 rounded-2xl bg-[#0A0D15] border border-gray-800 shadow-xl shadow-primary/5">
             <div className="w-20 h-20 rounded-xl bg-[#111] overflow-hidden shrink-0 border border-gray-800">
              {event.media?.banner ? (
                <img src={event.media.banner} className="w-full h-full object-cover grayscale opacity-80" alt="Event" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
              )}
            </div>
            <div>
              <h3 className="font-black text-xl uppercase tracking-tighter italic">{event.title}</h3>
              <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mt-2">
                 {event.date_time?.start ? new Date(event.date_time.start).toLocaleDateString("en-IN") : "Date TBD"}
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-[#0A0D15] border-gray-800 shadow-2xl overflow-hidden rounded-3xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-600 to-primary" />
          <form onSubmit={handleSubmit}>
            <CardContent className="p-8 sm:p-12 space-y-10">
              
              <div className="bg-[#050505] rounded-2xl p-6 sm:p-8 border border-gray-800">
                <StarRating category="overall" label="Core Experience [Req]" />
                <StarRating category="performance" label="Sonic / Visual Performance" />
                <StarRating category="venue" label="Environment & Atmosphere" />
                <StarRating category="value" label="Energy Exchange (Value)" />
              </div>

              <div className="space-y-4">
                <Label htmlFor="title" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Headline Tagline</Label>
                <Input 
                  id="title" 
                  placeholder="Sum up the vibe in one line"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={100}
                  className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 h-14 text-white font-bold"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="content" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Deep Debriefing</Label>
                <Textarea 
                  id="content" 
                  placeholder="The good, the bad, the frequencies. Leave a trace for others."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 text-white resize-none p-4"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-black h-16 rounded-full text-sm font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,0,122,0.4)] transition-transform hover:scale-[1.02]"
                disabled={submitting || ratings.overall === 0}
              >
                {submitting ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <Star className="mr-3 h-5 w-5 fill-black border-transparent" />
                )}
                {submitting ? "[ DEPLOYING ]" : "Broadcast Review"}
              </Button>
              
              {ratings.overall === 0 && (
                <p className="text-[10px] font-bold text-center text-red-500 uppercase tracking-widest mt-4">Core Rating Input Is Required To Broadcast</p>
              )}
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}

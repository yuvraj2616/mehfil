import { fetchAPI } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Ticket,
  Sparkles,
  ArrowLeft,
  User,
  Music,
  Star,
} from "lucide-react";
import { EventReviews } from "@/components/events/EventReviews";
import { FollowButton } from "@/components/ui/FollowButton";

const categoryColors: Record<string, string> = {
  poetry: "bg-purple-900/40 text-purple-300 border-purple-500/30",
  music: "bg-primary/20 text-primary border-primary/30",
  dance: "bg-rose-900/40 text-rose-300 border-rose-500/30",
  theater: "bg-blue-900/40 text-blue-300 border-blue-500/30",
  comedy: "bg-emerald-900/40 text-emerald-300 border-emerald-500/30",
  literary: "bg-indigo-900/40 text-indigo-300 border-indigo-500/30",
  cultural: "bg-orange-900/40 text-orange-300 border-orange-500/30",
};

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailsPage({ params }: EventPageProps) {
  const { id } = await params;

  const data = await fetchAPI(`/events/${id}`);
  const event = data?.event;

  if (!event) notFound();

  const startDate = event.date_time?.start
    ? new Date(event.date_time.start)
    : null;
  const endDate = event.date_time?.end
    ? new Date(event.date_time.end)
    : null;

  const lowestPrice = event.ticketing?.length
    ? Math.min(...event.ticketing.map((t: { price: number }) => t.price))
    : null;

  const totalCapacity = event.ticketing?.length
    ? event.ticketing.reduce((sum: number, t: { quantity: number }) => sum + t.quantity, 0)
    : event.venue?.capacity || 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Hero Banner */}
      <section className="relative pt-16">
        <div className="h-[50vh] sm:h-[65vh] bg-[#0A0D15] overflow-hidden relative">
          {event.media?.banner ? (
            <img
              src={event.media.banner}
              alt={event.title}
              className="w-full h-full object-cover mix-blend-lighten opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2000')] bg-cover bg-center mix-blend-lighten opacity-30" />
          )}
          {/* Intense vignette gradient to merge seamlessly into black background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/80" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 transform translate-y-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-primary hover:text-white mb-6 transition-colors bg-primary/10 border border-primary/20 px-4 py-2 rounded-full"
            >
              <ArrowLeft className="h-3 w-3" />
              Return
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={`uppercase text-[10px] font-bold tracking-widest px-3 py-1 border ${categoryColors[event.category] || categoryColors.cultural}`}>
                {event.category}
              </Badge>
              {event.is_featured && (
                <Badge className="bg-primary text-black font-black uppercase text-[10px] tracking-widest px-3 py-1 border-0">
                  ★ Featured
                </Badge>
              )}
              <Badge variant="outline" className="uppercase text-[10px] font-bold tracking-widest px-3 py-1 border-gray-700 text-gray-300">
                {event.status}
              </Badge>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-6 drop-shadow-2xl">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs font-bold tracking-widest uppercase text-gray-400">
              {startDate && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {startDate.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              )}
              {event.venue?.city && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {event.venue.name ? `${event.venue.name}, ${event.venue.city}` : event.venue.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* spacer for the translated hero content */}
      <div className="h-20 sm:h-24"></div>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div className="bg-[#0A0D15] border-l-4 border-l-primary p-8 sm:p-10">
              <h2 className="text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mb-6">[ The Brief ]</h2>
              <div className="prose prose-invert prose-p:text-gray-300 prose-p:leading-relaxed max-w-none">
                <p className="whitespace-pre-wrap text-lg font-medium">
                  {event.description || "No description provided yet."}
                </p>
              </div>
              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8">
                  {event.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px] font-bold tracking-widest uppercase border-gray-800 text-gray-500 bg-[#050505]">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Artists */}
            {event.artists?.length > 0 && (
              <div>
                <h2 className="text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mb-6">[ Lineup ]</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.artists.map((artist: { name: string; role?: string }, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl bg-[#0A0D15] border border-gray-800 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary font-black text-xl border border-primary/30 shadow-[0_0_15px_rgba(255,0,122,0.2)]">
                        {artist.name?.[0] || "A"}
                      </div>
                      <div>
                        <p className="font-bold text-lg uppercase tracking-tight">{artist.name}</p>
                        {artist.role && (
                          <p className="text-[10px] font-bold tracking-widest uppercase text-primary mt-1">{artist.role}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venue */}
            {event.venue?.name && (
              <div className="bg-[#0A0D15] p-8 sm:p-10 border border-gray-800 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-900/20 blur-3xl rounded-full" />
                <h2 className="text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mb-6 relative z-10">[ Location ]</h2>
                <div className="space-y-4 relative z-10">
                  <p className="font-black text-3xl uppercase tracking-tighter">{event.venue.name}</p>
                  {event.venue.address && (
                    <p className="text-gray-400 font-medium">{event.venue.address}</p>
                  )}
                  {event.venue.city && (
                    <p className="text-gray-400 font-medium">{event.venue.city}</p>
                  )}
                  {event.venue.capacity && (
                    <p className="text-xs font-bold tracking-widest uppercase text-primary flex items-center gap-2 mt-4">
                      <Users className="h-4 w-4" />
                      Capacity: {event.venue.capacity}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div id="reviews" className="scroll-mt-32 pt-10 border-t border-gray-800">
              <h2 className="text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
                <Star className="h-4 w-4 text-primary fill-primary" />
                [ Crowd Feedback ]
              </h2>
              <div className="theme-dark">
                <EventReviews eventId={event.id} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="bg-[#0A0D15] border-gray-800 shadow-2xl sticky top-28 rounded-xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />
              <CardContent className="p-8">
                <div className="text-center mb-8 pb-8 border-b border-gray-800">
                  <div className="flex items-center justify-center gap-2 text-4xl font-black text-white mb-2 tracking-tighter">
                    <IndianRupee className="h-8 w-8 text-primary" />
                    {lowestPrice !== null
                      ? lowestPrice.toLocaleString("en-IN")
                      : "Free"}
                  </div>
                  {lowestPrice !== null && event.ticketing?.length > 1 && (
                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Starting price</p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="space-y-6 mb-8">
                  {startDate && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#050505] border border-gray-800 flex items-center justify-center shrink-0">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="pt-1">
                        <p className="font-bold text-sm uppercase tracking-wider mb-1">
                          {startDate.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                          {startDate.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {endDate &&
                            ` - ${endDate.toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {event.venue?.city && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#050505] border border-gray-800 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="pt-2">
                        <p className="font-bold text-sm uppercase tracking-wider">{event.venue.name || event.venue.city}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ticket Types */}
                {event.ticketing?.length > 0 && (
                  <div className="bg-[#050505] rounded-xl p-6 mb-8 border border-gray-800">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 flex items-center gap-2 mb-4">
                        <Ticket className="h-4 w-4 text-primary" />
                        Available Tiers
                      </p>
                      {event.ticketing.map(
                        (tier: { name: string; price: number; quantity: number }, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between pb-4 border-b border-gray-800 last:border-0 last:pb-0"
                          >
                            <div>
                              <p className="text-sm font-bold uppercase tracking-wider">{tier.name}</p>
                              <p className="text-[10px] font-bold tracking-widest text-primary uppercase mt-1">
                                {tier.quantity} left
                              </p>
                            </div>
                            <span className="font-black text-lg flex items-center gap-0.5">
                              <IndianRupee className="h-4 w-4 text-gray-500" />
                              {tier.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <Link href={`/events/${event.id}/book`} className="block w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-7 text-sm uppercase tracking-[0.2em] font-black shadow-[0_0_25px_rgba(255,0,122,0.4)] transition-transform hover:scale-[1.02]">
                    Get Tickets
                  </Button>
                </Link>
                <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                  <Sparkles className="h-3 w-3" /> Secure checkout
                </p>
              </CardContent>
            </Card>

            {/* Organizer */}
            <div className="bg-[#0A0D15] border border-gray-800 rounded-xl p-8">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-6 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Host
              </p>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black font-black text-2xl shadow-lg">
                  {event.organizer?.name?.[0] || "H"}
                </div>
                <div>
                  <p className="font-black text-xl uppercase tracking-tighter truncate max-w-[200px]">{event.organizer?.name || "Organizer"}</p>
                  <p className="text-[10px] font-bold tracking-widest text-primary uppercase mt-1">
                    {event.organizer?.role}
                  </p>
                </div>
              </div>
              {event.organizer?.bio && (
                <p className="text-sm text-gray-400 font-medium mt-6 line-clamp-3 leading-relaxed">
                  {event.organizer.bio}
                </p>
              )}
              {event.organizer?.user_id && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <FollowButton
                    targetUserId={event.organizer.user_id}
                    targetName={event.organizer.name || "this host"}
                    showCount={true}
                    className="text-[10px] h-9 px-5"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Calendar, Heart, Star, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ArtistDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Fetch user profile to get their name
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "artist") redirect("/dashboard");

  const artistName = profile?.name || "";

  // Strategy: Fetch events where artists array might contain this artist.
  // Since we don't have a direct relation table, we fetch published events and filter.
  // In a large production app, an `event_artists` bridging table would be more performant.
  const { data: allEvents } = await supabase
    .from("events")
    .select("id, title, date_time, venue, artists, media")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // Filter events where this artist's name appears in the artists JSON array
  let myGigs: any[] = [];
  if (artistName && allEvents) {
    myGigs = allEvents.filter((event) => {
      if (!Array.isArray(event.artists)) return false;
      return event.artists.some((a: any) => 
        a.name && a.name.toLowerCase() === artistName.toLowerCase()
      );
    });
  }

  const upcomingGigs = myGigs.filter((e) => {
    const d = e.date_time?.start ? new Date(e.date_time.start) : null;
    return d && d > new Date();
  });

  const quickStats = [
    { label: "Portfolio Items", value: "1", icon: <Music className="h-5 w-5" />, color: "text-[#00D4FF]" },
    { label: "Upcoming Gigs", value: upcomingGigs.length.toString(), icon: <Calendar className="h-5 w-5" />, color: "text-sky-400" },
    { label: "Total Past Acts", value: (myGigs.length - upcomingGigs.length).toString(), icon: <Heart className="h-5 w-5" />, color: "text-rose-400" },
    { label: "Avg Rating", value: "4.8", icon: <Star className="h-5 w-5" />, color: "text-violet-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Music className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Artist Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {artistName || "Artist"}!</p>
          </div>
        </div>
        <Link href="/profile">
          <Button variant="outline">Update Profile</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="bg-card/50 border-border/40">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/40 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-400" />
              My Upcoming Gigs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingGigs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {upcomingGigs.map((gig) => (
                  <div key={gig.id} className="flex gap-4 p-4 rounded-xl bg-background border border-border/50">
                     <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      {gig.media?.banner ? (
                        <img src={gig.media.banner} className="w-full h-full object-cover" alt="Event" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-purple-600/20" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold line-clamp-1">{gig.title}</h4>
                      <p className="text-sm text-[#7B2FFF] mt-1">
                        {gig.date_time?.start ? new Date(gig.date_time.start).toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric'}) : "TBD"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {gig.venue?.city || "To be confirmed"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Music className="h-12 w-12 mb-4 opacity-30" />
                <p className="text-sm">You aren't scheduled for any upcoming events yet.</p>
                <div className="mt-4 text-xs max-w-sm text-center opacity-70">
                  When organizers list you in their event lineups (matching your exact name), the gigs will automatically appear here.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

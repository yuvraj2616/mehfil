import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Calendar, Heart, Star, MapPin, ArrowRight } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArtistCharts } from "@/components/dashboard/ArtistCharts";

export default async function ArtistDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Fetch profile from backend
  const profileData = await fetchAPI("/profiles/me");
  const profile = profileData?.profile;

  if (profile?.role !== "artist") redirect("/dashboard");

  const artistName = profile?.name || "";

  // Fetch published events from backend and filter by artist name
  const eventsData = await fetchAPI("/events?limit=100");
  const allEvents = eventsData?.events || [];

  let myGigs: any[] = [];
  if (artistName && allEvents) {
    myGigs = allEvents.filter((event: any) => {
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

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

  const quickStats = [
    { label: "Portfolio Items", value: "1", icon: <Music className="h-5 w-5" />, color: "text-[#00D4FF]", borderClass: "hover:border-[#00D4FF]/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]", shadowClass: "bg-[#00D4FF]/20" },
    { label: "Upcoming Gigs", value: upcomingGigs.length.toString(), icon: <Calendar className="h-5 w-5" />, color: "text-sky-400", borderClass: "hover:border-sky-400/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]", shadowClass: "bg-sky-400/20" },
    { label: "Total Past Acts", value: (myGigs.length - upcomingGigs.length).toString(), icon: <Heart className="h-5 w-5" />, color: "text-[#FF007A]", borderClass: "hover:border-[#FF007A]/50 hover:shadow-[0_0_20px_rgba(255,0,122,0.2)]", shadowClass: "bg-[#FF007A]/20" },
    { label: "Avg Rating", value: "4.8", icon: <Star className="h-5 w-5" />, color: "text-violet-400", borderClass: "hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]", shadowClass: "bg-violet-500/20" },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Header: Welcome & Date */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex-1">
          <div className="flex justify-between w-full flex-col sm:flex-row gap-6">
             <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> {today}
                </p>
                <h1 className="text-4xl font-black tracking-tight mt-1">
                  Welcome back, <span className="font-[cursive] italic font-normal tracking-wider text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)] transform -rotate-2 inline-block ml-1">{artistName || "Artist"}</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mt-2">Manage your artistic portfolio and gigs</p>
             </div>
             <div>
                <Link href="/profile">
                  <Button className="bg-sky-500 hover:bg-sky-400 text-black h-12 rounded-full px-8 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-transform hover:scale-105">
                    Update Profile
                  </Button>
                </Link>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {quickStats.map((stat) => (
          <Card key={stat.label} className={`bg-white/5 backdrop-blur-md border-white/10 ${stat.borderClass} transition-all duration-300 hover:-translate-y-1 h-full cursor-pointer overflow-hidden relative`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className={`absolute top-0 left-0 w-full h-1 bg-current opacity-50 ${stat.color}`} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 mb-2">{stat.label}</p>
                  <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                </div>
                <div className={`${stat.shadowClass} ${stat.color} p-3 rounded-xl border border-white/10 backdrop-blur-md transition-transform hover:scale-110`}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. Recharts */}
      <ArtistCharts gigs={myGigs} />

      {/* 4. Upcoming Gigs Grid */}
      <div className="grid grid-cols-1 relative z-10">
        <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-2xl h-full flex flex-col relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent opacity-80 pointer-events-none" />
          
          <CardHeader className="border-b border-gray-800 pb-5 pt-6 px-6 sm:px-8 bg-[#050505] flex flex-row items-center justify-between shadow-md z-10">
            <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 flex items-center gap-3">
               <Calendar className="h-4 w-4 text-sky-400" />
               Upcoming Live Sets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 flex-1 z-10">
            {upcomingGigs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingGigs.map((gig) => (
                  <div key={gig.id} className="flex flex-col sm:flex-row gap-5 items-start sm:items-center p-5 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#050505] overflow-hidden shrink-0 border border-gray-800 relative z-0">
                      {gig.media?.banner ? (
                        <img src={gig.media.banner} className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" alt="Event" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-sky-500/20" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <h4 className="font-black text-lg uppercase tracking-tight text-white mb-1 leading-snug">{gig.title}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                         <MapPin className="h-3 w-3" /> {gig.location?.venue || "TBA"}
                      </p>
                      <div className="flex items-center gap-2">
                         <Badge variant="outline" className="bg-sky-400/10 text-sky-400 border-sky-400/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                           {new Date(gig.date_time?.start || Date.now()).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                         </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center">
                <div className="bg-white/5 p-5 rounded-full border border-white/10 mb-5 relative group cursor-pointer hover:border-white/20 transition-colors">
                   <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Music className="h-8 w-8 text-gray-500 relative z-10" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">No scheduled appearances found.</p>
                <Link href="/events">
                  <Button variant="outline" className="border-sky-500 text-sky-400 hover:bg-sky-500/10 rounded-lg h-10 px-8 text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-105">
                     Browse Network
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

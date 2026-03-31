import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, PlusCircle, BarChart3, Ticket, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchAPI } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { OrganizerCharts } from "@/components/dashboard/OrganizerCharts";

export default async function OrganizerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch organizer's events from backend
  const eventsData = await fetchAPI("/events?status=published&limit=50");
  const allEvents = eventsData?.events || [];
  const safeEvents = allEvents.filter((e: any) => e.organizer_id === user.id);

  // Fetch bookings for this organizer's events
  const bookingsData = await fetchAPI("/bookings?role=organizer");
  const orgBookings = bookingsData?.bookings || [];

  let totalRevenue = 0;
  let ticketsSold = 0;
  orgBookings.forEach((b: any) => {
    if (b.status === "confirmed") {
      totalRevenue += Number(b.final_amount) || 0;
      (b.tickets || []).forEach((t: any) => {
        ticketsSold += Number(t.quantity) || 0;
      });
    }
  });

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || "Organizer";

  const quickStats = [
    { label: "My Events", value: safeEvents.length.toString(), icon: <Calendar className="h-5 w-5" />, color: "text-[#00D4FF]", borderClass: "hover:border-[#00D4FF]/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]", shadowClass: "bg-[#00D4FF]/20" },
    { label: "Tickets Sold", value: ticketsSold.toString(), icon: <Ticket className="h-5 w-5" />, color: "text-[#FF007A]", borderClass: "hover:border-[#FF007A]/50 hover:shadow-[0_0_20px_rgba(255,0,122,0.2)]", shadowClass: "bg-[#FF007A]/20" },
    { label: "Total Attendees", value: ticketsSold.toString(), icon: <Users className="h-5 w-5" />, color: "text-emerald-400", borderClass: "hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]", shadowClass: "bg-emerald-500/20" },
    { label: "Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: <BarChart3 className="h-5 w-5" />, color: "text-violet-400", borderClass: "hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]", shadowClass: "bg-violet-500/20" },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Header: Welcome & Date */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex-1">
          <div className="flex justify-between w-full flex-col sm:flex-row gap-6">
             <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> {today}
                </p>
                <h1 className="text-4xl font-black tracking-tight mt-1">
                  Welcome back, <span className="font-[cursive] italic font-normal tracking-wider text-violet-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] transform -rotate-2 inline-block ml-1">{userName}</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mt-2">Manage your events and track telemetry</p>
             </div>
             <div>
                <Link href="/events/create">
                  <Button className="bg-primary hover:bg-primary/90 text-black h-12 rounded-full px-8 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,0,122,0.3)] transition-transform hover:scale-105">
                    <PlusCircle className="mr-3 h-4 w-4" />
                    Initialize Event
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
      <OrganizerCharts bookings={orgBookings} events={safeEvents} />

      {/* 4. Events Matrix */}
      <div className="grid grid-cols-1 relative z-10">
        <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-2xl h-full flex flex-col relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent opacity-80 pointer-events-none" />
          
          <CardHeader className="border-b border-gray-800 pb-5 pt-6 px-6 sm:px-8 bg-[#050505] flex flex-row items-center justify-between shadow-md z-10">
            <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 flex items-center gap-3">
               <Calendar className="h-4 w-4 text-[#00D4FF]" />
               Deployed Event Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 flex-1 z-10">
            {safeEvents.length > 0 ? (
              <div className="space-y-4">
                {safeEvents.map((event: any) => (
                  <div key={event.id} className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center p-5 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="flex gap-5 items-center w-full sm:w-auto">
                       <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#050505] overflow-hidden shrink-0 border border-gray-800 relative z-0">
                          {event.media?.banner ? (
                            <img src={event.media.banner} className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" alt="Event" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-[#00D4FF]/20" />
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="font-black text-base sm:text-lg uppercase tracking-tight text-white mb-1 leading-snug">{event.title}</h4>
                          <div className="flex items-center gap-2 mb-2">
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">INIT {new Date(event.created_at).toLocaleDateString("en-IN")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${event.status === "published" ? "bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                    </div>

                    <div className="flex sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
                      <Link href={`/events/${event.id}`} className="w-full sm:w-auto">
                         <Button variant="outline" className="w-full sm:w-auto h-10 px-5 text-[10px] font-black uppercase tracking-widest border-white/10 text-gray-300 bg-white/5 hover:text-white hover:bg-[#00D4FF]/20 hover:border-[#00D4FF]/40 transition-all shadow-sm">
                           Network View <ArrowRight className="ml-2 h-3 w-3" />
                         </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center">
                <div className="bg-white/5 p-5 rounded-full border border-white/10 mb-5 relative group cursor-pointer hover:border-white/20 transition-colors">
                   <div className="absolute inset-0 bg-[#00D4FF]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Calendar className="h-8 w-8 text-gray-500 relative z-10" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Awaiting your first deployment</p>
                <Link href="/events/create">
                  <Button className="bg-primary hover:bg-primary/90 text-black rounded-lg h-10 px-8 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,122,0.3)] transition-transform hover:scale-105">
                     <PlusCircle className="mr-3 h-4 w-4" />
                     Initialize Platform
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

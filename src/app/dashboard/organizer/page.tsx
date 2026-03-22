import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, PlusCircle, BarChart3, Ticket, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function OrganizerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch organizer's events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false });

  const safeEvents = events || [];

  // Fetch all bookings for the organizer's events to calculate revenue
  let totalRevenue = 0;
  let ticketsSold = 0;

  if (safeEvents.length > 0) {
    const eventIds = safeEvents.map(e => e.id);
    const { data: bookings } = await supabase
      .from("bookings")
      .select("final_amount, tickets, status")
      .in("event_id", eventIds)
      .eq("status", "confirmed");

    if (bookings) {
      bookings.forEach(b => {
        totalRevenue += Number(b.final_amount) || 0;
        b.tickets.forEach((t: any) => {
          ticketsSold += Number(t.quantity) || 0;
        });
      });
    }
  }

  const quickStats = [
    { label: "My Events", value: safeEvents.length.toString(), icon: <Calendar className="h-5 w-5" />, color: "text-[#00D4FF]" },
    { label: "Tickets Sold", value: ticketsSold.toString(), icon: <Ticket className="h-5 w-5" />, color: "text-primary" },
    { label: "Total Attendees", value: ticketsSold.toString(), icon: <Users className="h-5 w-5" />, color: "text-emerald-400" },
    { label: "Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: <BarChart3 className="h-5 w-5" />, color: "text-violet-400" },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Organizer <span className="text-primary italic">Terminal</span></h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Manage your events and track telemetry</p>
        </div>
        <Link href="/events/create">
          <Button className="bg-primary hover:bg-primary/90 text-black h-12 rounded-full px-8 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,0,122,0.3)] transition-transform hover:scale-105">
            <PlusCircle className="mr-3 h-4 w-4" />
            Initialize Event
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-xl overflow-hidden relative group hover:border-gray-700 transition-colors">
            <div className={`absolute top-0 left-0 w-full h-1 bg-current opacity-50 ${stat.color}`} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 mb-2">{stat.label}</p>
                  <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                </div>
                <div className={`${stat.color} bg-black p-3 rounded-xl border border-gray-800`}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events List */}
      <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-2xl">
        <CardHeader className="border-b border-gray-800 pb-6 pt-8 px-8">
          <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400">Deployed Events</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {safeEvents.length > 0 ? (
            <div className="space-y-4">
              {safeEvents.map((event: any) => (
                <div key={event.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 rounded-2xl bg-[#050505] border border-gray-800 hover:border-gray-700 transition-all gap-6">
                  <div>
                    <h4 className="font-black text-xl uppercase tracking-tighter">{event.title}</h4>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">INIT {new Date(event.created_at).toLocaleDateString("en-IN")}</span>
                      <div className="h-1 w-1 bg-gray-700 rounded-full" />
                      <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2 py-0 border-current bg-transparent ${event.status === "published" ? "text-emerald-500" : "text-gray-500"}`}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest border-gray-800 text-gray-300 hover:text-white hover:bg-[#111] rounded-xl h-10 px-6">
                        Frontend View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-[#050505] p-6 rounded-full border border-gray-800 mb-6">
                <Calendar className="h-10 w-10 text-gray-600" />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Awaiting your first deployment</p>
              <Link href="/events/create">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black rounded-full h-12 px-8 text-[10px] font-black uppercase tracking-[0.2em]">
                  <PlusCircle className="mr-3 h-4 w-4" />
                  Initialize Platform
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

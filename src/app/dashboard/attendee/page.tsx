import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Calendar, Star, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function AttendeeDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all bookings for this user
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      event:events(id, title, date_time, venue, media)
    `)
    .eq("attendee_id", user.id)
    .order("created_at", { ascending: false });

  const safeBookings = bookings || [];
  const confirmedBookings = safeBookings.filter((b) => b.status === "confirmed");

  // Simple stats calculation
  const totalBookings = safeBookings.length;
  const upcomingEvents = confirmedBookings.filter((b) => {
    const eventDate = b.event?.date_time?.start ? new Date(b.event.date_time.start) : null;
    return eventDate && eventDate > new Date();
  }).length;

  const quickStats = [
    { label: "Bookings Acquired", value: totalBookings.toString(), icon: <Ticket className="h-5 w-5" />, color: "text-[#00D4FF]" },
    { label: "Active Deployments", value: upcomingEvents.toString(), icon: <Calendar className="h-5 w-5" />, color: "text-[#00D4FF]" },
    { label: "Logs Written", value: "0", icon: <Star className="h-5 w-5" />, color: "text-primary" },
    { label: "Past Encounters", value: (confirmedBookings.length - upcomingEvents).toString(), icon: <Clock className="h-5 w-5" />, color: "text-violet-400" },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Personal <span className="text-primary italic">Terminal</span></h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Your reservations, history, and network access</p>
        </div>
        <Link href="/events">
          <Button className="bg-[#0A0D15] border border-gray-800 text-white hover:bg-white hover:text-black h-12 rounded-full px-8 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
            Scan Network for Events
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
                <div className={`${stat.color} bg-[#050505] p-3 rounded-xl border border-gray-800`}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bookings */}
      <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-2xl">
        <CardHeader className="border-b border-gray-800 pb-6 pt-8 px-8">
          <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 flex items-center gap-3">
             <Ticket className="h-4 w-4 text-primary" />
             Access Passes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {safeBookings.length > 0 ? (
            <div className="space-y-4">
              {safeBookings.map((booking: any) => (
                <div key={booking.id} className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center p-4 rounded-2xl bg-[#050505] border border-gray-800 group hover:border-gray-700 transition-colors">
                  <div className="flex gap-6 items-center w-full sm:w-auto hidden sm:flex">
                     <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0 border border-gray-800">
                        {booking.event?.media?.banner ? (
                          <img src={booking.event.media.banner} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="Event" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-lg uppercase tracking-tighter">{booking.event?.title || "[ NULL EVENT REF ]"}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{new Date(booking.created_at).toLocaleDateString("en-IN")}</span>
                           <span className="text-gray-700">•</span>
                           <span className="text-[10px] text-primary font-mono uppercase tracking-widest">{booking.booking_id}</span>
                        </div>
                      </div>
                  </div>
                  
                  {/* Mobile layout */}
                  <div className="sm:hidden space-y-3 w-full">
                     <h4 className="font-black text-lg uppercase tracking-tighter">{booking.event?.title || "[ NULL EVENT REF ]"}</h4>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{new Date(booking.created_at).toLocaleDateString("en-IN")}</p>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 ${booking.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"}`}>
                      {booking.status}
                    </Badge>
                    {booking.status === "confirmed" && (
                      <Link href={`/events/${booking.event_id}/book/success?booking=${booking.id}`}>
                        <Button variant="ghost" className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-primary hover:text-black hover:bg-primary rounded-xl transition-all">
                          View Ticket <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-[#050505] p-6 rounded-full border border-gray-800 mb-6">
                 <Ticket className="h-10 w-10 text-gray-600" />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-800 pb-2 border-dashed">No authorizations found. Network empty.</p>
              <Link href="/events">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black rounded-full h-12 px-8 text-[10px] font-black uppercase tracking-[0.2em]">
                  Initialize Search
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

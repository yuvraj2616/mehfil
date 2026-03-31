import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchAPI } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch bookings from Express backend
  const data = await fetchAPI("/bookings?role=attendee");
  const safeBookings = data?.bookings || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 border-b border-gray-800 pb-6 mb-6">
         <Link href="/dashboard/attendee">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
               <ArrowLeft className="w-5 h-5" />
            </Button>
         </Link>
         <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">My <span className="text-primary italic">Bookings</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Comprehensive log of all network access passes</p>
         </div>
      </div>

      <div className="space-y-6">
        {safeBookings.length > 0 ? (
          safeBookings.map((booking: any) => (
            <Card key={booking.id} className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-xl overflow-hidden group hover:border-gray-700 transition-colors">
              <CardContent className="p-0 sm:flex">
                <div className="w-full sm:w-48 h-48 sm:h-auto bg-[#050505] overflow-hidden shrink-0 border-r border-gray-800 relative z-0">
                  {booking.event?.media?.banner ? (
                    <img src={booking.event.media.banner} className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" alt="Event" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                  )}
                  <div className="absolute top-4 left-4">
                     <Badge variant="outline" className={`backdrop-blur-md shadow-lg text-[10px] font-black uppercase tracking-widest px-3 py-1 ${booking.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "bg-primary/20 text-primary border-primary/40"}`}>
                        {booking.status}
                     </Badge>
                  </div>
                </div>
                
                <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                   <div>
                     <h4 className="font-black text-2xl uppercase tracking-tighter mb-2 text-white">{booking.event?.title || "[ NULL EVENT REF ]"}</h4>
                     
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Date Acquired</p>
                           <p className="text-sm font-bold text-gray-300">{new Date(booking.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Booking Ref</p>
                           <p className="text-sm font-mono text-gray-300">{booking.booking_id}</p>
                        </div>
                        <div>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Tickets</p>
                           <p className="text-sm font-bold text-[#00D4FF]">
                             {booking.tickets && Array.isArray(booking.tickets) 
                                ? booking.tickets.reduce((acc: number, t: any) => acc + (t.quantity || 0), 0)
                                : "1"} Passes
                           </p>
                        </div>
                        <div>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Amount</p>
                           <p className="text-sm font-bold text-emerald-400">₹{booking.final_amount?.toLocaleString("en-IN")}</p>
                        </div>
                     </div>
                   </div>

                   <div className="mt-8 flex justify-end border-t border-gray-800/50 pt-6">
                     {booking.status === "confirmed" && (
                       <Link href={`/events/${booking.event_id}/book/success?booking=${booking.id}`}>
                         <Button className="bg-[#FF007A]/10 text-[#FF007A] hover:bg-[#FF007A] hover:text-white border border-[#FF007A]/30 rounded-full h-12 px-8 text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,0,122,0.15)] hover:relative hover:z-10 hover:scale-105">
                           View Digital Ticket <ArrowRight className="ml-2 h-4 w-4" />
                         </Button>
                       </Link>
                     )}
                   </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-gray-800 border-dashed rounded-3xl bg-white/5">
            <div className="bg-[#050505] p-6 rounded-full border border-gray-800 mb-6">
               <Ticket className="h-10 w-10 text-gray-600" />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">No historical records found.</p>
            <Link href="/events">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black rounded-full h-12 px-8 text-[10px] font-black uppercase tracking-[0.2em]">
                Enter Network
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

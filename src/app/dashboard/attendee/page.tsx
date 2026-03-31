import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Calendar, Search, Bookmark, Clock, Zap, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchAPI } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { AttendeeCharts } from "@/components/dashboard/AttendeeCharts";
import { RecommendedEvents } from "@/components/dashboard/RecommendedEvents";

export default async function AttendeeDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch bookings from Express backend
  const data = await fetchAPI("/bookings?role=attendee");
  const safeBookings = data?.bookings || [];
  const confirmedBookings = safeBookings.filter((b: any) => b.status === "confirmed");

  // Format dates
  const today = new Date().toLocaleDateString("en-IN", { 
    weekday: "long", month: "long", day: "numeric" 
  });
  
  // Extract user display name
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  // Mock Activity Timeline data 
  const activityTimeline = [
    { id: 1, action: "Viewed Event Details", target: "Neon Night", time: "2 hours ago", icon: <Search className="w-3 h-3 text-gray-400" />, color: "border-gray-800" },
    { id: 2, action: "Processed Ticket Purchase", target: "Shreya Ghoshal Live", time: "Yesterday", icon: <Ticket className="w-3 h-3 text-[#FF007A]" />, color: "border-[#FF007A]/50 bg-[#FF007A]/5" },
    { id: 3, action: "Saved to Watchlist", target: "Biswa Kalyan Rath", time: "3 days ago", icon: <Bookmark className="w-3 h-3 text-[#00D4FF]" />, color: "border-[#00D4FF]/50 bg-[#00D4FF]/5" },
    { id: 4, action: "Account Authorized", target: "System Login", time: "5 days ago", icon: <Target className="w-3 h-3 text-emerald-500" />, color: "border-emerald-500/50 bg-emerald-500/5" },
  ];

  // Smart Insights calculation
  let topCategory = "Acoustic";
  let totalSpent = 0;
  
  if (confirmedBookings.length > 0) {
    const categories: Record<string, number> = {};
    confirmedBookings.forEach((b: any) => {
      const cat = b.event?.category || "uncategorized";
      categories[cat] = (categories[cat] || 0) + 1;
      totalSpent += Number(b.final_amount || 0);
    });
    
    // Find highest
    let maxCount = 0;
    for (const [cat, count] of Object.entries(categories)) {
      if (count > maxCount) {
         maxCount = count;
         topCategory = cat;
      }
    }
  }

  return (
    <div className="space-y-12">
      {/* 1. Header: Welcome & Date */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500 mb-1 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> {today}
          </p>
          <h1 className="text-4xl font-black tracking-tight mt-1">
            Welcome back, <span className="font-[cursive] italic font-normal tracking-wider text-[#FF007A] drop-shadow-[0_0_15px_rgba(255,0,122,0.5)] transform -rotate-2 inline-block ml-1">{userName}</span>
          </h1>
        </div>
      </div>



      {/* 3. Recharts Visualizations */}
      <AttendeeCharts bookings={safeBookings} />

      {/* AI Recommendations Carousel */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#FF007A]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <RecommendedEvents userId={user.id} />
        </div>
      </div>

      {/* 4 & 5. Smart Insights + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        
        {/* Smart Insights */}
        <Card className="bg-gradient-to-br from-[#0A0D15] to-[#1a1025] border-primary/30 rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2 text-white/70">
              <Zap className="h-3 w-3 text-primary" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <p className="text-xs text-gray-400 font-medium">Top Category Match</p>
                <p className="text-lg font-black text-white tracking-tight uppercase mt-1">{topCategory}</p>
             </div>
             <div>
                <p className="text-xs text-gray-400 font-medium">Aggregated Expenditure</p>
                <p className="text-xl font-black text-emerald-400 tracking-tight mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
             </div>
             <div className="mt-4 pt-4 border-t border-white/10">
               <p className="text-xs italic text-gray-400">"Your profile suggests a strong affinity for high-energy sets. Scanning network for matches..."</p>
             </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-xl overflow-hidden">
           <CardHeader className="pb-4 border-b border-white/5 bg-black/20">
            <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2 text-gray-400">
              <Clock className="h-4 w-4 text-[#00D4FF]" />
              Event Matrix Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {activityTimeline.map((item, i) => (
                   <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${item.color} bg-[#0A0D15] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10`}>
                        {item.icon}
                      </div>
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-white/5 bg-white/5 group-hover:bg-white/10 transition-colors">
                         <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs uppercase tracking-wider text-white">{item.action}</span>
                         </div>
                         <div className="text-gray-400 text-xs font-medium">{item.target}</div>
                         <div className="text-[9px] font-bold text-gray-600 mt-2 uppercase tracking-widest">{item.time}</div>
                      </div>
                   </div>
                ))}
             </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

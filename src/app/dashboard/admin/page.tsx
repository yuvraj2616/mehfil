import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Calendar, BarChart3, Star, Settings } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminCharts } from "@/components/dashboard/AdminCharts";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Fetch all admin stats from backend
  const stats = await fetchAPI("/admin/stats");

  if (stats?.error) redirect("/dashboard");

  const { usersCount, eventsCount, grossVolume, reviewsCount, recentUsers, recentEvents } = stats;
  const platformRevenue = (grossVolume || 0) * 0.05;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || "Administrator";

  const quickStats = [
    { label: "Total Users", value: (usersCount || 0).toString(), icon: <Users className="h-5 w-5" />, color: "text-sky-400", borderClass: "hover:border-sky-400/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]", shadowClass: "bg-sky-400/20" },
    { label: "Total Events", value: (eventsCount || 0).toString(), icon: <Calendar className="h-5 w-5" />, color: "text-[#00D4FF]", borderClass: "hover:border-[#00D4FF]/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]", shadowClass: "bg-[#00D4FF]/20" },
    { label: "Platform Revenue", value: `₹${platformRevenue.toLocaleString("en-IN")}`, icon: <BarChart3 className="h-5 w-5" />, color: "text-emerald-400", borderClass: "hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]", shadowClass: "bg-emerald-500/20" },
    { label: "Reviews", value: (reviewsCount || 0).toString(), icon: <Star className="h-5 w-5" />, color: "text-violet-400", borderClass: "hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]", shadowClass: "bg-violet-500/20" },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Header: Welcome & Date */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex-1">
          <div className="flex justify-between w-full flex-col sm:flex-row gap-6">
             <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> {today}
                </p>
                <h1 className="text-4xl font-black tracking-tight mt-1">
                  Master <span className="font-[cursive] italic font-normal tracking-wider text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] transform -rotate-2 inline-block ml-1">Terminal</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mt-2">Super Admin access & platform overview for {userName}</p>
             </div>
             <div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-6 py-2 uppercase tracking-widest font-black rounded-full h-auto shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Shield className="w-3 h-3 mr-2 inline" /> Root Access
                </Badge>
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
      <AdminCharts stats={stats} />

      {/* 4. Stream Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Users */}
        <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="border-b border-gray-800 pb-5 pt-6 px-6 sm:px-8 bg-[#050505] flex flex-row items-center justify-between shadow-md z-10">
            <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 flex items-center gap-3">
               <Users className="h-4 w-4 text-sky-400" />
               Entity Stream
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 z-10 relative">
            {recentUsers && recentUsers.length > 0 ? (
              <div className="divide-y divide-gray-800/50">
                {recentUsers.slice(0, 5).map((u: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <p className="font-black text-sm uppercase tracking-wider text-white">{u.name || "Unknown Identity"}</p>
                      <p className="text-[10px] text-gray-400 tracking-widest font-mono mt-1">{u.email}</p>
                    </div>
                    <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 ${u.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : u.role === 'organizer' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20' : 'bg-white/5 text-gray-400 border-gray-700'}`}>
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">No entities located in stream.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events */}
        <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative group">
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00D4FF] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="border-b border-gray-800 pb-5 pt-6 px-6 sm:px-8 bg-[#050505] flex flex-row items-center justify-between shadow-md z-10">
            <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 flex items-center gap-3">
               <Calendar className="h-4 w-4 text-[#00D4FF]" />
               Data Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 z-10 relative">
            {recentEvents && recentEvents.length > 0 ? (
              <div className="divide-y divide-gray-800/50">
                {recentEvents.slice(0, 5).map((e: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <p className="font-black text-sm uppercase tracking-wider text-white truncate max-w-[200px]">{e.title}</p>
                      <p className="text-[10px] text-gray-400 tracking-widest mt-1">INIT {new Date(e.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 ${e.status === 'published' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20' : 'bg-[#FF007A]/10 text-[#FF007A] border-[#FF007A]/20'}`}>
                      {e.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">No active chunks located.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

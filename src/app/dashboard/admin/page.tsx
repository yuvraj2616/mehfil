import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Calendar, BarChart3, Star, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Double check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch metrics in parallel
  const [
    { count: usersCount },
    { count: eventsCount },
    { data: payments },
    { count: reviewsCount },
    { data: recentUsers },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("amount").eq("status", "completed"),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("name, email, role, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("events").select("id, title, status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  // Calculate gross volume. Let's assume platform takes a 5% cut for revenue.
  const grossVolume = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const platformRevenue = grossVolume * 0.05;

  const quickStats = [
    { label: "Total Users", value: (usersCount || 0).toString(), icon: <Users className="h-5 w-5" />, color: "text-sky-400" },
    { label: "Total Events", value: (eventsCount || 0).toString(), icon: <Calendar className="h-5 w-5" />, color: "text-[#00D4FF]" },
    { label: "Platform Revenue", value: `₹${platformRevenue.toLocaleString("en-IN")}`, icon: <BarChart3 className="h-5 w-5" />, color: "text-emerald-400" },
    { label: "Reviews", value: (reviewsCount || 0).toString(), icon: <Star className="h-5 w-5" />, color: "text-violet-400" },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Master <span className="text-primary italic">Terminal</span></h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Super Admin access and platform overview</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-6 py-2 uppercase tracking-widest font-black rounded-full h-auto">
          Root Access Granted
        </Badge>
      </div>

      {/* Stats Grid */}
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

      {/* Recent Data Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-800 pb-6 pt-8 px-8 bg-[#050505]">
            <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 flex items-center gap-3">
              <Users className="h-4 w-4 text-sky-400" />
              Latest Entities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentUsers && recentUsers.length > 0 ? (
              <div className="divide-y divide-gray-800">
                {recentUsers.map((u, i) => (
                  <div key={i} className="flex justify-between items-center p-6 hover:bg-[#111] transition-colors">
                    <div>
                      <p className="font-black text-sm uppercase tracking-wider">{u.name || "Unknown Identity"}</p>
                      <p className="text-[10px] text-gray-500 tracking-widest font-mono mt-1">{u.email}</p>
                    </div>
                    <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest rounded-lg px-3 py-1 bg-[#050505] ${u.role === 'admin' ? 'border-primary text-primary' : 'border-gray-700 text-gray-300'}`}>
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-[#050505] p-6 rounded-full border border-gray-800 mb-6">
                  <Users className="h-10 w-10 text-gray-600" />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">No entities traced.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-800 pb-6 pt-8 px-8 bg-[#050505]">
            <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 flex items-center gap-3">
              <Calendar className="h-4 w-4 text-[#00D4FF]" />
              Event Stream
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentEvents && recentEvents.length > 0 ? (
              <div className="divide-y divide-gray-800">
                {recentEvents.map((e, i) => (
                  <div key={i} className="flex justify-between items-center p-6 hover:bg-[#111] transition-colors">
                    <div className="pr-4">
                      <h4 className="font-black text-sm uppercase tracking-wider line-clamp-1">{e.title}</h4>
                      <p className="text-[10px] text-gray-500 tracking-[0.2em] font-bold mt-1 uppercase">INIT {new Date(e.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="flex gap-4 items-center shrink-0">
                      <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest rounded-lg px-3 py-1 bg-[#050505] ${e.status === "published" ? "text-emerald-500 border-emerald-500/30" : "text-gray-500 border-gray-700"}`}>
                        {e.status}
                      </Badge>
                      <Link href={`/events/${e.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg">
                          <Settings className="h-4 w-4" />
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
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Network stream empty.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

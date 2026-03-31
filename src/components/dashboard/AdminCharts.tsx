"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Activity, PieChart as PieChartIcon } from "lucide-react";

export function AdminCharts({ stats }: { stats: any }) {
  // Process logic for Area Chart (Platform Growth / Mock given the single stats payload)
  const { usersCount = 0, eventsCount = 0 } = stats || {};
  
  // Mocking 6 month growth trajectory leading up to current user count
  const growthFactor = usersCount > 0 ? usersCount / 6 : 10;
  
  const areaData = [
    { name: 'Oct', users: Math.floor(growthFactor * 1) },
    { name: 'Nov', users: Math.floor(growthFactor * 1.5) },
    { name: 'Dec', users: Math.floor(growthFactor * 2.2) },
    { name: 'Jan', users: Math.floor(growthFactor * 3.5) },
    { name: 'Feb', users: Math.floor(growthFactor * 4.8) },
    { name: 'Mar', users: usersCount || Math.floor(growthFactor * 6) }
  ];

  // Process data for Donut Chart (System Architectures/Roles mock)
  const pieData = [
    { name: "Attendees", value: Math.floor(usersCount * 0.8) || 80, color: "#FF007A" },
    { name: "Organizers", value: Math.floor(usersCount * 0.15) || 15, color: "#00D4FF" },
    { name: "Artists", value: Math.floor(usersCount * 0.05) || 5, color: "#10b981" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 w-full mb-8">
      {/* User Growth Area Chart */}
      <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-xl overflow-hidden lg:col-span-2 relative group">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-sky-500 opacity-50" />
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2 text-gray-400">
            <Activity className="h-3 w-3 text-emerald-400" />
            Global Network Expansion
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="adminAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="adminStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#050505', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                cursor={{ stroke: '#ffffff20', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="url(#adminStrokeGradient)" 
                strokeWidth={3}
                fill="url(#adminAreaGradient)"
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff' }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Role Distribution Donut Chart */}
      <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-xl overflow-hidden lg:col-span-1 relative">
        <CardHeader className="pb-0">
          <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2 text-gray-400">
            <PieChartIcon className="h-3 w-3 text-sky-400" />
            Entity Composition
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center p-0 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                contentStyle={{ backgroundColor: '#050505', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 0 20px rgba(14,165,233,0.2)' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                cursor={{ fill: 'transparent' }}
              />
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}80)` }} />
                ))}
              </Pie>
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                formatter={(value) => <span style={{ color: '#888', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

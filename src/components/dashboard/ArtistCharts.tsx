"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Calendar, PieChart as PieChartIcon, Target } from "lucide-react";

export function ArtistCharts({ gigs }: { gigs: any[] }) {
  // Process Gigs for Bar Chart (Gigs per month)
  const monthlyData: Record<string, number> = {};
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  
  if (gigs.length === 0) {
    months.forEach((m) => { monthlyData[m] = 0; });
  } else {
    months.forEach((m) => { monthlyData[m] = 0; }); // init
    gigs.forEach(g => {
       if (g.date_time?.start) {
         const month = new Date(g.date_time.start).toLocaleString('default', { month: 'short' });
         if (monthlyData[month] !== undefined) monthlyData[month] += 1;
       }
    });
  }

  const barData = Object.keys(monthlyData).map(month => ({
    name: month,
    gigs: monthlyData[month]
  }));

  // Process Gigs for Donut Chart (Gig Types)
  let djCount = 0;
  let liveCount = 0;
  
  if (gigs.length > 0) {
     gigs.forEach(g => {
        if (g.category === 'Electronic/DJ') djCount++;
        else liveCount++;
     });
  }

  const pieData = [
    { name: "Electronic", value: djCount || 1, color: "#8b5cf6" },
    { name: "Live Elements", value: liveCount || 0, color: "#FF007A" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 w-full mb-8">
      {/* Gigs Bar Chart */}
      <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-xl overflow-hidden lg:col-span-2 relative">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-600 opacity-50" />
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2 text-gray-400">
            <Target className="h-3 w-3 text-purple-400" />
            Performance Frequency Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="artistBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#7e22ce" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#050505', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 0 20px rgba(168,85,247,0.2)' }}
                itemStyle={{ color: '#c084fc', fontWeight: 'bold' }}
                cursor={{ fill: '#ffffff05' }}
              />
              <Bar 
                dataKey="gigs" 
                fill="url(#artistBarGradient)" 
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Set Types Donut Chart */}
      <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-xl overflow-hidden lg:col-span-1 relative">
        <CardHeader className="pb-0">
          <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2 text-gray-400">
            <PieChartIcon className="h-3 w-3 text-purple-400" />
            Set Classification
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center p-0 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                contentStyle={{ backgroundColor: '#050505', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 0 20px rgba(168,85,247,0.2)' }}
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

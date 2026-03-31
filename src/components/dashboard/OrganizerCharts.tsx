"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

export function OrganizerCharts({ bookings, events }: { bookings: any[], events: any[] }) {
  // Process Booking Data for Line Chart (Revenue Over Time)
  const monthlyData: Record<string, number> = {};
  const sortedBookings = [...bookings].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  if (sortedBookings.length === 0) {
    // Mock data if no bookings
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    months.forEach((m, i) => {
      monthlyData[m] = i === 5 ? 0 : 0;
    });
  } else {
    sortedBookings.forEach((b: any) => {
      const month = new Date(b.created_at).toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + (Number(b.final_amount) || 0);
    });
  }

  const lineData = Object.keys(monthlyData).map(month => ({
    name: month,
    revenue: monthlyData[month]
  }));

  // Process Event Data for Donut Chart (Event Status)
  let publishedCount = 0;
  let draftCount = 0;
  events.forEach(e => {
    if (e.status === 'published') publishedCount++;
    else draftCount++;
  });

  const pieData = [
    { name: "Published", value: publishedCount || 1, color: "#00D4FF" },
    { name: "Draft/Other", value: draftCount || 0, color: "#FF007A" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 w-full">
      {/* Revenue Line Chart */}
      <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-xl overflow-hidden lg:col-span-2 relative">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-violet-500 to-[#00D4FF] opacity-50" />
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2 text-gray-400">
            <BarChart3 className="h-3 w-3 text-violet-400" />
            Revenue Trajectory (INR)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="orgLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#00D4FF" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} dx={-10} tickFormatter={(value) => `₹${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#050505', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}
                itemStyle={{ color: '#00D4FF', fontWeight: 'bold' }}
                cursor={{ stroke: '#ffffff20', strokeWidth: 1 }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="url(#orgLineGradient)" 
                strokeWidth={3}
                dot={{ fill: '#0A0D15', stroke: '#00D4FF', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#00D4FF', stroke: '#fff' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Donut Chart */}
      <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-xl overflow-hidden lg:col-span-1 relative">
        <CardHeader className="pb-0">
          <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2 text-gray-400">
            <PieChartIcon className="h-3 w-3 text-[#00D4FF]" />
            Deployment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center p-0 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                contentStyle={{ backgroundColor: '#050505', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}
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

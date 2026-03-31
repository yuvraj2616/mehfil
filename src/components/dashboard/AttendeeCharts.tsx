"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";

const COLORS = ["#FF007A", "#00D4FF", "#7C3AED", "#10B981", "#F59E0B"];

export function AttendeeCharts({ bookings }: { bookings: any[] }) {
  // Process data for trends (last 6 months booking count)
  const trendsData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Generate last 6 months labels
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toLocaleString("default", { month: "short" });
      counts[month] = 0;
    }

    bookings.forEach((b: any) => {
      if (!b.created_at) return;
      const d = new Date(b.created_at);
      const month = d.toLocaleString("default", { month: "short" });
      if (counts[month] !== undefined) {
        counts[month] += 1;
      }
    });

    return Object.keys(counts).map((month) => ({
      name: month,
      Bookings: counts[month],
    }));
  }, [bookings]);

  // Process data for category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    let hasCategories = false;

    bookings.forEach((b: any) => {
      const cat = b.event?.category || "uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
      hasCategories = true;
    });

    // Provide some mock data if no real categories exist (for the UI redesign showcase)
    if (!hasCategories || Object.keys(counts).length === 0) {
      return [
        { name: "Music", value: 35 },
        { name: "Comedy", value: 25 },
        { name: "Theater", value: 20 },
        { name: "Tech", value: 10 },
        { name: "Other", value: 10 },
      ];
    }

    return Object.keys(counts).map((cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: counts[cat],
    }));
  }, [bookings]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#050505]/90 backdrop-blur-md border border-gray-800 p-3 rounded-lg shadow-2xl">
          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{label}</p>
          <p className="text-sm font-black text-white">
            <span style={{ color: payload[0].color || "#FF007A" }}>{payload[0].name}:</span> {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-xl overflow-hidden relative group transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,0,122,0.15)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF007A] to-purple-600 opacity-80" />
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2 text-gray-400">
            <TrendingUp className="h-4 w-4 text-[#FF007A]" />
            Booking Activity (6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF007A" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF007A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#555" 
                  tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#555" 
                  tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} 
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333', strokeWidth: 1 }}/>
                <Line 
                  type="monotone" 
                  dataKey="Bookings" 
                  stroke="#FF007A" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#050505', stroke: '#FF007A', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#FF007A', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-xl overflow-hidden relative group transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_15px_rgba(0,212,255,0.15)]">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00D4FF] to-blue-600 opacity-80" />
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2 text-gray-400">
            <PieChartIcon className="h-4 w-4 text-[#00D4FF]" />
            Genre Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mt-4 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value, entry: any, index) => (
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mr-4">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

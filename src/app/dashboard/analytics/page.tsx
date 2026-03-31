import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalAnalyticsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-800 pb-6 mb-6">
         <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Global <span className="text-[#FF007A] italic">Analytics</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Advanced telemetry and intelligence visualization</p>
         </div>
      </div>

      <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-xl overflow-hidden relative">
         <div className="absolute inset-0 bg-[#FF007A]/5 backdrop-blur-3xl z-0 pointer-events-none" />
         <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center relative z-10">
            <div className="p-6 rounded-full bg-[#FF007A]/10 border border-[#FF007A]/20 mb-6 relative group">
               <div className="absolute inset-0 bg-[#FF007A]/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
               <BarChart3 className="h-12 w-12 text-[#FF007A] relative z-10" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">Telemetry Engine Offline</h2>
            <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider font-mono flex items-center gap-2">
               <AlertTriangle className="h-3 w-3 text-amber-500" />
               Awaiting Timeseries Database Integration
            </p>
            <Button disabled className="bg-[#FF007A]/20 text-[#FF007A] cursor-not-allowed border-[#FF007A]/30">
               Data Stream Unavailable
            </Button>
         </CardContent>
      </Card>
    </div>
  );
}

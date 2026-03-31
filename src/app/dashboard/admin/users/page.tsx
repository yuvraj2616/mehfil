import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-800 pb-6 mb-6">
         <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Root <span className="text-sky-400 italic">User Control</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Global identity management subsystem</p>
         </div>
         <Link href="/dashboard/admin">
            <Button variant="outline" className="border-gray-800 text-gray-400 hover:text-white rounded-full text-[10px] uppercase font-bold tracking-widest">
               Back to Hub
            </Button>
         </Link>
      </div>

      <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-xl overflow-hidden relative">
         <div className="absolute inset-0 bg-sky-500/5 backdrop-blur-3xl z-0 pointer-events-none" />
         <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center relative z-10 z-10">
            <div className="p-6 rounded-full bg-sky-500/10 border border-sky-500/20 mb-6 relative group">
               <div className="absolute inset-0 bg-sky-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
               <Users className="h-12 w-12 text-sky-400 relative z-10" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">Subsystem Offline</h2>
            <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider font-mono flex items-center gap-2">
               <AlertTriangle className="h-3 w-3 text-amber-500" />
               Awaiting Database Hook Integration
            </p>
            <Button disabled className="bg-sky-500/20 text-sky-400 cursor-not-allowed border-sky-500/30">
               Access Restricted
            </Button>
         </CardContent>
      </Card>
    </div>
  );
}

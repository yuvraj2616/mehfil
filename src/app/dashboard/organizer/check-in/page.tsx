"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScanLine, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function CheckInPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    
    await processCode(code);
  }

  async function processCode(checkInCode: string) {
    setIsProcessing(true);
    setLastResult(null);

    try {
      const response = await fetch("/api/bookings/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: checkInCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLastResult({
          success: false,
          error: data.error,
          scannedAt: data.scannedAt
        });
        toast.error(data.error || "Check-in parameters invalid");
      } else {
        setLastResult({
          success: true,
          eventTitle: data.eventTitle,
          tickets: data.tickets
        });
        toast.success("Access Granted");
        setCode(""); // Clear input on success
      }
    } catch (error: any) {
      toast.error("Network communication failure. Retrying...");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="container max-w-lg mx-auto py-12 px-4 space-y-12">
      <div className="text-center relative">
        <Link
          href="/dashboard/organizer"
          className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase hover:text-white mb-8 inline-flex items-center transition-colors bg-[#0A0D15] border border-gray-800 px-4 py-2 rounded-full absolute left-0 top-0"
        >
          <ArrowLeft className="mr-2 h-3 w-3" /> Dashboard
        </Link>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 mb-6 mx-auto mt-16 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <ScanLine className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-white">
          Access <span className="text-emerald-500 italic">Scanner</span>
        </h1>
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">
          Manual input terminal. Awaiting CHK- code.
        </p>
      </div>

      <Card className="bg-[#0A0D15] border-gray-800 overflow-hidden shadow-2xl shadow-emerald-500/5 rounded-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-xs uppercase font-black tracking-widest text-white">Manual Input Vector</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CHK-A1B2C3D4"
              className="font-mono text-2xl tracking-[0.2em] uppercase text-center bg-[#050505] border-gray-800 focus-visible:ring-emerald-500/50 h-16 shadow-inner text-white placeholder:text-gray-700"
              disabled={isProcessing}
            />
            <Button
              type="submit"
              disabled={isProcessing || code.length < 5}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-sm h-14 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform hover:scale-105 w-full mt-2"
            >
              {isProcessing ? "[ SCANNING ]" : "Authenticate code"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result Card */}
      {lastResult && (
        <Card className={`border-2 rounded-2xl animate-in zoom-in-95 duration-200 ${lastResult.success ? 'border-emerald-500/50 bg-[#050505] shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'border-rose-500/50 bg-[#050505] shadow-[0_0_30px_rgba(244,63,94,0.15)]'}`}>
          <CardContent className="p-10 text-center relative overflow-hidden">
            {lastResult.success && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />}
            {!lastResult.success && <div className="absolute inset-0 bg-rose-500/5 animate-pulse cursor-wait" />}
            
            <div className="relative z-10">
              {lastResult.success ? (
                <>
                  <div className="mx-auto bg-emerald-500/10 w-24 h-24 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-emerald-500 mb-2">Access Granted</h3>
                  <p className="font-bold text-sm tracking-widest text-white uppercase">{lastResult.eventTitle}</p>
                  <div className="mt-8 pt-6 border-t border-emerald-500/20 text-xs font-bold uppercase tracking-wider text-emerald-400/80">
                    {lastResult.tickets?.map((t: any, idx: number) => (
                      <div key={idx} className="flex justify-center items-center gap-3 bg-emerald-500/10 py-2 px-4 rounded-lg inline-flex mx-auto border border-emerald-500/20">
                        <span className="font-black text-emerald-500 text-lg">{t.quantity}×</span> {t.tier}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto bg-rose-500/10 w-24 h-24 rounded-full flex items-center justify-center mb-6 border border-rose-500/30">
                    <AlertCircle className="h-12 w-12 text-rose-500" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-rose-500 mb-2">Access Denied</h3>
                  <p className="font-bold text-xs tracking-widest text-gray-400 uppercase">{lastResult.error}</p>
                  {lastResult.scannedAt && (
                    <p className="text-[10px] mt-6 bg-rose-500/10 text-rose-500/80 px-4 py-2 rounded-full inline-block font-bold">
                      INITIAL SCAN: {new Date(lastResult.scannedAt).toLocaleTimeString("en-IN")}
                    </p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-[10px] uppercase font-bold tracking-[0.2em] text-gray-600 bg-[#050505] border border-gray-800 p-6 rounded-2xl border-dashed">
        <p>Optical scanner interface currently offline.</p>
        <p className="mt-2 text-primary">Awaiting camera module integration.</p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchAPIClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, QrCode, Calendar, MapPin, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("booking");
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      
      // Get auth token for the authenticated request
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || null;

      const data = await fetchAPIClient(`/bookings/${bookingId}`, token);

      if (data?.error) {
        console.error(data.error);
        toast.error("Could not load booking details");
      } else {
        setBooking(data?.booking);
      }
      setLoading(false);
    }
    loadBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6 text-center bg-[#050505] text-white">
        <h2 className="text-3xl font-black uppercase tracking-wider">Booking Incomplete</h2>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Could not resolve booking signal.</p>
        <Link href="/dashboard/attendee">
          <Button variant="outline" className="border-gray-800 text-white hover:bg-white hover:text-black rounded-full uppercase tracking-widest font-bold text-[10px] px-6 py-4 h-auto">
            Return to Base
          </Button>
        </Link>
      </div>
    );
  }

  const { event } = booking;

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none" />

      <div className="container max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-8 relative border border-primary/20">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Transmission <span className="text-primary font-cursive text-6xl lowercase align-middle">secured</span></h1>
          <p className="text-sm font-bold tracking-[0.2em] text-gray-400 uppercase">
            Access codes for <strong className="text-white">{event?.title}</strong> acquired.
          </p>
        </div>

        <Card className="bg-[#0A0D15] border-gray-800 overflow-hidden mb-12 shadow-[0_0_40px_rgba(255,0,122,0.15)] rounded-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-600 to-primary"></div>
          <CardContent className="p-0 sm:flex relative z-10">
            
            {/* Left part: Event info */}
            <div className="p-10 sm:w-2/3 border-b sm:border-b-0 sm:border-r border-gray-800 border-dashed relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <div className="font-mono text-9xl font-black">{new Date().getDate().toString().padStart(2, '0')}</div>
              </div>

              <Badge variant="outline" className="mb-8 bg-primary/10 text-primary border-primary/30 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1">
                Authorization Valid
              </Badge>
              
              <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter leading-none">{event?.title}</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-[#111] p-3 rounded-xl border border-gray-800">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-sm uppercase tracking-wider">
                      {event?.date_time?.start ? new Date(event?.date_time?.start).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Date TBD"}
                    </p>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                      {event?.date_time?.start ? new Date(event?.date_time?.start).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) : "Time TBD"}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="bg-[#111] p-3 rounded-xl border border-gray-800">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-sm uppercase tracking-wider">{event?.venue?.name || "Venue TBD"}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                      {event?.venue?.address}, {event?.venue?.city}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-800 border-dashed">
                <h4 className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] mb-6">Manifest Variables</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-[#050505] p-3 rounded-lg border border-gray-800">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Hash ID</span>
                    <span className="font-black font-mono text-xs text-white">{booking.booking_id}</span>
                  </div>
                  {booking.tickets?.map((t: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-[#050505] p-3 rounded-lg border border-gray-800">
                      <span className="text-xs uppercase font-bold text-gray-400 tracking-wider"><span className="text-white">{t.quantity}</span> × {t.tier} PROTOCOL</span>
                      <span className="font-bold">₹{(t.quantity * t.price).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-4 mt-2 font-black text-xl uppercase tracking-tighter items-end">
                    <span className="text-gray-500 text-sm">Value EXCHANGED</span>
                    <span className="text-primary">₹{booking.final_amount?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right part: QR Code */}
            <div className="p-10 sm:w-1/3 bg-[#050505] flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Scanline effect */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/50 opacity-50 animate-scan pointer-events-none"></div>

              <h3 className="font-black text-sm uppercase tracking-[0.2em] mb-2 text-white">Entry Matrix</h3>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-10">Present at Gate</p>
              
              <div className="bg-white p-4 rounded-xl mb-8 relative">
                {/* Decorative corners */}
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                
                {booking.check_in?.code ? (
                  <QRCodeSVG
                    value={booking.check_in.code}
                    size={160}
                    bgColor={"#FFFFFF"}
                    fgColor={"#000000"}
                    level={"H"}
                    includeMargin={false}
                  />
                ) : (
                  <QrCode className="w-40 h-40 text-black outline-none opacity-20" strokeWidth={1.5} />
                )}
              </div>
              
              <p className="font-mono text-xl font-black tracking-[0.4em] bg-[#111] border border-gray-800 px-6 py-3 rounded-xl text-white shadow-inner">
                {booking.check_in?.code || "PENDING"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
          <Link href="/dashboard/attendee" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full h-14 rounded-full border-gray-800 text-white hover:bg-white hover:text-black font-bold uppercase tracking-[0.2em] text-[10px] transition-colors">
              <ArrowLeft className="mr-3 h-4 w-4" />
              Main Console
            </Button>
          </Link>
          <Button className="w-full sm:w-auto h-14 rounded-full bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_0_20px_rgba(255,0,122,0.3)] transition-transform hover:scale-105">
            <Download className="mr-3 h-4 w-4" />
            Extract Ticket
          </Button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; opacity: 1; }
          51% { opacity: 0; top: 100%; }
          100% { opacity: 0; top: 0; }
        }
        .animate-scan {
          animation: scan 3s infinite linear;
        }
      `}} />
    </div>
  );
}

// Needed to silence SSR warnings related to useSearchParams
import { Suspense } from 'react';

export function BookingSuccessWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#050505] justify-center items-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"/>
      </div>
    }>
      <BookingSuccessPage />
    </Suspense>
  );
}

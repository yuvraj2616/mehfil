"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { fetchAPIClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Ticket, IndianRupee, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Make sure window.Razorpay is recognized
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useUser();

  const preselectedTicket = searchParams.get("ticket");
  const preselectedQty = parseInt(searchParams.get("qty") || "1", 10);

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [ticketSelection, setTicketSelection] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      // Load event from Express backend (no auth needed for public event)
      const data = await fetchAPIClient(`/events/${id}`, null);

      if (!data?.event) {
        toast.error("Failed to load event for checkout");
      } else {
        setEvent(data.event);
        if (preselectedTicket && !ticketSelection[preselectedTicket]) {
          setTicketSelection({ [preselectedTicket]: preselectedQty });
        } else if (Object.keys(ticketSelection).length === 0 && data.event.ticketing?.length > 0) {
          setTicketSelection({ [data.event.ticketing[0].name]: 1 });
        }
      }
      setLoading(false);
    }
    loadEvent();
  }, [id, preselectedTicket, preselectedQty]);

  function handleQtyChange(tierName: string, delta: number) {
    setTicketSelection((prev) => {
      const current = prev[tierName] || 0;
      const next = Math.max(0, current + delta);
      const newSelection = { ...prev, [tierName]: next };
      if (next === 0) delete newSelection[tierName];
      return newSelection;
    });
  }

  // Calculate totals
  let subtotal = 0;
  let totalItems = 0;
  const selectedTiers: Array<{ tier: string; price: number; quantity: number }> = [];

  if (event && event.ticketing) {
    for (const [tierName, qty] of Object.entries(ticketSelection)) {
      const tierDef = event.ticketing.find((t: any) => t.name === tierName);
      if (tierDef && qty > 0) {
        subtotal += tierDef.price * qty;
        totalItems += qty;
        selectedTiers.push({ tier: tierName, price: tierDef.price, quantity: qty });
      }
    }
  }

  const convenienceFee = subtotal > 0 ? Math.round(subtotal * 0.02 + 5) : 0;
  const totalAmount = subtotal + convenienceFee;

  async function handleCheckout() {
    if (!user) {
      toast.error("Please login to complete your booking.");
      router.push(`/auth?redirect=/events/${id}/book`);
      return;
    }

    if (totalItems === 0) {
      toast.error("Please select at least one ticket.");
      return;
    }

    setProcessing(true);
    try {
      // Get auth token for API calls
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || null;

      const bookingData = await fetchAPIClient("/bookings", token, {
        method: "POST",
        body: JSON.stringify({
          eventId: event.id,
          tickets: selectedTiers,
          totalAmount,
        }),
      });

      if (bookingData?.error) throw new Error(bookingData.error);
      const booking = bookingData.booking;

      toast.info("Booking created, initiating payment...", { id: "payment-toast" });

      const orderData = await fetchAPIClient("/payments/create-order", token, {
        method: "POST",
        body: JSON.stringify({ bookingId: booking.id }),
      });

      if (orderData?.error) throw new Error(orderData.error);
      const { orderId, amount, currency } = orderData;

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please try again.");
      }

      toast.dismiss("payment-toast");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: amount.toString(),
        currency: currency,
        name: "Mehfil Platform",
        description: `Booking for ${event.title}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            toast.loading("Verifying payment...", { id: "verify-toast" });
            const verifyData = await fetchAPIClient("/payments/verify", token, {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id,
              }),
            });

            if (verifyData?.error) throw new Error(verifyData.error);

            toast.success("Payment successful! Redirecting...", { id: "verify-toast" });
            router.push(`/events/${event.id}/book/success?booking=${booking.id}`);
          } catch (err: any) {
            toast.error(err.message || "Something went wrong verifying the payment", { id: "verify-toast" });
            setProcessing(false);
          }
        },
        prefill: {
          name: user.name || (user as any).user_metadata?.name || user.email?.split("@")[0],
          email: user.email,
        },
        theme: {
          color: "#FF007A", // Hot Pink
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        toast.error("Payment failed or cancelled.");
        console.error("Payment failed", response.error);
        setProcessing(false);
      });
      
      rzp.open();
      
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
      setProcessing(false);
    }
  }

  if (loading || userLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-[#050505]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6 text-center bg-[#050505] text-white">
        <h2 className="text-3xl font-black uppercase tracking-wider">Event not found</h2>
        <Button onClick={() => router.push("/events")} variant="outline" className="border-gray-800 text-white hover:bg-white hover:text-black rounded-full uppercase tracking-widest font-bold">Back to Directory</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <Link
            href={`/events/${id}`}
            className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Link>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Secure <span className="text-primary font-cursive text-6xl lowercase align-middle">checkout</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Ticket Selection */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#0A0D15] border border-gray-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-8 flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                Select Tickets
              </h2>
              
              <div className="space-y-4">
                {event.ticketing?.map((tier: any) => (
                  <div key={tier.name} className="flex items-center justify-between p-6 rounded-xl bg-[#050505] border border-gray-800 transition-colors hover:border-primary/30">
                    <div>
                      <h3 className="font-black text-xl uppercase tracking-tighter">{tier.name}</h3>
                      <p className="text-primary font-bold flex items-center gap-0.5 mt-1 text-lg">
                        <IndianRupee className="h-4 w-4" />
                        {tier.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 bg-[#0A0D15] border border-gray-800 rounded-full p-1">
                      <button
                        onClick={() => handleQtyChange(tier.name, -1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 text-white disabled:opacity-30 transition-colors"
                        disabled={!ticketSelection[tier.name]}
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-black text-lg">
                        {ticketSelection[tier.name] || 0}
                      </span>
                      <button
                        onClick={() => handleQtyChange(tier.name, 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 text-white disabled:opacity-30 transition-colors"
                        disabled={(ticketSelection[tier.name] || 0) >= tier.quantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                {(!event.ticketing || event.ticketing.length === 0) && (
                  <div className="text-center py-12 bg-[#050505] border border-gray-800 rounded-xl">
                    <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">This event has no active ticket tiers.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Attendee Info Stub */}
            {user && (
              <div className="bg-[#0A0D15] border border-gray-800 rounded-2xl p-8">
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-8">
                  Attendee Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-2 block">Full Name</label>
                    <div className="h-14 bg-[#050505] border border-gray-800 rounded px-4 flex items-center text-sm font-bold text-gray-300">
                      {user.name || (user as any).user_metadata?.name || "Attendee Name"}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-2 block">Email Address</label>
                    <div className="h-14 bg-[#050505] border border-gray-800 rounded px-4 flex items-center text-sm font-bold text-gray-300">
                      {user.email}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold mt-6 text-center">
                  Tickets will be dispatched to the email above.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <Card className="bg-[#0A0D15] border-gray-800 sticky top-28 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-600 to-primary" />
              <CardContent className="p-8">
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-8">
                  Order Summary
                </h2>
                
                {/* Event preview */}
                <div className="flex gap-5 items-center mb-8 bg-[#050505] p-4 rounded-xl border border-gray-800">
                  <div className="w-16 h-16 rounded overflow-hidden bg-[#111] shrink-0">
                    {event.media?.banner ? (
                      <img src={event.media.banner} alt={event.title} className="w-full h-full object-cover grayscale" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tight line-clamp-2">{event.title}</h4>
                    <p className="text-[10px] font-bold tracking-widest text-primary uppercase mt-1">
                      {event.date_time?.start ? new Date(event.date_time.start).toLocaleDateString("en-IN") : "Date TBD"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {selectedTiers.length > 0 ? (
                    selectedTiers.map(t => (
                      <div key={t.tier} className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-400"><span className="text-white">{t.quantity}</span> × {t.tier}</span>
                        <span>₹{(t.price * t.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] font-bold tracking-widest text-gray-600 uppercase text-center py-2">No tickets selected</div>
                  )}
                </div>

                <div className="border-t border-gray-800 pt-6 space-y-4 mb-8">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Platform Fee</span>
                    <span className="text-white">₹{convenienceFee.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-8 mb-8">
                  <div className="flex justify-between items-center font-black text-2xl">
                    <span>TOTAL</span>
                    <span className="text-primary">₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-black rounded-full py-8 text-sm uppercase tracking-[0.2em] font-black shadow-[0_0_30px_rgba(255,0,122,0.4)] transition-transform hover:scale-[1.02]"
                  onClick={handleCheckout}
                  disabled={processing || totalItems === 0 || !user}
                >
                  {processing ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-5 w-5" />
                  )}
                  {processing ? "[ PROCESSING ]" : `PAY ₹${totalAmount.toLocaleString("en-IN")}`}
                </Button>
                
                {!user && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-center text-gray-500 mt-6">
                    <Link href={`/auth?redirect=/events/${id}/book`} className="text-primary hover:text-white transition-colors">Log in</Link> first to secure your spot.
                  </p>
                )}
                
                <div className="text-[8px] font-black uppercase text-gray-600 text-center mt-6 tracking-[0.2em]">
                  Powered by Razorpay
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = await request.json();

    // Verify cryptographic signature
    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update the payment status
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        payment_method: "card", // Generic for now, Razorpay provides details we could save
        gateway: {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          signature: razorpay_signature,
        },
      })
      .eq("booking_id", bookingId)
      .eq("payer_id", user.id)
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Generate a secure QR/Check-in code
    const checkInCode = `CHK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Update the booking status
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        check_in: {
          code: checkInCode,
          scanned: false,
        },
        payment_details: {
          payment_id: payment.id,
          razorpay_payment_id,
        },
      })
      .eq("id", bookingId)
      .eq("attendee_id", user.id);

    if (bookingError) throw bookingError;

    return NextResponse.json({ success: true, checkInCode });
  } catch (error: any) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
    }

    // Fetch the pending booking and payment
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("id, amount")
      .eq("booking_id", bookingId)
      .eq("payer_id", user.id)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: "Invalid payment record" }, { status: 400 });
    }

    // Amount in Razorpay is in paise (multiply by 100)
    const amountInPaise = Math.round(Number(payment.amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${payment.id.substring(0, 10)}`,
      payment_capture: 1, // Auto capture
    };

    const order = await razorpay.orders.create(options);

    // Update payment record with the gateway order ID
    await supabase
      .from("payments")
      .update({
        gateway: { order_id: order.id },
      })
      .eq("id", payment.id);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Create Razorpay order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

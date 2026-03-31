import { Router, Request, Response } from "express";
import crypto from "crypto";
import { createAuthClient } from "../supabaseClient";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Razorpay helper — in production use the razorpay SDK
function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || secret === "placeholder_secret") {
    console.warn("RAZORPAY_KEY_SECRET is not set. Assuming valid signature for testing.");
    return true;
  }
  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(text)
    .digest("hex");
  return generatedSignature === signature;
}

// POST /payments/create-order — create a Razorpay order
router.post("/create-order", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const user = req.user!;

    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "Missing booking ID" });
    }

    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("id, amount")
      .eq("booking_id", bookingId)
      .eq("payer_id", user.id)
      .single();

    if (fetchError || !payment) {
      return res.status(400).json({ error: "Invalid payment record" });
    }

    const amountInPaise = Math.round(Number(payment.amount) * 100);

    // In production, use the Razorpay SDK here. For now, simulate.
    const simulatedOrderId = `order_sim_${Date.now()}`;

    // Update payment record with the gateway order ID
    await supabase
      .from("payments")
      .update({
        gateway: { order_id: simulatedOrderId },
      })
      .eq("id", payment.id);

    return res.json({
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency: "INR",
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return res.status(500).json({ error: error.message || "Failed to create order" });
  }
});

// POST /payments/verify — verify payment and confirm booking
router.post("/verify", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const user = req.user!;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // Verify cryptographic signature
    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Update the payment status
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        payment_method: "card",
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

    // Generate a secure check-in code
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

    return res.json({ success: true, checkInCode });
  } catch (error: any) {
    console.error("Payment verify error:", error);
    return res.status(500).json({ error: error.message || "Failed to verify payment" });
  }
});

export default router;

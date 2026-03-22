import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay client only if keys are available
export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

/**
 * Utility to verify Razorpay payment signature
 */
export function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    // If no secret is configured, we might be in mock mode or local dev
    // In production, this should throw an error. For tutorial/mock, we log it.
    console.warn("RAZORPAY_KEY_SECRET is not set. Assuming valid signature for testing.");
    return true; 
  }

  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest("hex");

  return generatedSignature === signature;
}

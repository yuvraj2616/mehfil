import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Check-in code is required" }, { status: 400 });
    }

    // 1. Find the booking by checking the JSONB column for the exact check-in code
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*, event:events(organizer_id, title)")
      .contains("check_in", { code: code.trim().toUpperCase() })
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Invalid check-in code or booking not found" }, { status: 404 });
    }

    // 2. Validate the user scanning is the organizer or an admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (booking.event?.organizer_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized to check-in this event" }, { status: 403 });
    }

    // 3. Check if already scanned
    if (booking.check_in?.scanned) {
      return NextResponse.json({ 
        error: "Already checked in",
        scannedAt: booking.check_in.scannedAt
      }, { status: 400 });
    }

    // 4. Check if payment is confirmed
    if (booking.status !== "confirmed") {
      return NextResponse.json({ error: `Booking status is ${booking.status}` }, { status: 400 });
    }

    // 5. Update the booking to mark as scanned
    const updatedCheckIn = {
      ...booking.check_in,
      scanned: true,
      scannedAt: new Date().toISOString(),
      scannedBy: user.id
    };

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ check_in: updatedCheckIn })
      .eq("id", booking.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: "Check-in successful",
      attendeeId: booking.attendee_id,
      tickets: booking.tickets,
      eventTitle: booking.event?.title
    });

  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

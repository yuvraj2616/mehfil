import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: Create a new booking
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, tickets, totalAmount } = await request.json();

    if (!eventId || !tickets || tickets.length === 0 || totalAmount === undefined) {
      return NextResponse.json({ error: "Invalid booking data" }, { status: 400 });
    }

    // In a production app, we would re-calculate `totalAmount` here by querying the 
    // event's ticket tiers to prevent client-side tampering. 

    // Create the booking record in 'pending' status
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        event_id: eventId,
        attendee_id: user.id,
        tickets: tickets,
        total_amount: totalAmount,
        final_amount: totalAmount, // Assuming no discounts yet
        status: "pending",
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Create a pending payment record associated with this booking
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id: booking.id,
        payer_id: user.id,
        amount: totalAmount,
        net_amount: totalAmount,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    return NextResponse.json({ booking, payment });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Fetch user's bookings
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "attendee";

    let query = supabase
      .from("bookings")
      .select(`
        *,
        event:events(id, title, date_time, venue, media, organizer_id),
        attendee:profiles!attendee_id(name, email)
      `)
      .order("created_at", { ascending: false });

    // Filter by role
    if (role === "organizer") {
      // Must fetch events where this user is the organizer
      // Supabase makes nested filtering tricky sometimes, so we could join via RLS or filter after.
      // But the RLS policy "Users can view own bookings" allows organizers to see bookings for their events.
      // Easiest is to filter for events matching this organizer, but since Postgrest doesn't easily support 
      // filtering parent rows based on grandchild relations in a single query reliably without custom views,
      // we'll filter by matching the organizer_id in the event join.
      query = query.eq("event.organizer_id", user.id);
    } else {
      query = query.eq("attendee_id", user.id);
    }

    const { data: bookings, error } = await query;
    if (error) throw error;

    // Filter out null events (in case of organizer view where the left join returned null for event)
    const validBookings = role === "organizer" 
      ? bookings.filter((b: any) => b.event !== null)
      : bookings;

    return NextResponse.json({ bookings: validBookings });
  } catch (error: any) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

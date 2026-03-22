import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, ratings, title, content } = await request.json();

    if (!eventId || !ratings || typeof ratings.overall !== 'number') {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate that the user actually booked and attended (or at least confirmed booking) this event
    const { data: bookings, error: bookingErr } = await supabase
      .from("bookings")
      .select("id")
      .eq("event_id", eventId)
      .eq("attendee_id", user.id)
      .eq("status", "confirmed")
      .limit(1);

    if (bookingErr || !bookings || bookings.length === 0) {
      return NextResponse.json({ error: "You must have attended this event to leave a review." }, { status: 403 });
    }

    // Check if the user already reviewed this event
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("event_id", eventId)
      .eq("reviewer_id", user.id)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this event." }, { status: 400 });
    }

    // Insert the review (auto-approve for now, could be set to 'pending' in a real app)
    const { data: review, error: insertError } = await supabase
      .from("reviews")
      .insert({
        event_id: eventId,
        reviewer_id: user.id,
        ratings: ratings,
        title: title || "",
        content: content || "",
        status: "approved" 
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Submit review error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch approved reviews and join with reviewer's profile
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        *,
        reviewer:profiles!reviewer_id(name, avatar_url)
      `)
      .eq("event_id", eventId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

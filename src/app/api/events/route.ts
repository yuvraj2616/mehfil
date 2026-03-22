import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/events — list events with filters
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const status = searchParams.get("status") || "published";
  const search = searchParams.get("search");
  const featured = searchParams.get("is_featured");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("events")
    .select("*, organizer:profiles!organizer_id(user_id, name, avatar, role)", { count: "exact" })
    .eq("status", status)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (city) {
    query = query.contains("venue", { city });
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (featured === "true") {
    query = query.eq("is_featured", true);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    events: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// POST /api/events — create a new event (organizer/admin only)
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || !["organizer", "admin"].includes(profile.role)) {
    return NextResponse.json(
      { error: "Only organizers and admins can create events" },
      { status: 403 }
    );
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("events")
    .insert({
      organizer_id: user.id,
      title: body.title,
      description: body.description || "",
      category: body.category || "cultural",
      tags: body.tags || [],
      date_time: body.date_time || {},
      venue: body.venue || {},
      artists: body.artists || [],
      ticketing: body.ticketing || [],
      media: body.media || {},
      status: body.status || "draft",
      is_featured: body.is_featured || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data }, { status: 201 });
}

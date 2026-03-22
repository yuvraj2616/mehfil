"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  phone: string;
  role: "admin" | "organizer" | "artist" | "attendee";
  avatar: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export function useUser() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return profile as UserProfile | null;
    },
  });
}

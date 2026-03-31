import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase env credentials");
}

export function createAuthClient(token: string) {
  // Create a Supabase client configured to send the user's JWT
  // This ensures Row Level Security (RLS) is applied correctly.
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}

// For operations that don't need auth or just generic queries 
// (still bounded by RLS for anon users)
export const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

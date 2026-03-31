/**
 * client-api.ts
 * 
 * Browser-side API client that automatically attaches the Supabase auth token
 * to all requests going to the Express backend (localhost:4000).
 * 
 * Usage:
 *   const { get, post, put, del } = useApiClient();
 *   const data = await get('/events');
 *   const result = await post('/bookings/check-in', { code: 'CHK-XXXX' });
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Get the Supabase access token from the browser session
async function getAccessToken(): Promise<string | null> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

// Core fetch wrapper that auto-injects Authorization header
async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // For non-JSON responses (e.g. 204 No Content)
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }

  return data;
}

// Convenient HTTP method helpers
export const clientApi = {
  get: (path: string) => apiFetch(path),
  post: (path: string, body?: any) =>
    apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body?: any) =>
    apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
  del: (path: string) => apiFetch(path, { method: "DELETE" }),
  patch: (path: string, body?: any) =>
    apiFetch(path, { method: "PATCH", body: JSON.stringify(body) }),
};

export default clientApi;

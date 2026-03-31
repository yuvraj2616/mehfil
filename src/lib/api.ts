import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Server-side fetch helper that extracts the Supabase auth token
 * from Next.js cookies and forwards it to the Express backend.
 */
export async function fetchAPI(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const cookieStore = await cookies();
  // Supabase stores the access token in a cookie like sb-<ref>-auth-token
  // The cookie value is a JSON array: [access_token, refresh_token]
  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find((c) => c.name.includes("auth-token"));

  let token: string | null = null;
  if (authCookie) {
    try {
      // Supabase SSR stores tokens as a base64-encoded JSON array split across chunks
      // Try to reassemble chunked cookies first
      const baseName = authCookie.name.replace(/\.\d+$/, "");
      const chunks = allCookies
        .filter((c) => c.name === baseName || c.name.startsWith(baseName + "."))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => c.value);
      const combined = chunks.join("");
      const decoded = JSON.parse(
        Buffer.from(combined.replace(/^base64-/, ""), "base64").toString("utf-8")
      );
      token = decoded?.access_token || decoded?.[0] || null;
    } catch {
      // Fallback: try parsing directly
      try {
        const parsed = JSON.parse(authCookie.value);
        token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token || null;
      } catch {
        token = authCookie.value;
      }
    }
  }

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
    cache: "no-store",
  });

  return res.json();
}


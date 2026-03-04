import { headers } from "next/headers";

/**
 * Returns the absolute base URL for server-side fetch calls.
 * - In production it uses forwarded headers (Vercel / proxies).
 * - In development it falls back to NEXT_PUBLIC_SITE_URL or http://localhost:3000.
 */
export async function getBaseUrl() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");

  if (host) return `${proto}://${host}`;

  // Fallback (dev / edge cases)
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

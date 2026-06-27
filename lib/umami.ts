/**
 * Umami API client (self-hosted, v2/v3) — server-only.
 *
 * Reads audience stats from the self-hosted Umami instance so they can be
 * surfaced inside the future Photos Parallèles back-office, without leaving the
 * admin. The tracking <Script> itself is injected in `app/layout.tsx`.
 *
 * Configured via environment variables (see `.env.production.example`):
 *   UMAMI_API_URL     internal Umami URL (e.g. http://umami:3000 in Docker)
 *   UMAMI_USERNAME    Umami admin username
 *   UMAMI_PASSWORD    Umami admin password
 *   UMAMI_WEBSITE_ID  website UUID in Umami (defaults to NEXT_PUBLIC_UMAMI_WEBSITE_ID)
 */
import "server-only";

const API = process.env.UMAMI_API_URL?.replace(/\/+$/, "");
const USERNAME = process.env.UMAMI_USERNAME;
const PASSWORD = process.env.UMAMI_PASSWORD;
const WEBSITE_ID =
  process.env.UMAMI_WEBSITE_ID || process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export function umamiConfigured(): boolean {
  return Boolean(API && USERNAME && PASSWORD && WEBSITE_ID);
}

// Module-level token cache (auto re-login on 401 or expiry).
let cachedToken: { token: string; expires: number } | null = null;

async function login(): Promise<string | null> {
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.token;
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    if (!data.token) return null;
    cachedToken = { token: data.token, expires: Date.now() + 50 * 60 * 1000 };
    return data.token;
  } catch {
    return null;
  }
}

async function apiGet<T>(path: string): Promise<T | null> {
  let token = await login();
  if (!token) return null;
  const call = (t: string) =>
    fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${t}` },
      cache: "no-store",
    });
  try {
    let res = await call(token);
    if (res.status === 401) {
      cachedToken = null;
      token = await login();
      if (!token) return null;
      res = await call(token);
    }
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type UmamiStats = {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
};

// Umami v3 returns flat numbers ({ pageviews: 123, ... }); v2 returned
// { pageviews: { value, prev } }. Tolerate both for robustness.
function statValue(v: unknown): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "value" in v) {
    return Number((v as { value: unknown }).value) || 0;
  }
  return 0;
}

export async function getStats(
  startAt: number,
  endAt: number,
): Promise<UmamiStats | null> {
  const raw = await apiGet<Record<string, unknown>>(
    `/api/websites/${WEBSITE_ID}/stats?startAt=${startAt}&endAt=${endAt}`,
  );
  if (!raw) return null;
  return {
    pageviews: statValue(raw.pageviews),
    visitors: statValue(raw.visitors),
    visits: statValue(raw.visits),
    bounces: statValue(raw.bounces),
    totaltime: statValue(raw.totaltime),
  };
}

export type UmamiMetric = { x: string | null; y: number };

export async function getMetrics(
  type: "path" | "referrer",
  startAt: number,
  endAt: number,
  limit = 8,
): Promise<UmamiMetric[]> {
  const raw = await apiGet<UmamiMetric[]>(
    `/api/websites/${WEBSITE_ID}/metrics?type=${type}&startAt=${startAt}&endAt=${endAt}&limit=${limit}`,
  );
  return raw ?? [];
}

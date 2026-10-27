import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "";

// ASSUMED from your plan. If Swagger shows different paths, change them here only.
export const AUTH_PATHS = {
  login: "/auth/login/",
  refresh: "/auth/refresh/",
  logout: "/auth/logout/",
};

const ACCESS = "sb_access";
const REFRESH = "sb_refresh";

export type Tokens = { access: string; refresh?: string };

function secondsLeft(token: string, fallback: number): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    if (typeof payload.exp === "number") {
      return Math.max(60, payload.exp - Math.floor(Date.now() / 1000));
    }
  } catch {}
  return fallback;
}

export async function setSession(t: Tokens) {
  const jar = await cookies();
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  jar.set(ACCESS, t.access, { ...base, maxAge: secondsLeft(t.access, 86400) });
  if (t.refresh) {
    jar.set(REFRESH, t.refresh, { ...base, maxAge: secondsLeft(t.refresh, 604800) });
  }
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS);
  jar.delete(REFRESH);
}

export async function getTokens() {
  const jar = await cookies();
  return { access: jar.get(ACCESS)?.value, refresh: jar.get(REFRESH)?.value };
}

export async function refreshTokens(refresh: string): Promise<Tokens | null> {
  try {
    const res = await fetch(`${BACKEND}${AUTH_PATHS.refresh}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data?.access) return null;
    // Refresh rotation is on, so a new refresh token may come back
    return { access: data.access as string, refresh: (data.refresh as string | undefined) ?? refresh };
  } catch {
    return null;
  }
}

// Blocks cross-site form posts. Browsers always send Origin on POST/PATCH/DELETE.
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
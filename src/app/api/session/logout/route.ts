import { NextResponse, type NextRequest } from "next/server";
import { AUTH_PATHS, BACKEND, clearSession, getTokens, sameOrigin } from "@/lib/admin/session";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ detail: "Forbidden." }, { status: 403 });
  }

  const { access, refresh } = await getTokens();

  // Best effort: blacklist the refresh token on the backend
  if (refresh) {
    try {
      await fetch(`${BACKEND}${AUTH_PATHS.logout}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        body: JSON.stringify({ refresh }),
        cache: "no-store",
      });
    } catch {}
  }

  await clearSession();
  return NextResponse.json({ ok: true });
}
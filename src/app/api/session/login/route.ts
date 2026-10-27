import { NextResponse, type NextRequest } from "next/server";
import { AUTH_PATHS, BACKEND, sameOrigin, setSession } from "@/lib/admin/session";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ detail: "Forbidden." }, { status: 403 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND}${AUTH_PATHS.login}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ detail: "Could not reach the server." }, { status: 502 });
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 429) {
      return NextResponse.json(
        { detail: "Too many attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }
    if (res.status >= 500 || res.status === 404) {
      return NextResponse.json(
        { detail: `Sign-in service error (${res.status}). Check the login path in session.ts.` },
        { status: 502 }
      );
    }
    return NextResponse.json({ detail: "Invalid email or password." }, { status: 401 });
  }

  if (!data?.access) {
    return NextResponse.json({ detail: "Unexpected response from the server." }, { status: 502 });
  }

  await setSession({ access: data.access, refresh: data.refresh });
  return NextResponse.json({ ok: true });
}
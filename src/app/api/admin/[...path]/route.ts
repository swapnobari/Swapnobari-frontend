import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  BACKEND,
  clearSession,
  getTokens,
  refreshTokens,
  sameOrigin,
  setSession,
} from "@/lib/admin/session";

type Ctx = { params: Promise<{ path: string[] }> };

function forward(
  req: NextRequest,
  path: string[],
  body: ArrayBuffer | undefined,
  access: string
) {
  // Django needs the trailing slash, so we add it before the query string
  const url = `${BACKEND}/${path.map(encodeURIComponent).join("/")}/${req.nextUrl.search}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${access}`,
  };
  const type = req.headers.get("content-type");
  if (type && body) headers["Content-Type"] = type; // keeps the multipart boundary

  return fetch(url, { method: req.method, headers, body, cache: "no-store", redirect: "manual" });
}

async function handle(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;

  if (path.some((s) => !s || s === "." || s === "..")) {
    return NextResponse.json({ detail: "Bad path." }, { status: 400 });
  }

  const mutating = req.method !== "GET" && req.method !== "HEAD";
  if (mutating && !sameOrigin(req)) {
    return NextResponse.json({ detail: "Forbidden." }, { status: 403 });
  }

  const { access, refresh } = await getTokens();
  if (!access && !refresh) {
    return NextResponse.json({ detail: "Not signed in." }, { status: 401 });
  }

  // Buffer the body so we can replay it after a token refresh
  const body = mutating ? await req.arrayBuffer() : undefined;

  let res: Response | null = access ? await forward(req, path, body, access) : null;

  if ((!res || res.status === 401) && refresh) {
    const fresh = await refreshTokens(refresh);
    if (!fresh) {
      await clearSession();
      return NextResponse.json({ detail: "Session expired." }, { status: 401 });
    }
    await setSession(fresh);
    res = await forward(req, path, body, fresh.access);
  }

  if (!res || res.status === 401) {
    return NextResponse.json({ detail: "Session expired." }, { status: 401 });
  }

  // Make the public site show the change straight away
  if (mutating && res.ok) {
    try {
      revalidatePath("/", "layout");
    } catch {}
  }

  const out = new NextResponse(res.status === 204 ? null : res.body, { status: res.status });
  const type = res.headers.get("content-type");
  if (type) out.headers.set("content-type", type);
  return out;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
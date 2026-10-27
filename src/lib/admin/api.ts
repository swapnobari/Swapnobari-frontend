import { SubmitError } from "@/lib/client";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// path has a leading slash and no trailing slash, e.g. "/testimonials/3"
export async function adminApi<T = unknown>(
  method: Method,
  path: string,
  body?: FormData | Record<string, unknown>
): Promise<T> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body && !isForm) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`/api/admin${path}`, {
      method,
      headers,
      body: body ? (isForm ? (body as FormData) : JSON.stringify(body)) : undefined,
      cache: "no-store",
      credentials: "same-origin",
    });
  } catch {
    throw new SubmitError(0, { detail: "Network error. Please check your connection." });
  }

  if (res.status === 401 && typeof window !== "undefined") {
    const next = encodeURIComponent(window.location.pathname);
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/admin/login?next=${next}`;
    throw new SubmitError(401, { detail: "Session expired." });
  }

  let data: unknown = null;
  if (res.status !== 204) {
    try {
      data = await res.json();
    } catch {}
  }

  if (!res.ok) throw new SubmitError(res.status, data);
  return data as T;
}

export function errorText(e: unknown): string {
  if (e instanceof SubmitError) {
    const first = Object.entries(e.fields)[0];
    return e.detail || (first ? `${first[0]}: ${first[1][0]}` : "Something went wrong.");
  }
  return "Something went wrong.";
}
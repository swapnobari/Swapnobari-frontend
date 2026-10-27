const BASE = process.env.NEXT_PUBLIC_API_URL;

export type FieldErrors = Record<string, string[]>;

export class SubmitError extends Error {
  status: number;
  fields: FieldErrors = {};
  detail = "";

  constructor(status: number, body: unknown) {
    super("Request failed");
    this.status = status;

    if (body && typeof body === "object") {
      for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
        if (k === "detail" && typeof v === "string") this.detail = v;
        else if (k === "non_field_errors" && Array.isArray(v)) this.detail = v.join(" ");
        else if (Array.isArray(v)) this.fields[k] = v.map(String);
        else if (typeof v === "string") this.fields[k] = [v];
      }
    }

      if (!this.detail && Object.keys(this.fields).length === 0) {
      this.detail =
        status === 429
          ? "Too many requests. Please try again later."
          : status === 413
            ? "The file is too large to upload."
            : "Something went wrong. Please try again.";
    }
  }
}

async function request<T>(
  method: "GET" | "POST",
  path: string,
  body?: FormData | Record<string, unknown>
): Promise<T> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body && !isForm) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      cache: "no-store",
      body: body ? (isForm ? (body as FormData) : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new SubmitError(0, {
      detail: "Network error. Please check your connection and try again.",
    });
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) throw new SubmitError(res.status, data);
  return data as T;
}

export function submit<T>(path: string, body: FormData | Record<string, unknown>) {
  return request<T>("POST", path, body);
}

export function lookup<T>(path: string) {
  return request<T>("GET", path);
}
const BASE = process.env.NEXT_PUBLIC_API_URL;

if (!BASE) {
  throw new Error("NEXT_PUBLIC_API_URL is not set in .env.local");
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.status = status;
    this.body = body;
  }
}

type Options = RequestInit & { revalidate?: number };

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { revalidate = 60, ...init } = options;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init.headers },
    next: { revalidate },
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {}
    throw new ApiError(res.status, body);
  }
  return res.json() as Promise<T>;
}

// DRF paginated list shape (StandardPagination in your backend)
export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// Returns null on 404 so pages can call notFound()
export async function apiOrNull<T>(
  path: string,
  options?: Parameters<typeof api>[1]
): Promise<T | null> {
  try {
    return await api<T>(path, options);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
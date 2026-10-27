import type { Row } from "@/components/admin/types";

export function normaliseList(data: unknown): Row[] {
  if (Array.isArray(data)) return data as Row[];
  const results = (data as { results?: unknown } | null)?.results;
  return Array.isArray(results) ? (results as Row[]) : [];
}
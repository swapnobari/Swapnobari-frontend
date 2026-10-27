import { adminApi } from "./api";
import { normaliseList } from "./list";
import type { Row } from "@/components/admin/types";

export type Lookup = { key: string; endpoint: string; valueKey: string; labelKey: string };

// Adds a "<key>__label" field to each row, for example "group__label" holds the group's name
export async function withLookups(rows: Row[], lookups: Lookup[]): Promise<Row[]> {
  const maps = await Promise.all(
    lookups.map(async (l) => {
      try {
        const data = await adminApi<unknown>("GET", `${l.endpoint}?page_size=100`);
        return new Map(normaliseList(data).map((r) => [String(r[l.valueKey]), String(r[l.labelKey])]));
      } catch {
        return new Map<string, string>();
      }
    })
  );

  return rows.map((row) => {
    const out: Row = { ...row };
    lookups.forEach((l, i) => {
      out[`${l.key}__label`] = maps[i].get(String(row[l.key])) ?? "";
    });
    return out;
  });
}
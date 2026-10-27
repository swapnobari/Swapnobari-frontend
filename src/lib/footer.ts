import { api } from "./api";
import type { FooterData } from "./types";

export async function getFooter(): Promise<FooterData | null> {
  try {
    return await api<FooterData>("/footer/", { revalidate: 300 });
  } catch {
    return null;
  }
}

export function footerMapSrc(f: FooterData): string | null {
  const raw = (f.google_map_embed_url || "").trim();
  if (raw) {
    const m = raw.match(/src=["']([^"']+)["']/);
    return m ? m[1] : raw;
  }
  const lat = Number(f.latitude);
  const lng = Number(f.longitude);
  const ok = lat >= 20 && lat <= 27 && lng >= 88 && lng <= 93;
  return ok ? `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed` : null;
}
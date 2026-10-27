import { api } from "./api";

export type Banner = {
  id: number;
  page: string;
  title: string;
  subtitle: string;
  image: string | null;
  is_active: boolean;
};

export async function getBanner(page: string): Promise<Banner | null> {
  try {
    const data = await api<Banner[] | { results?: Banner[] }>("/banners/?page_size=100");
    const list = Array.isArray(data) ? data : (data.results ?? []);
    return list.find((b) => b.page === page && b.is_active !== false) ?? null;
  } catch {
    return null; // a banner problem must never break a page
  }
}
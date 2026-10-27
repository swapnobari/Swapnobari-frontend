// Accepts 01712345678, +8801712345678, 8801712345678, with spaces or dashes
export const cleanPhone = (v: string) => v.replace(/[\s-]/g, "").replace(/^\+?88/, "");

export const isBdPhone = (v: string) => /^01[3-9]\d{8}$/.test(cleanPhone(v));

export const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);

// Local date as YYYY-MM-DD (not UTC), so "today" matches the visitor's calendar
export function todayLocal(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
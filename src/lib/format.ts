export function formatArea(amount: string | number, unit: string): string {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return "";
  const label = unit ? unit.charAt(0).toUpperCase() + unit.slice(1) : "";
  return `${n} ${label}`.trim();
}

export function formatMonthYear(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDate(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

// "10:00:00" -> "10:00 AM"
export function formatTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return "";
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m || 0).padStart(2, "0")} ${suffix}`;
}

const priceFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

// "8000000.00" -> "Tk 80,00,000"
export function formatPrice(v: string | number | null | undefined): string {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "";
  return `Tk ${priceFmt.format(n)}`;
}

export function formatNumber(v: string | number | null | undefined): string {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

export function cap(s: string | null | undefined): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
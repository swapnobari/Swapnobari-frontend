export type Tone = "brand" | "accent" | "light" | "dark";

export const TONE: Record<Tone, string> = {
  brand: "bg-brand text-white",
  accent: "bg-accent text-white",
  light: "bg-white text-brand",
  dark: "bg-brand-deep text-white",
};

export function statusTone(status: string): Tone {
  if (status === "available") return "brand";
  if (status === "booked") return "accent";
  if (status === "sold") return "dark";
  return "light";
}
import { icons, Check } from "lucide-react";

// "shield-check" -> "ShieldCheck", "building-2" -> "Building2"
function toPascal(name: string) {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

export default function AmenityIcon({ name }: { name?: string }) {
  const Icon = (name && icons[toPascal(name) as keyof typeof icons]) || Check;
  return <Icon className="h-7 w-7" strokeWidth={1.4} aria-hidden />;
}
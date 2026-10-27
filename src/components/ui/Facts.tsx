import Reveal from "@/components/motion/Reveal";

export type Fact = { label: string; value: string | number | null | undefined };

export default function Facts({ items }: { items: Fact[] }) {
  const list = items.filter((f) => f.value !== null && f.value !== undefined && f.value !== "");
  if (!list.length) return null;

  return (
    <section className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-line px-6 py-12 md:grid-cols-4 md:px-16">
      {list.map((f, i) => (
        <Reveal key={f.label} delay={(i % 4) * 0.08}>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">{f.label}</p>
          <p className="mt-2 font-display text-3xl text-brand">{f.value}</p>
        </Reveal>
      ))}
    </section>
  );
}
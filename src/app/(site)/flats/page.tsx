import type { Metadata } from "next";
import Link from "next/link";
import { api, type Paginated } from "@/lib/api";
import type { FlatListItem } from "@/lib/types";
import { formatNumber, formatPrice } from "@/lib/format";
import Boundary from "@/components/ui/Boundary";
import PageHeader from "@/components/ui/PageHeader";
import Pill from "@/components/ui/Pill";
import MediaCard from "@/components/ui/MediaCard";
import { statusTone } from "@/components/ui/badge";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Flat Sale | Swapno Bari Housing Ltd.",
  description: "Residential and commercial flats in well-planned buildings.",
};

type SP = Promise<{ status?: string; type?: string }>;

const STATUSES = [
  { value: "", label: "All" },
  { value: "available", label: "Available" },
  { value: "booked", label: "Booked" },
  { value: "sold", label: "Sold" },
];
const TYPES = [
  { value: "", label: "All types" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

function href(p: { status?: string; type?: string }) {
  const q = new URLSearchParams();
  if (p.status) q.set("status", p.status);
  if (p.type) q.set("type", p.type);
  const s = q.toString();
  return s ? `/flats?${s}` : "/flats";
}

async function FlatsContent({ searchParams }: { searchParams: SP }) {
  const { status = "", type = "" } = await searchParams;
  const data = await api<Paginated<FlatListItem>>("/flats/?page_size=100");
  const all = [...data.results].sort((a, b) => a.order - b.order);

  const shown = all.filter(
    (f) => (!status || f.status === status) && (!type || f.flat_type === type)
  );
  const countFor = (v: string) => (v ? all.filter((f) => f.status === v).length : all.length);

  return (
    <main>
      <PageHeader
        eyebrow="Flat Sale"
        lines={["Flats made for", <span key="l" className="italic text-accent">living well</span>]}
        intro="Thoughtfully planned residential and commercial flats with practical layouts and modern facilities."
      />

      <section className="border-y border-line px-6 py-6 md:px-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {STATUSES.map((s) => (
              <Pill key={s.value} to={href({ status: s.value, type })} active={status === s.value}>
                {s.label} <span className="opacity-60">({countFor(s.value)})</span>
              </Pill>
            ))}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
            {TYPES.map((t) => (
              <Pill key={t.value} to={href({ status, type: t.value })} active={type === t.value}>
                {t.label}
              </Pill>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16 md:py-24">
        {shown.length > 0 ? (
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((f, i) => (
              <Reveal key={f.id} delay={(i % 3) * 0.1}>
                <MediaCard
                  href={`/flats/${f.slug}`}
                  image={f.thumbnail}
                  alt={f.title}
                  badge={f.status_display}
                  tone={statusTone(f.status)}
                  title={f.title}
                  text={f.location}
                  meta={[
                    f.size_sft ? `${formatNumber(f.size_sft)} sft` : null,
                    f.price_per_sft ? `${formatPrice(f.price_per_sft)} / sft` : null,
                    f.flat_type_display,
                  ]}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-4xl text-brand">No flats found</p>
            <p className="mt-3 text-muted">Try a different filter.</p>
            <Link
              href="/flats"
              className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-white transition hover:bg-accent-bright"
            >
              Clear filters
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default function FlatsPage({ searchParams }: { searchParams: SP }) {
  return (
    <Boundary>
      <FlatsContent searchParams={searchParams} />
    </Boundary>
  );
}
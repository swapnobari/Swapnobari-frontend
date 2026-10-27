import type { Metadata } from "next";
import Link from "next/link";
import { api, type Paginated } from "@/lib/api";
import type { PlotListItem } from "@/lib/types";
import { formatNumber, formatPrice } from "@/lib/format";
import Boundary from "@/components/ui/Boundary";
import PageHeader from "@/components/ui/PageHeader";
import Pill from "@/components/ui/Pill";
import MediaCard from "@/components/ui/MediaCard";
import { statusTone } from "@/components/ui/badge";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Plot Sale | Swapno Bari Housing Ltd.",
  description: "Residential plots in planned communities, ready for your future home.",
};

type SP = Promise<{ status?: string; project?: string }>;

const STATUSES = [
  { value: "", label: "All" },
  { value: "available", label: "Available" },
  { value: "booked", label: "Booked" },
  { value: "sold", label: "Sold" },
];

function href(p: { status?: string; project?: string }) {
  const q = new URLSearchParams();
  if (p.status) q.set("status", p.status);
  if (p.project) q.set("project", p.project);
  const s = q.toString();
  return s ? `/plots?${s}` : "/plots";
}

async function PlotsContent({ searchParams }: { searchParams: SP }) {
  const { status = "", project = "" } = await searchParams;
  const data = await api<Paginated<PlotListItem>>("/plots/?page_size=100");
  const all = [...data.results].sort((a, b) => a.order - b.order);

  const projects = Array.from(
    new Map(all.filter((p) => p.project).map((p) => [String(p.project), p.project_title ?? ""])).entries()
  ).map(([id, title]) => ({ id, title }));

  const shown = all.filter(
    (p) => (!status || p.status === status) && (!project || String(p.project) === project)
  );
  const countFor = (v: string) => (v ? all.filter((p) => p.status === v).length : all.length);

  return (
    <main>
      <PageHeader
        eyebrow="Plot Sale"
        lines={["Land to build", <span key="d" className="italic text-accent">your dream</span>]}
        intro="Residential plots in planned communities, with clear documentation and transparent pricing."
      />

      <section className="border-y border-line px-6 py-6 md:px-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {STATUSES.map((s) => (
              <Pill key={s.value} to={href({ status: s.value, project })} active={status === s.value}>
                {s.label} <span className="opacity-60">({countFor(s.value)})</span>
              </Pill>
            ))}
          </div>
          {projects.length > 1 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by project">
              <Pill to={href({ status })} active={!project}>
                All projects
              </Pill>
              {projects.map((p) => (
                <Pill key={p.id} to={href({ status, project: p.id })} active={project === p.id}>
                  {p.title}
                </Pill>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 py-16 md:px-16 md:py-24">
        {shown.length > 0 ? (
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.1}>
                <MediaCard
                  href={`/plots/${p.slug}`}
                  image={p.thumbnail}
                  alt={p.title}
                  badge={p.status_display}
                  tone={statusTone(p.status)}
                  title={p.title}
                  text={p.location}
                  meta={[
                    `${formatNumber(p.size_katha)} Katha`,
                    formatPrice(p.price) || "Contact for price",
                    p.project_title,
                  ]}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-4xl text-brand">No plots found</p>
            <p className="mt-3 text-muted">Try a different filter.</p>
            <Link
              href="/plots"
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

export default function PlotsPage({ searchParams }: { searchParams: SP }) {
  return (
    <Boundary>
      <PlotsContent searchParams={searchParams} />
    </Boundary>
  );
}
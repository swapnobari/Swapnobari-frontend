import type { Metadata } from "next";
import { Suspense } from "react";
import { api, type Paginated } from "@/lib/api";
import type { ProjectListItem } from "@/lib/types";
import LandShareForm from "@/components/forms/LandShareForm";
import Reveal from "@/components/motion/Reveal";
import LineReveal from "@/components/motion/LineReveal";

export const metadata: Metadata = {
  title: "Land-Share Request | Swapno Bari Housing Ltd.",
  description: "Offer your land to join a Swapno Bari Housing project.",
};

type SearchParams = Promise<{ project?: string }>;

async function FormSection({ searchParams }: { searchParams: SearchParams }) {
  const { project = "" } = await searchParams;

  let list: ProjectListItem[] = [];
  try {
    list = (await api<Paginated<ProjectListItem>>("/projects/?page_size=100")).results;
  } catch {}

  const options = list
    .filter((p) => p.accepts_land_share)
    .sort((a, b) => a.order - b.order)
    .map((p) => ({ id: p.id, title: p.title, slug: p.slug }));
  const preselected = options.find((o) => o.slug === project);

  return (
    <LandShareForm projects={options} defaultProjectId={preselected ? String(preselected.id) : ""} />
  );
}

export default function LandSharePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main>
      <section className="px-6 pb-12 pt-36 md:px-16 md:pt-44">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">Landowners</p>
        <LineReveal
          as="h1"
          className="font-display text-6xl leading-[1.05] text-brand md:text-9xl"
          lines={["Offer your", <span key="l" className="italic text-accent">land</span>]}
        />
        <Reveal delay={0.3}>
          <p className="mt-8 max-w-xl text-muted">
            Tell us about your land. Our team will review the details and contact you to discuss a
            partnership.
          </p>
        </Reveal>
      </section>

      <section className="px-6 pb-24 md:px-16">
        <div className="mx-auto max-w-4xl">
          <Suspense
            fallback={<div className="min-h-[600px] border border-line bg-white/40" aria-busy="true" />}
          >
            <FormSection searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
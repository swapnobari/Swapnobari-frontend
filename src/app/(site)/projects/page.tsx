
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { api, type Paginated } from "@/lib/api";
import type { ProjectListItem } from "@/lib/types";
import ProjectCard from "@/components/sections/ProjectCard";
import Reveal from "@/components/motion/Reveal";
import LineReveal from "@/components/motion/LineReveal";

export const metadata: Metadata = {
  title: "Projects | Swapno Bari Housing Ltd.",
  description:
    "Explore our upcoming, ongoing and completed residential and land projects.",
};

type SearchParams = Promise<{
  status?: string;
  category?: string;
}>;

const STATUSES = [
  { value: "", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

function href(params: { status?: string; category?: string }) {
  const q = new URLSearchParams();

  if (params.status) q.set("status", params.status);
  if (params.category) q.set("category", params.category);

  const query = q.toString();
  return query ? `/projects?${query}` : "/projects";
}

function Pill({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={to}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={`cursor-pointer rounded-full border px-5 py-2 text-sm transition ${
        active
          ? "border-brand bg-brand text-white"
          : "border-line text-fg hover:border-brand hover:text-brand"
      }`}
    >
      {children}
    </Link>
  );
}

async function ProjectsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status = "", category = "" } = await searchParams;

  const data = await api<Paginated<ProjectListItem>>(
    "/projects/?page_size=100"
  );

  const all = [...data.results].sort((a, b) => a.order - b.order);

  const categories = Array.from(
    new Map(
      all.map((project) => [
        project.category_slug,
        project.category_name,
      ])
    ).entries()
  ).map(([slug, name]) => ({ slug, name }));

  const shown = all.filter(
    (project) =>
      (!status || project.status === status) &&
      (!category || project.category_slug === category)
  );

  const countFor = (value: string) =>
    value
      ? all.filter((project) => project.status === value).length
      : all.length;

  return (
    <main>
      {/* Header */}
      <section className="px-6 pb-12 pt-36 md:px-16 md:pt-44">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">
          Our Projects
        </p>

        <LineReveal
          className="font-display text-6xl leading-[1.05] text-brand md:text-9xl"
          lines={[
            "Places to",
            <span key="l" className="italic text-accent">
              call home
            </span>,
          ]}
        />

        <Reveal delay={0.3}>
          <p className="mt-8 max-w-xl text-muted">
            Explore our upcoming, ongoing and completed projects, each
            planned with quality, transparency and timely delivery.
          </p>
        </Reveal>
      </section>

      {/* Filters */}
      <section className="border-y border-line px-6 py-6 md:px-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Status filters */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by status"
          >
            {STATUSES.map((item) => (
              <Pill
                key={item.value}
                to={href({
                  status: item.value,
                  category,
                })}
                active={status === item.value}
              >
                {item.label}{" "}
                <span className="opacity-60">
                  ({countFor(item.value)})
                </span>
              </Pill>
            ))}
          </div>

          {/* Category filters */}
          {categories.length > 1 && (
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by category"
            >
              <Pill
                to={href({ status })}
                active={!category}
              >
                All categories
              </Pill>

              {categories.map((item) => (
                <Pill
                  key={item.slug}
                  to={href({
                    status,
                    category: item.slug,
                  })}
                  active={category === item.slug}
                >
                  {item.name}
                </Pill>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Project Grid */}
      <section className="px-6 py-16 md:px-16 md:py-24">
        {shown.length > 0 ? (
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((project, index) => (
              <Reveal
                key={project.id}
                delay={(index % 3) * 0.1}
              >
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-4xl text-brand">
              No projects found
            </p>

            <p className="mt-3 text-muted">
              Try a different filter.
            </p>

            <Link
              href="/projects"
              className="mt-8 inline-block cursor-pointer rounded-full bg-accent px-8 py-3 text-white transition hover:bg-accent-bright"
            >
              Clear filters
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default function ProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-bg"
          aria-busy="true"
        />
      }
    >
      <ProjectsContent searchParams={searchParams} />
    </Suspense>
  );
}

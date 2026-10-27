import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { api, type Paginated } from "@/lib/api";
import type { ProjectListItem } from "@/lib/types";
import BookingForm from "@/components/forms/BookingForm";
import Reveal from "@/components/motion/Reveal";
import LineReveal from "@/components/motion/LineReveal";

export const metadata: Metadata = {
  title: "Book a Site Visit | Swapno Bari Housing Ltd.",
  description: "Book a visit to one of our project sites or to our office.",
};

type SearchParams = Promise<{ project?: string }>;

async function FormSection({ searchParams }: { searchParams: SearchParams }) {
  const { project = "" } = await searchParams;

  let list: ProjectListItem[] = [];
  try {
    list = (await api<Paginated<ProjectListItem>>("/projects/?page_size=100")).results;
  } catch {}

  const options = list
    .sort((a, b) => a.order - b.order)
    .map((p) => ({ id: p.id, title: p.title, slug: p.slug }));
  const preselected = options.find((o) => o.slug === project);

  return (
    <BookingForm projects={options} defaultProjectId={preselected ? String(preselected.id) : ""} />
  );
}

const STEPS = [
  { t: "Send your request", d: "Choose a project, a date and a time that suits you." },
  { t: "We call you", d: "Our team confirms the date and time with you by phone." },
  { t: "Visit with us", d: "We show you around and answer every question." },
];

export default function VisitBookingPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main>
      <section className="px-6 pb-12 pt-36 md:px-16 md:pt-44">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">Site Visit</p>
        <LineReveal
          as="h1"
          className="font-display text-6xl leading-[1.05] text-brand md:text-9xl"
          lines={["See it", <span key="y" className="italic text-accent">yourself</span>]}
        />
      </section>

      <section className="grid gap-16 px-6 pb-24 md:px-16 lg:grid-cols-[1fr_1.5fr]">
        <div>
          <Reveal>
            <ol className="space-y-8">
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex gap-6 border-t border-line pt-6">
                  <span className="font-display text-3xl italic text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-display text-2xl text-brand">{s.t}</p>
                    <p className="mt-1 text-muted">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-10 text-muted">
              Already booked?{" "}
              <Link href="/visit-booking/status" className="text-accent underline">
                Check your booking status
              </Link>
            </p>
          </Reveal>
        </div>

        <Suspense
          fallback={<div className="min-h-[600px] border border-line bg-white/40" aria-busy="true" />}
        >
          <FormSection searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
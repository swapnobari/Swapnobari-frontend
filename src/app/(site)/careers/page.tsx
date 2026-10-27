import type { Metadata } from "next";
import Link from "next/link";
import { api, type Paginated } from "@/lib/api";
import type { JobListItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Careers | Swapno Bari Housing Ltd.",
  description: "Join the Swapno Bari Housing team. See our open positions.",
};

export default async function CareersPage() {
  const data = await api<Paginated<JobListItem>>("/careers/?page_size=100");
  const jobs = [...data.results].sort(
    (a, b) => Number(b.is_open) - Number(a.is_open) || (a.deadline ?? "").localeCompare(b.deadline ?? "")
  );

  return (
    <main>
      <PageHeader
        eyebrow="Careers"
        lines={["Build your future", <span key="w" className="italic text-accent">with us</span>]}
        intro="We are always looking for motivated people who care about quality, honesty and customers."
      />

      <section className="px-6 pb-24 md:px-16">
        {jobs.length > 0 ? (
          <ul className="border-b border-line">
            {jobs.map((j, i) => (
              <li key={j.id} className="border-t border-line">
                <Reveal delay={(i % 4) * 0.06}>
                  <Link
                    href={`/careers/${j.slug}`}
                    className="group grid gap-4 py-8 md:grid-cols-[2fr_1fr_1fr_auto] md:items-center"
                  >
                    <div>
                      <h2 className="font-display text-3xl text-brand transition-colors group-hover:text-accent md:text-4xl">
                        {j.title}
                      </h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                        {[j.department, j.employment_type_display].filter(Boolean).join("  ·  ")}
                      </p>
                    </div>
                    <p className="text-muted">{j.location}</p>
                    <p className="text-sm text-muted">
                      {j.is_open ? (
                        j.deadline ? `Apply by ${formatDate(j.deadline)}` : "Open"
                      ) : (
                        <span className="rounded-full bg-line px-3 py-1 text-xs uppercase tracking-[0.2em]">
                          Closed
                        </span>
                      )}
                    </p>
                    <span className="text-2xl text-accent transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-4xl text-brand">No open positions right now</p>
            <p className="mt-3 text-muted">Please check back soon.</p>
          </div>
        )}
      </section>
    </main>
  );
}
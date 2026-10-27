import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiOrNull } from "@/lib/api";
import type { JobDetail } from "@/lib/types";
import { formatDate } from "@/lib/format";
import Boundary from "@/components/ui/Boundary";
import RichText from "@/components/ui/RichText";
import ButtonLink from "@/components/ui/ButtonLink";
import ApplyForm from "@/components/forms/ApplyForm";
import Reveal from "@/components/motion/Reveal";
import LineReveal from "@/components/motion/LineReveal";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const j = await apiOrNull<JobDetail>(`/careers/${slug}/`);
  if (!j) return { title: "Job not found" };
  return { title: `${j.title} | Careers | Swapno Bari Housing Ltd.` };
}

async function JobContent({ params }: { params: Params }) {
  const { slug } = await params;
  const j = await apiOrNull<JobDetail>(`/careers/${slug}/`);
  if (!j) notFound();

  const facts = [
    { label: "Department", value: j.department },
    { label: "Location", value: j.location },
    { label: "Type", value: j.employment_type_display },
    { label: "Vacancies", value: j.vacancies },
    { label: "Salary", value: j.salary_note },
    { label: "Deadline", value: formatDate(j.deadline) },
  ].filter((f) => f.value);

  return (
    <main>
      <section className="px-6 pb-12 pt-36 md:px-16 md:pt-44">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">Careers</p>
        <LineReveal
          as="h1"
          className="max-w-5xl font-display text-5xl leading-[1.05] text-brand md:text-8xl"
          lines={[j.title]}
        />
        <Reveal delay={0.3}>
          <p className="mt-6">
            {j.is_open ? (
              <span className="rounded-full bg-brand px-4 py-1 text-xs uppercase tracking-[0.2em] text-white">
                Open for applications
              </span>
            ) : (
              <span className="rounded-full bg-line px-4 py-1 text-xs uppercase tracking-[0.2em]">
                Applications closed
              </span>
            )}
          </p>
        </Reveal>
      </section>

      <section className="grid gap-16 px-6 py-16 md:px-16 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Reveal>
            <RichText value={j.description} className="text-muted" />
          </Reveal>
          {j.requirements && (
            <Reveal delay={0.1}>
              <p className="mb-2 mt-16 text-xs uppercase tracking-[0.3em] text-accent">Requirements</p>
              <RichText value={j.requirements} className="text-muted" />
            </Reveal>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <div className="border border-line bg-white/60 p-8">
              <p className="font-display text-3xl text-brand">Job details</p>
              <dl className="mt-6 divide-y divide-line">
                {facts.map((f) => (
                  <div key={f.label} className="flex justify-between gap-6 py-3">
                    <dt className="text-muted">{f.label}</dt>
                    <dd className="text-right font-medium text-brand">{f.value}</dd>
                  </div>
                ))}
              </dl>
              {j.is_open && (
                <div className="mt-8">
                  <ButtonLink href="#apply" className="w-full justify-center">
                    Apply now
                  </ButtonLink>
                </div>
              )}
            </div>
          </Reveal>
        </aside>
      </section>

      <section id="apply" className="scroll-mt-24 border-t border-line px-6 py-20 md:px-16 md:py-28">
        <div className="mx-auto max-w-4xl">
          {j.is_open ? (
            <>
              <LineReveal
                className="mb-12 font-display text-5xl leading-[1.05] text-brand md:text-7xl"
                lines={["Apply for", <span key="r" className="italic text-accent">this role</span>]}
              />
              <ApplyForm slug={j.slug} jobTitle={j.title} />
            </>
          ) : (
            <div className="text-center">
              <p className="font-display text-4xl text-brand">This position is closed</p>
              <div className="mt-8">
                <ButtonLink href="/careers" variant="outline">
                  See other openings
                </ButtonLink>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function JobDetailPage({ params }: { params: Params }) {
  return (
    <Boundary>
      <JobContent params={params} />
    </Boundary>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError, type Paginated } from "@/lib/api";
import type { ProjectDetail, ProjectListItem } from "@/lib/types";
import { mediaUrl, videoEmbed } from "@/lib/media";
import { formatArea, formatDate, formatMonthYear } from "@/lib/format";
import Reveal from "@/components/motion/Reveal";
import LineReveal from "@/components/motion/LineReveal";
import ImageReveal from "@/components/motion/ImageReveal";
import RichText from "@/components/ui/RichText";
import ButtonLink from "@/components/ui/ButtonLink";
import AmenityIcon from "@/components/ui/AmenityIcon";
import Gallery from "@/components/sections/Gallery";
import ProjectCard from "@/components/sections/ProjectCard";

type Params = Promise<{ slug: string }>;

async function getProject(slug: string): Promise<ProjectDetail | null> {
  try {
    return await api<ProjectDetail>(`/projects/${slug}/`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);

  if (!p) return { title: "Project not found" };

  const title = p.meta_title || `${p.title} | Swapno Bari Housing Ltd.`;
  const description = p.meta_description || p.short_description;
  const img = mediaUrl(p.thumbnail);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: img ? [img] : [],
    },
  };
}

const STATUS_STYLE: Record<string, string> = {
  upcoming: "bg-brand text-white",
  ongoing: "bg-accent text-white",
  completed: "bg-white text-brand",
};

async function ProjectContent({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getProject(slug);

  if (!p) notFound();

  // Related projects: same category first, never the current one.
  let related: ProjectListItem[] = [];

  try {
    const list = await api<Paginated<ProjectListItem>>(
      "/projects/?page_size=100"
    );

    related = list.results
      .filter((x) => x.id !== p.id)
      .sort(
        (a, b) =>
          Number(b.category === p.category) -
          Number(a.category === p.category)
      )
      .slice(0, 3);
  } catch {}

  const hero = mediaUrl(p.thumbnail);
  const area = formatArea(p.land_area, p.land_area_unit);
  const embed = videoEmbed(p.video_url);

  const facts = [
    { label: "Land area", value: area },
    { label: "Total units", value: p.total_units },
    { label: "Floors", value: p.floors },
    { label: "Car parking", value: p.car_parking },
    { label: "Start", value: formatMonthYear(p.start_date) },
    { label: "Handover", value: formatDate(p.handover_date) },
    { label: "Category", value: p.category_detail?.name },
  ].filter((f) => f.value);

  const amenities = [...p.amenities].sort(
    (a, b) => a.order - b.order
  );

  const galleryImages = [...p.images]
    .sort((a, b) => a.order - b.order)
    .map((i) => ({
      id: i.id,
      src: mediaUrl(i.image) as string,
      caption: i.caption,
    }))
    .filter((i) => i.src);

  const lat = Number(p.latitude);
  const lng = Number(p.longitude);

  const hasCoords =
    !!p.latitude &&
    !!p.longitude &&
    lat >= 20 &&
    lat <= 27 &&
    lng >= 88 &&
    lng <= 93;

  const mapEmbed = hasCoords
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`
    : null;

  const mapLink = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        p.location
      )}`;

  return (
    <main>
      {/* 1. Hero */}
      <section className="relative flex h-[85svh] min-h-[560px] items-end overflow-hidden bg-brand-deep text-white">
        {hero && (
          <div className="absolute inset-0">
            <ImageReveal
              src={hero}
              alt={p.title}
              priority
              sizes="100vw"
              className="h-full w-full"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />

        <div className="relative w-full px-6 pb-14 md:px-16 md:pb-20">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 text-xs uppercase tracking-[0.25em] text-white/70"
          >
            <Link
              href="/projects"
              className="transition hover:text-white"
            >
              Projects
            </Link>

            <span className="mx-3">/</span>
            <span className="text-white">{p.title}</span>
          </nav>

          <span
            className={`mb-5 inline-block rounded-full px-4 py-1 text-[11px] font-medium uppercase tracking-[0.2em] ${
              STATUS_STYLE[p.status] ?? "bg-white text-brand"
            }`}
          >
            {p.status_display}
          </span>

          <LineReveal
            as="h1"
            className="max-w-5xl font-display text-6xl leading-[1.02] md:text-9xl"
            lines={[p.title]}
          />

          {p.location && (
            <Reveal delay={0.4}>
              <p className="mt-6 max-w-2xl text-lg text-white/80">
                {p.location}
              </p>
            </Reveal>
          )}
        </div>
      </section>

      {/* 2. Key facts */}
      {facts.length > 0 && (
        <section className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-line px-6 py-12 md:grid-cols-4 md:px-16">
          {facts.map((f, i) => (
            <Reveal key={f.label} delay={(i % 4) * 0.08}>
              <p className="text-xs uppercase tracking-[0.25em] text-muted">
                {f.label}
              </p>

              <p className="mt-2 font-display text-3xl text-brand">
                {f.value}
              </p>
            </Reveal>
          ))}
        </section>
      )}

      {/* 3. Overview + sticky action card */}
      <section className="grid gap-16 px-6 py-20 md:px-16 md:py-28 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Reveal>
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">
              Overview
            </p>

            {p.short_description && (
              <p className="font-display text-3xl leading-snug text-brand md:text-4xl">
                {p.short_description}
              </p>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <RichText
              value={p.description}
              className="mt-10 text-muted"
            />
          </Reveal>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <div className="border border-line bg-white/60 p-8">
              <p className="font-display text-3xl text-brand">
                Interested in this project?
              </p>

              <p className="mt-3 text-muted">
                Visit the site with our team, ask your questions and see it for yourself.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <ButtonLink
                  href={`/visit-booking?project=${p.slug}`}
                  className="justify-center"
                >
                  Book a Site Visit
                </ButtonLink>

                {p.brochure && (
                  <ButtonLink
                    href={p.brochure}
                    variant="outline"
                    className="justify-center"
                  >
                    Download Brochure
                  </ButtonLink>
                )}

                <ButtonLink
                  href="/contact"
                  variant="outline"
                  className="justify-center"
                >
                  Contact Us
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </aside>
      </section>

      {/* 4. Amenities */}
      {amenities.length > 0 && (
        <section className="border-t border-line px-6 py-20 md:px-16 md:py-28">
          <Reveal>
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">
              Amenities
            </p>
          </Reveal>

          <LineReveal
            className="font-display text-5xl leading-[1.05] text-brand md:text-7xl"
            lines={[
              "Everything you",
              <span key="n" className="italic text-accent">
                need nearby
              </span>,
            ]}
          />

          <ul className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {amenities.map((a, i) => (
              <li key={a.id} className="bg-bg">
                <Reveal
                  delay={(i % 4) * 0.08}
                  className="flex h-full flex-col gap-5 p-8"
                >
                  <span className="text-accent">
                    <AmenityIcon name={a.icon} />
                  </span>

                  <p className="font-display text-2xl text-brand">
                    {a.title}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 5. Gallery */}
      {galleryImages.length > 0 && (
        <section className="border-t border-line px-6 py-20 md:px-16 md:py-28">
          <Reveal>
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">
              Gallery
            </p>
          </Reveal>

          <LineReveal
            className="mb-14 font-display text-5xl leading-[1.05] text-brand md:text-7xl"
            lines={[
              "A closer",
              <span key="l" className="italic text-accent">
                look
              </span>,
            ]}
          />

          <Gallery images={galleryImages} />
        </section>
      )}

      {/* 6. Video */}
      {p.video_url && (
        <section className="border-t border-line px-6 py-20 md:px-16 md:py-28">
          <Reveal>
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">
              Video
            </p>
          </Reveal>

          {embed ? (
            <div className="aspect-video w-full overflow-hidden bg-black">
              <iframe
                src={embed}
                title={`${p.title} video`}
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <Reveal>
              <ButtonLink href={p.video_url} variant="outline">
                Watch the project video
              </ButtonLink>
            </Reveal>
          )}
        </section>
      )}

      {/* 7. Land share */}
      {p.accepts_land_share && (
        <section className="grid gap-12 bg-brand-deep px-6 py-20 text-white md:px-16 md:py-28 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent-bright">
                Landowners
              </p>
            </Reveal>

            <LineReveal
              className="font-display text-5xl leading-[1.05] md:text-7xl"
              lines={[
                "Own land?",
                <span key="j" className="italic">
                  Join this project
                </span>,
              ]}
            />

            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md text-white/75">
                This project accepts land-share partnerships. Offer your land, share the
                development, and become part of the project.
              </p>

              <div className="mt-10">
                <ButtonLink
                  href={`/landowner/land-share?project=${p.slug}`}
                  variant="light"
                >
                  Submit a Land-Share Request
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          {p.land_share_terms && (
            <Reveal delay={0.15}>
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-white/60">
                Terms
              </p>

              <RichText
                value={p.land_share_terms}
                className="text-white/75"
              />
            </Reveal>
          )}
        </section>
      )}

      {/* 8. Location */}
      {p.location && (
        <section className="px-6 py-20 md:px-16 md:py-28">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Reveal>
                <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">
                  Location
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="max-w-2xl font-display text-3xl text-brand md:text-5xl">
                  {p.location}
                </p>
              </Reveal>
            </div>

            <Reveal>
              <ButtonLink href={mapLink} variant="outline">
                View on Google Maps
              </ButtonLink>
            </Reveal>
          </div>

          {mapEmbed && (
            <div className="overflow-hidden border border-line">
              <iframe
                src={mapEmbed}
                title={`${p.title} location`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="h-96 w-full grayscale transition duration-500 hover:grayscale-0"
              />
            </div>
          )}
        </section>
      )}

      {/* 9. Related projects */}
      {related.length > 0 && (
        <section className="border-t border-line px-6 py-20 md:px-16 md:py-28">
          <div className="mb-14 flex items-end justify-between gap-6">
            <LineReveal
              className="font-display text-5xl leading-[1.05] text-brand md:text-7xl"
              lines={[
                "More",
                <span key="p" className="italic text-accent">
                  projects
                </span>,
              ]}
            />

            <ButtonLink
              href="/projects"
              variant="outline"
              className="hidden md:inline-flex"
            >
              View all
            </ButtonLink>
          </div>

          <div className="grid gap-x-8 gap-y-16 md:grid-cols-3">
            {related.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.1}>
                <ProjectCard project={r} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default function ProjectDetailPage({
  params,
}: {
  params: Params;
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
      <ProjectContent params={params} />
    </Suspense>
  );
}

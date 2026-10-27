import { api, type Paginated } from "@/lib/api";
import type {
  FlatListItem,
  HeroSlide,
  HomeSection,
  Partner,
  PlotListItem,
  ProjectListItem,
  Testimonial,
} from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import { formatNumber, formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";
import HeroSlider from "@/components/sections/HeroSlider";
import ProjectCard from "@/components/sections/ProjectCard";
import Testimonials from "@/components/sections/Testimonials";
import PartnerStrip from "@/components/sections/PartnerStrip";
import MediaCard from "@/components/ui/MediaCard";
import { statusTone } from "@/components/ui/badge";
import Reveal from "@/components/motion/Reveal";
import LineReveal from "@/components/motion/LineReveal";
import ImageReveal from "@/components/motion/ImageReveal";
import RichText from "@/components/ui/RichText";
import ButtonLink from "@/components/ui/ButtonLink";

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function Home() {
  const [slides, sections, projects, plots, flats, testimonials, partners] = await Promise.all([
    safe<HeroSlide[]>(api<HeroSlide[]>("/hero-slides/"), []),
    safe<HomeSection[]>(api<HomeSection[]>("/home-sections/"), []),
    safe<Paginated<ProjectListItem> | null>(
      api<Paginated<ProjectListItem>>("/projects/?page_size=100"),
      null
    ),
    safe<Paginated<PlotListItem> | null>(api<Paginated<PlotListItem>>("/plots/?page_size=100"), null),
    safe<Paginated<FlatListItem> | null>(api<Paginated<FlatListItem>>("/flats/?page_size=100"), null),
    safe<Testimonial[]>(api<Testimonial[]>("/testimonials/"), []),
    safe<Partner[]>(api<Partner[]>("/partners/"), []),
  ]);

  const activeSlides = [...slides].sort((a, b) => a.order - b.order);
  const intro = sections.find((s) => s.key === "intro");
  const invest = sections.find((s) => s.key === "secure_investment");

  const top3 = <T extends { is_featured: boolean; order: number }>(list: T[] | undefined) =>
    (list ?? [])
      .filter((x) => x.is_featured)
      .sort((a, b) => a.order - b.order)
      .slice(0, 3);

  const featured = top3(projects?.results);
  const featuredPlots = top3(plots?.results);
  const featuredFlats = top3(flats?.results);
  const reviews = [...testimonials].sort((a, b) => a.order - b.order);
  const logos = [...partners].sort((a, b) => a.order - b.order);

  const introImg = mediaUrl(intro?.image);
  const investImg = mediaUrl(invest?.image);

  return (
    <main>
      {/* 1. Hero */}
      {activeSlides.length > 0 ? (
        <HeroSlider slides={activeSlides} />
      ) : (
        <section className="flex h-svh min-h-150 flex-col justify-end bg-brand-deep px-6 pb-32 text-white md:px-16">
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/70">{SITE.name}</p>
          <h1 className="font-display text-6xl md:text-9xl">{SITE.tagline}</h1>
        </section>
      )}

      {/* 2. Intro */}
      {intro && (
        <section className="grid items-center gap-12 px-6 py-24 md:grid-cols-2 md:gap-20 md:px-16 md:py-36">
          {introImg && (
            <ImageReveal src={introImg} alt={intro.title} className="aspect-4/5 w-full" />
          )}
          <div>
            <Reveal>
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">{intro.subtitle}</p>
            </Reveal>
            <LineReveal
              className="font-display text-5xl leading-[1.05] text-brand md:text-7xl"
              lines={[intro.title]}
            />
            <Reveal delay={0.2}>
              <RichText value={intro.body} className="mt-8 text-muted" />
              {intro.button_text && intro.button_link && (
                <div className="mt-10">
                  <ButtonLink href={intro.button_link}>{intro.button_text}</ButtonLink>
                </div>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* 3. Featured projects */}
      {featured.length > 0 && (
        <section className="border-t border-line px-6 py-24 md:px-16 md:py-32">
          <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <Reveal>
                <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">
                  Featured Projects
                </p>
              </Reveal>
              <LineReveal
                className="font-display text-5xl leading-[1.05] text-brand md:text-7xl"
                lines={["Homes built", <span key="b" className="italic text-accent">with trust</span>]}
              />
            </div>
            <Reveal>
              <ButtonLink href="/projects" variant="outline">
                View all projects
              </ButtonLink>
            </Reveal>
          </div>

          <div className="grid gap-x-8 gap-y-16 md:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.12}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 4. Featured plots */}
      {featuredPlots.length > 0 && (
        <section className="border-t border-line px-6 py-24 md:px-16 md:py-32">
          <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <Reveal>
                <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">Plot Sale</p>
              </Reveal>
              <LineReveal
                className="font-display text-5xl leading-[1.05] text-brand md:text-7xl"
                lines={["Land to build", <span key="d" className="italic text-accent">your dream</span>]}
              />
            </div>
            <Reveal>
              <ButtonLink href="/plots" variant="outline">
                View all plots
              </ButtonLink>
            </Reveal>
          </div>

          <div className="grid gap-x-8 gap-y-16 md:grid-cols-3">
            {featuredPlots.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.12}>
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
        </section>
      )}

      {/* 5. Featured flats */}
      {featuredFlats.length > 0 && (
        <section className="border-t border-line px-6 py-24 md:px-16 md:py-32">
          <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <Reveal>
                <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">Flat Sale</p>
              </Reveal>
              <LineReveal
                className="font-display text-5xl leading-[1.05] text-brand md:text-7xl"
                lines={["Flats made for", <span key="l" className="italic text-accent">living well</span>]}
              />
            </div>
            <Reveal>
              <ButtonLink href="/flats" variant="outline">
                View all flats
              </ButtonLink>
            </Reveal>
          </div>

          <div className="grid gap-x-8 gap-y-16 md:grid-cols-3">
            {featuredFlats.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.12}>
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
        </section>
      )}

      {/* 6. Secure investment */}
      {invest && (
        <section className="grid items-center gap-12 bg-brand-deep px-6 py-24 text-white md:grid-cols-2 md:gap-20 md:px-16 md:py-36">
          <div>
            <Reveal>
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent-bright">
                {invest.subtitle}
              </p>
            </Reveal>
            <LineReveal
              className="font-display text-5xl leading-[1.05] md:text-7xl"
              lines={[invest.title]}
            />
            <Reveal delay={0.2}>
              <RichText value={invest.body} className="mt-8 text-white/75" />
              {invest.button_text && invest.button_link && (
                <div className="mt-10">
                  <ButtonLink href={invest.button_link}>{invest.button_text}</ButtonLink>
                </div>
              )}
            </Reveal>
          </div>
          {investImg && (
            <ImageReveal
              src={investImg}
              alt={invest.title}
              className="aspect-4/5 w-full md:order-2"
            />
          )}
        </section>
      )}

      {/* 7. Testimonials */}
      {reviews.length > 0 && <Testimonials items={reviews} />}

      {/* 8. Partners */}
      {logos.length > 0 && (
        <section className="border-t border-line px-6 py-20 md:px-16">
          <Reveal>
            <p className="mb-12 text-center text-xs uppercase tracking-[0.3em] text-muted">
              Our Partners
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <PartnerStrip partners={logos} />
          </Reveal>
        </section>
      )}

      {/* 9. Book a visit */}
      <section className="border-t border-line px-6 py-28 text-center md:px-16 md:py-40">
        <Reveal>
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">Visit us</p>
        </Reveal>
        <LineReveal
          className="mx-auto max-w-4xl font-display text-5xl leading-[1.05] text-brand md:text-8xl"
          lines={["See your future", <span key="h" className="italic text-accent">in person</span>]}
        />
        <Reveal delay={0.3}>
          <p className="mx-auto mt-8 max-w-xl text-muted">
            Book a site visit and our team will show you around, answer your questions and help you
            choose with confidence.
          </p>
          <div className="mt-10">
            <ButtonLink href="/visit-booking">Book a Site Visit</ButtonLink>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
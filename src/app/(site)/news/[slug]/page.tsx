import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiOrNull } from "@/lib/api";
import type { NewsDetail } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import { formatDate } from "@/lib/format";
import Boundary from "@/components/ui/Boundary";
import DetailHero from "@/components/ui/DetailHero";
import RichText from "@/components/ui/RichText";
import ButtonLink from "@/components/ui/ButtonLink";
import Gallery from "@/components/sections/Gallery";
import Reveal from "@/components/motion/Reveal";
import LineReveal from "@/components/motion/LineReveal";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const n = await apiOrNull<NewsDetail>(`/news/${slug}/`);
  if (!n) return { title: "Post not found" };
  const img = mediaUrl(n.cover_image);
  return {
    title: n.meta_title || `${n.title} | Swapno Bari Housing Ltd.`,
    description: n.meta_description || n.excerpt,
    openGraph: { images: img ? [img] : [] },
  };
}

async function NewsContent({ params }: { params: Params }) {
  const { slug } = await params;
  const n = await apiOrNull<NewsDetail>(`/news/${slug}/`);
  if (!n) notFound();

  const isEvent = n.post_type === "event";
  const gallery = [...n.images]
    .sort((a, b) => a.order - b.order)
    .map((i) => ({ id: i.id, src: mediaUrl(i.image) as string, caption: i.caption }))
    .filter((i) => i.src);

  return (
    <main>
      <DetailHero
        image={n.cover_image}
        alt={n.title}
        crumbs={[{ label: "News & Events", href: "/news" }, { label: n.title }]}
        badge={n.post_type_display}
        tone={isEvent ? "accent" : "brand"}
        title={n.title}
        subtitle={`Published ${formatDate(n.published_at)}`}
      />

      <section className="px-6 py-20 md:px-16 md:py-28">
        <div className="mx-auto max-w-3xl">
          {isEvent && (n.event_date || n.event_location) && (
            <Reveal>
              <div className="mb-12 grid gap-6 border border-line bg-white/60 p-8 sm:grid-cols-2">
                {n.event_date && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">Date</p>
                    <p className="mt-2 font-display text-2xl text-brand">{formatDate(n.event_date)}</p>
                  </div>
                )}
                {n.event_location && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">Location</p>
                    <p className="mt-2 font-display text-2xl text-brand">{n.event_location}</p>
                  </div>
                )}
              </div>
            </Reveal>
          )}
          <Reveal>
            <RichText value={n.content} className="text-muted" />
          </Reveal>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="border-t border-line px-6 py-20 md:px-16 md:py-28">
          <LineReveal
            className="mb-14 font-display text-5xl leading-[1.05] text-brand md:text-7xl"
            lines={["More", <span key="p" className="italic text-accent">photos</span>]}
          />
          <Gallery images={gallery} />
        </section>
      )}

      <section className="border-t border-line px-6 py-20 text-center md:px-16">
        <ButtonLink href="/news" variant="outline">
          All news & events
        </ButtonLink>
      </section>
    </main>
  );
}

export default function NewsDetailPage({ params }: { params: Params }) {
  return (
    <Boundary>
      <NewsContent params={params} />
    </Boundary>
  );
}
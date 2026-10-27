import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiOrNull } from "@/lib/api";
import type { PlotDetail } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import { cap, formatNumber, formatPrice } from "@/lib/format";
import Boundary from "@/components/ui/Boundary";
import DetailHero from "@/components/ui/DetailHero";
import Facts from "@/components/ui/Facts";
import CtaCard from "@/components/ui/CtaCard";
import RichText from "@/components/ui/RichText";
import { statusTone } from "@/components/ui/badge";
import Gallery from "@/components/sections/Gallery";
import Reveal from "@/components/motion/Reveal";
import LineReveal from "@/components/motion/LineReveal";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await apiOrNull<PlotDetail>(`/plots/${slug}/`);
  if (!p) return { title: "Plot not found" };
  const img = mediaUrl(p.thumbnail);
  return {
    title: p.meta_title || `${p.title} | Swapno Bari Housing Ltd.`,
    description: p.meta_description || p.location,
    openGraph: { images: img ? [img] : [] },
  };
}

async function PlotContent({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await apiOrNull<PlotDetail>(`/plots/${slug}/`);
  if (!p) notFound();

  const price = formatPrice(p.price);
  const road = /^\d+(\.\d+)?$/.test(p.road_width) ? `${p.road_width} ft` : p.road_width;
  const bookHref = p.project_detail
    ? `/visit-booking?project=${p.project_detail.slug}`
    : "/visit-booking";

  const gallery = [...p.images]
    .sort((a, b) => a.order - b.order)
    .map((i) => ({ id: i.id, src: mediaUrl(i.image) as string, caption: i.caption }))
    .filter((i) => i.src);

  return (
    <main>
      <DetailHero
        image={p.thumbnail}
        alt={p.title}
        crumbs={[{ label: "Plots", href: "/plots" }, { label: p.title }]}
        badge={p.status_display}
        tone={statusTone(p.status)}
        title={p.title}
        subtitle={p.location}
      />

      <Facts
        items={[
          { label: "Plot size", value: `${formatNumber(p.size_katha)} Katha` },
          { label: "Facing", value: cap(p.facing) },
          { label: "Road width", value: road },
          { label: "Status", value: p.status_display },
          { label: "Project", value: p.project_detail?.title },
        ]}
      />

      <section className="grid gap-16 px-6 py-20 md:px-16 md:py-28 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Reveal>
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">Overview</p>
            <p className="font-display text-4xl text-brand md:text-5xl">
              {price || "Contact for price"}
            </p>
            {p.price_note && <p className="mt-3 max-w-xl text-sm text-muted">{p.price_note}</p>}
          </Reveal>
          <Reveal delay={0.1}>
            <RichText value={p.description} className="mt-10 text-muted" />
          </Reveal>
          {p.project_detail && (
            <Reveal delay={0.15}>
              <p className="mt-10 text-muted">
                Part of{" "}
                <Link href={`/projects/${p.project_detail.slug}`} className="text-accent underline">
                  {p.project_detail.title}
                </Link>
              </p>
            </Reveal>
          )}
        </div>

        <CtaCard
          heading="Interested in this plot?"
          text="Book a visit or contact our sales team for verified pricing and availability."
          actions={[
            { href: bookHref, label: "Book a Site Visit" },
            { href: "/contact", label: "Contact Us", variant: "outline" },
          ]}
        />
      </section>

      {gallery.length > 0 && (
        <section className="border-t border-line px-6 py-20 md:px-16 md:py-28">
          <Reveal>
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">Gallery</p>
          </Reveal>
          <LineReveal
            className="mb-14 font-display text-5xl leading-[1.05] text-brand md:text-7xl"
            lines={["Plot", <span key="g" className="italic text-accent">photos</span>]}
          />
          <Gallery images={gallery} />
        </section>
      )}
    </main>
  );
}

export default function PlotDetailPage({ params }: { params: Params }) {
  return (
    <Boundary>
      <PlotContent params={params} />
    </Boundary>
  );
}
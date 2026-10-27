import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiOrNull } from "@/lib/api";
import type { FlatDetail } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import { cap, formatDate, formatNumber, formatPrice } from "@/lib/format";
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
  const f = await apiOrNull<FlatDetail>(`/flats/${slug}/`);
  if (!f) return { title: "Flat not found" };
  const img = mediaUrl(f.thumbnail);
  return {
    title: f.meta_title || `${f.title} | Swapno Bari Housing Ltd.`,
    description: f.meta_description || f.location,
    openGraph: { images: img ? [img] : [] },
  };
}

async function FlatContent({ params }: { params: Params }) {
  const { slug } = await params;
  const f = await apiOrNull<FlatDetail>(`/flats/${slug}/`);
  if (!f) notFound();

  const perSft = Number(f.price_per_sft);
  const size = Number(f.size_sft);
  const total = perSft > 0 && size > 0 ? perSft * size : 0;
  const bookHref = f.project_detail
    ? `/visit-booking?project=${f.project_detail.slug}`
    : "/visit-booking";

  const gallery = [...f.images]
    .sort((a, b) => a.order - b.order)
    .map((i) => ({ id: i.id, src: mediaUrl(i.image) as string, caption: i.caption }))
    .filter((i) => i.src);

  return (
    <main>
      <DetailHero
        image={f.thumbnail}
        alt={f.title}
        crumbs={[{ label: "Flats", href: "/flats" }, { label: f.title }]}
        badge={f.status_display}
        tone={statusTone(f.status)}
        title={f.title}
        subtitle={f.location}
      />

      <Facts
        items={[
          { label: "Type", value: f.flat_type_display },
          { label: "Size", value: f.size_sft ? `${formatNumber(f.size_sft)} sft` : "" },
          { label: "Floor", value: f.floor },
          { label: "Bedrooms", value: f.bedrooms },
          { label: "Bathrooms", value: f.bathrooms },
          { label: "Balconies", value: f.balconies },
          { label: "Facing", value: cap(f.facing) },
          { label: "Car parking", value: f.car_parking },
          { label: "Handover", value: formatDate(f.handover_date) },
          { label: "Total units", value: f.number_of_units },
          {
            label: "Land",
            value: f.total_land ? `${formatNumber(f.total_land)} ${cap(f.total_land_unit)}` : "",
          },
          { label: "Project", value: f.project_detail?.title },
        ]}
      />

      <section className="grid gap-16 px-6 py-20 md:px-16 md:py-28 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Reveal>
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">Overview</p>
            <p className="font-display text-4xl text-brand md:text-5xl">
              {formatPrice(f.price_per_sft)} <span className="text-2xl text-muted">per sft</span>
            </p>
            {total > 0 && (
              <p className="mt-3 text-muted">Approx. total: {formatPrice(total)}</p>
            )}
          </Reveal>
          <Reveal delay={0.1}>
            <RichText value={f.description} className="mt-10 text-muted" />
          </Reveal>
          {f.project_detail && (
            <Reveal delay={0.15}>
              <p className="mt-10 text-muted">
                Part of{" "}
                <Link href={`/projects/${f.project_detail.slug}`} className="text-accent underline">
                  {f.project_detail.title}
                </Link>
              </p>
            </Reveal>
          )}
        </div>

        <CtaCard
          heading="Interested in this flat?"
          text="Book a visit or contact our sales team for current pricing and availability."
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
            lines={["Inside the", <span key="g" className="italic text-accent">flat</span>]}
          />
          <Gallery images={gallery} />
        </section>
      )}
    </main>
  );
}

export default function FlatDetailPage({ params }: { params: Params }) {
  return (
    <Boundary>
      <FlatContent params={params} />
    </Boundary>
  );
}
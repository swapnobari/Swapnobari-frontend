import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiOrNull } from "@/lib/api";
import type { CsrDetail } from "@/lib/types";
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
  const c = await apiOrNull<CsrDetail>(`/csr/${slug}/`);
  if (!c) return { title: "Activity not found" };
  const img = mediaUrl(c.cover_image);
  return {
    title: `${c.title} | Swapno Bari Housing Ltd.`,
    openGraph: { images: img ? [img] : [] },
  };
}

async function CsrContent({ params }: { params: Params }) {
  const { slug } = await params;
  const c = await apiOrNull<CsrDetail>(`/csr/${slug}/`);
  if (!c) notFound();

  const gallery = [...c.images]
    .sort((a, b) => a.order - b.order)
    .map((i) => ({ id: i.id, src: mediaUrl(i.image) as string, caption: i.caption }))
    .filter((i) => i.src);

  const meta = [formatDate(c.activity_date), c.location].filter(Boolean).join("  ·  ");

  return (
    <main>
      <DetailHero
        image={c.cover_image}
        alt={c.title}
        crumbs={[{ label: "CSR", href: "/csr" }, { label: c.title }]}
        title={c.title}
        subtitle={meta}
      />

      <section className="px-6 py-20 md:px-16 md:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <RichText value={c.description} className="text-muted" />
          </Reveal>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="border-t border-line px-6 py-20 md:px-16 md:py-28">
          <LineReveal
            className="mb-14 font-display text-5xl leading-[1.05] text-brand md:text-7xl"
            lines={["Moments", <span key="m" className="italic text-accent">from the day</span>]}
          />
          <Gallery images={gallery} />
        </section>
      )}

      <section className="border-t border-line px-6 py-20 text-center md:px-16">
        <ButtonLink href="/csr" variant="outline">
          All CSR activities
        </ButtonLink>
      </section>
    </main>
  );
}

export default function CsrDetailPage({ params }: { params: Params }) {
  return (
    <Boundary>
      <CsrContent params={params} />
    </Boundary>
  );
}
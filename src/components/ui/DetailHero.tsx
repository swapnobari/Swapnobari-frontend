import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import Reveal from "@/components/motion/Reveal";
import LineReveal from "@/components/motion/LineReveal";
import ImageReveal from "@/components/motion/ImageReveal";
import { TONE, type Tone } from "./badge";
import OverlayMarker from "@/components/layout/OverlayMarker";

type Crumb = { label: string; href?: string };

export default function DetailHero({
  image,
  alt,
  crumbs,
  badge,
  tone = "brand",
  title,
  subtitle,
}: {
  image: string | null;
  alt: string;
  crumbs: Crumb[];
  badge?: string;
  tone?: Tone;
  title: string;
  subtitle?: string;
}) {
  const src = mediaUrl(image);

  return (
    <section className="relative flex h-[75svh] min-h-[520px] items-end overflow-hidden bg-brand-deep text-white">
      <OverlayMarker />
      {src && (
        <div className="absolute inset-0">
          <ImageReveal src={src} alt={alt} priority sizes="100vw" className="h-full w-full" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="relative w-full px-6 pb-14 md:px-16 md:pb-20">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs uppercase tracking-[0.25em] text-white/70">
          {crumbs.map((c, i) => (
            <span key={c.label}>
              {i > 0 && <span className="mx-3">/</span>}
              {c.href ? (
                <Link href={c.href} className="transition hover:text-white">
                  {c.label}
                </Link>
              ) : (
                <span className="text-white">{c.label}</span>
              )}
            </span>
          ))}
        </nav>

        {badge && (
          <span
            className={`mb-5 inline-block rounded-full px-4 py-1 text-[11px] font-medium uppercase tracking-[0.2em] ${TONE[tone]}`}
          >
            {badge}
          </span>
        )}

        <LineReveal
          as="h1"
          className="max-w-5xl font-display text-5xl leading-[1.05] md:text-8xl"
          lines={[title]}
        />
        {subtitle && (
          <Reveal delay={0.4}>
            <p className="mt-6 max-w-2xl text-lg text-white/80">{subtitle}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
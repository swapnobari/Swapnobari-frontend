import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import LineReveal from "@/components/motion/LineReveal";
import { getBanner } from "@/lib/banners";
import { mediaUrl } from "@/lib/media";

export default async function PageHeader({
  eyebrow,
  lines,
  intro,
  page,
  small = false,
  children,
}: {
  eyebrow: string;
  lines: React.ReactNode[];
  intro?: string;
  page?: string; // banner key, for example "plots"
  small?: boolean; // smaller heading for long titles
  children?: React.ReactNode;
}) {
  const banner = page ? await getBanner(page) : null;
  const img = mediaUrl(banner?.image);
  const headLines = banner?.title ? [banner.title] : lines;
  const text = banner?.subtitle || intro;
  const size = small ? "text-5xl md:text-8xl" : "text-6xl md:text-9xl";

  const body = (
    <>
      <p className={`mb-6 text-xs uppercase tracking-[0.3em] ${img ? "text-white/80" : "text-accent"}`}>
        {eyebrow}
      </p>
      <LineReveal
        as="h1"
        className={`font-display leading-[1.05] ${size} ${img ? "text-white" : "text-brand"}`}
        lines={headLines}
      />
      {text && (
        <Reveal delay={0.3}>
          <p className={`mt-8 max-w-xl ${img ? "text-white/80" : "text-muted"}`}>{text}</p>
        </Reveal>
      )}
      {children && (
        <Reveal delay={0.4}>
          <div className="mt-10">{children}</div>
        </Reveal>
      )}
    </>
  );

  if (img) {
    return (
      <section className="relative w-full overflow-hidden bg-brand-deep text-white">
        {/* The image fills the whole section, edge to edge and from the very top */}
        <Image src={img} alt="" fill priority sizes="100vw" className="banner-img object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/50" />
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/50 to-transparent" />

        {/* Text padding lives here, never on the section itself */}
        <div className="relative flex min-h-[60svh] items-end px-6 pb-14 pt-40 md:min-h-[65svh] md:px-16 md:pb-20 md:pt-48">
          <div className="w-full">{body}</div>
        </div>
      </section>
    );
  }

  return <section className="px-6 pb-12 pt-36 md:px-16 md:pt-44">{body}</section>;
}
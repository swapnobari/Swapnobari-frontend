import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { LandownerPageData } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import Reveal from "@/components/motion/Reveal";
import LineReveal from "@/components/motion/LineReveal";
import ImageReveal from "@/components/motion/ImageReveal";
import RichText from "@/components/ui/RichText";
import ButtonLink from "@/components/ui/ButtonLink";
import AmenityIcon from "@/components/ui/AmenityIcon";

export const metadata: Metadata = {
  title: "Landowners | Swapno Bari Housing Ltd.",
  description: "Partner with Swapno Bari Housing Ltd. and turn your land into a development opportunity.",
};

export default async function LandownerPage() {
  const page = await api<LandownerPageData>("/landowner/page/");

  const img = mediaUrl(page.image);
  const benefits = page.benefits.filter((b) => b.is_active).sort((a, b) => a.order - b.order);
  const steps = page.steps.filter((s) => s.is_active).sort((a, b) => a.order - b.order);

  return (
    <main>
      {/* Hero */}
      <section className="px-6 pb-16 pt-36 md:px-16 md:pt-44">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">Landowners</p>
        <LineReveal
          as="h1"
          className="max-w-6xl font-display text-5xl leading-[1.05] text-brand md:text-8xl"
          lines={[page.title]}
        />
        {page.subtitle && (
          <Reveal delay={0.3}>
            <p className="mt-8 max-w-2xl font-display text-2xl italic text-accent md:text-3xl">
              {page.subtitle}
            </p>
            <div className="mt-10">
              <ButtonLink href="/landowner/land-share">Submit a Land-Share Request</ButtonLink>
            </div>
          </Reveal>
        )}
      </section>

      {img && (
        <section className="px-6 md:px-16">
          <ImageReveal
            src={img}
            alt={page.title}
            priority
            sizes="100vw"
            className="aspect-[16/9] w-full"
          />
        </section>
      )}

      {/* Description */}
      <section className="px-6 py-24 md:px-16 md:py-32">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <RichText value={page.description} className="text-muted" />
          </Reveal>
        </div>
      </section>

      {/* Benefits */}
      {benefits.length > 0 && (
        <section className="border-t border-line px-6 py-24 md:px-16 md:py-32">
          <Reveal>
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">Benefits</p>
          </Reveal>
          <LineReveal
            className="font-display text-5xl leading-[1.05] text-brand md:text-7xl"
            lines={["Why partner", <span key="u" className="italic text-accent">with us</span>]}
          />
          <ul className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <li key={b.id} className="bg-bg">
                <Reveal delay={(i % 3) * 0.08} className="flex h-full flex-col gap-5 p-8">
                  <span className="text-accent">
                    <AmenityIcon name={b.icon} />
                  </span>
                  <p className="font-display text-2xl text-brand">{b.title}</p>
                  <p className="text-muted">{b.description}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <section className="bg-brand-deep px-6 py-24 text-white md:px-16 md:py-32">
          <Reveal>
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent-bright">Process</p>
          </Reveal>
          <LineReveal
            className="font-display text-5xl leading-[1.05] md:text-7xl"
            lines={["How it", <span key="w" className="italic">works</span>]}
          />
          <ol className="mt-14">
            {steps.map((s, i) => (
              <li key={s.id} className="border-t border-white/15 py-10">
                <Reveal className="grid gap-6 md:grid-cols-[120px_1fr_2fr]">
                  <span className="font-display text-4xl italic text-accent-bright">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-3xl">{s.title}</h3>
                  <p className="text-white/75">{s.description}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 py-28 text-center md:px-16 md:py-40">
        <LineReveal
          className="mx-auto max-w-4xl font-display text-5xl leading-[1.05] text-brand md:text-8xl"
          lines={["Ready to", <span key="s" className="italic text-accent">start?</span>]}
        />
        <Reveal delay={0.3}>
          <p className="mx-auto mt-8 max-w-xl text-muted">
            Share a few details about your land and our team will get in touch.
          </p>
          <div className="mt-10">
            <ButtonLink href="/landowner/land-share">Submit a Land-Share Request</ButtonLink>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
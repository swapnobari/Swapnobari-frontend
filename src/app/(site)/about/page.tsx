import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { AboutData, FoundersMessage } from "@/lib/types";
import Reveal from "@/components/motion/Reveal";
import LineReveal from "@/components/motion/LineReveal";
import ImageReveal from "@/components/motion/ImageReveal";
import CountUp from "@/components/motion/CountUp";
import RichText from "@/components/ui/RichText";
import type { Key } from "react";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "About Us | Swapno Bari Housing Ltd.",
};

const MV_LABEL: Record<string, string> = {
  mission: "Our Mission",
  vision: "Our Vision",
};

export default async function About() {
  const [about, founder] = await Promise.all([
    api<AboutData>("/about/"),
    api<FoundersMessage>("/about/founders-message/"),
  ]);

  const stats = [
    { value: about.years_of_experience, label: "Years of experience" },
    { value: about.total_projects_delivered, label: "Projects delivered" },
    { value: about.happy_families, label: "Happy families" },
  ].filter((s) => s.value && s.value > 0);

  return (
    <main>
      {/* Hero */}
      <PageHeader
        page="about"
        eyebrow={about.subtitle || "About Us"}
        lines={["Turning dreams", <span key="t" className="italic text-accent">into reality</span>]}
      />
      <section className="px-6 pb-16 pt-36 md:px-16 md:pt-44">
        <LineReveal
          className="font-display text-6xl leading-[1.05] text-brand md:text-9xl"
          lines={[
            "Turning dreams",
            <span key="t" className="italic text-accent">
              into reality
            </span>,
          ]}
        />
      </section>

      {about.image && (
        <section className="px-6 md:px-16">
          <ImageReveal
            src={about.image}
            alt={about.title}
            priority
            sizes="100vw"
            className="aspect-video w-full"
          />
        </section>
      )}

      {/* Stats */}

      {/* Stats */}
      {stats.length > 0 && (
        <section className="grid gap-10 px-6 py-24 sm:grid-cols-3 md:px-16">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.1}
              className="flex flex-col items-center text-center"
            >
              <p className="font-display text-7xl text-brand md:text-8xl">
                <CountUp to={s.value as number} suffix="+" />
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted">
                {s.label}
              </p>
            </Reveal>
          ))}
        </section>
      )}

      <div className="border-y border-line px-6 py-10 text-center md:px-16">
        <Reveal>
          <p className="font-display text-5xl italic text-brand/30 md:text-8xl">
            Swapno Bari Housing
          </p>
        </Reveal>
      </div>

      {/* Description */}
      <section className="px-6 py-24 md:px-16">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <RichText value={about.description} />
          </Reveal>
        </div>
      </section>

      {/* Mission / Vision */}
      {about.mission_vision.map((mv, i) => (
        <section
          key={mv.id}
          className="grid items-center gap-12 border-t border-line px-6 py-24 md:grid-cols-2 md:px-16"
        >
          {mv.image && (
            <ImageReveal
              src={mv.image}
              alt={mv.title}
              className={`aspect-4/5 w-full ${i % 2 === 1 ? "md:order-2" : ""
                }`}
            />
          )}

          <div>
            <Reveal>
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                {mv.type_display}
              </p>

              <h2 className="font-display text-5xl text-brand md:text-7xl">
                {MV_LABEL[String(mv.type)] ?? mv.title}
              </h2>

              <p className="mt-3 font-display text-2xl italic text-accent">
                {mv.title}
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <RichText
                value={mv.description}
                className="mt-8 text-muted"
              />
            </Reveal>
          </div>
        </section>
      ))}

      {/* Core values */}
      {about.values.length > 0 && (
        <section className="border-t border-line px-6 py-24 md:px-16">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">What guides us</p>
          <LineReveal
            className="font-display text-5xl text-brand md:text-8xl"
            lines={["Our", <span key="v" className="italic text-accent">Core Values</span>]}
          />
          <ul className="mt-16">
           {about.values.map((v, i) => (
              <li key={v.id} className="border-t border-line py-10">
                <Reveal className="grid gap-6 md:grid-cols-[120px_1fr_2fr]">
                  <span className="font-display text-4xl italic text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-3xl text-brand md:text-4xl">{v.title}</h3>
                  <p className="text-muted">{v.description}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Founder's message */}
      <section className="grid items-center gap-12 bg-brand-deep px-6 py-24 text-white md:grid-cols-[1fr_1.4fr] md:px-16">
        {founder.image && (
          <ImageReveal
            src={founder.image}
            alt={founder.founder_name}
            className="aspect-3/4 w-full"
            sizes="(min-width: 768px) 40vw, 100vw"
          />
        )}
        <div>
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent-bright">
              Founder&apos;s Message
            </p>
            <h2 className="font-display text-5xl md:text-7xl">
              A message from our <span className="italic">Managing Director</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <RichText value={founder.message} className="mt-8 text-white/80" />
            <p className="mt-10 font-display text-3xl">{founder.founder_name}</p>
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">
              {founder.designation}
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
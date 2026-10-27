import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { TeamMember } from "@/lib/types";
import TeamShowcase from "@/components/sections/TeamShowcase";
import Reveal from "@/components/motion/Reveal";
import ButtonLink from "@/components/ui/ButtonLink";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Our Team | Swapno Bari Housing Ltd.",
  description: "Meet the people behind Swapno Bari Housing Ltd.",
};

export default async function TeamPage() {
  const members = (await api<TeamMember[]>("/teams/"))
    .filter((m) => m.is_active !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <main>
      <PageHeader
        page="team"
        eyebrow="Our Team"
        lines={["The people", <span key="t" className="italic text-accent">behind the homes</span>]}
        intro="A dedicated team committed to quality, transparency and trust in every project."
      />

      {members.length > 0 ? (
        <TeamShowcase members={members} />
      ) : (
        <p className="px-6 py-24 text-center font-display text-4xl text-brand md:px-16">
          Our team will be listed here soon.
        </p>
      )}

      <section className="border-t border-line px-6 py-24 text-center md:px-16">
        <Reveal>
          <p className="font-display text-4xl text-brand md:text-6xl">Want to work with us?</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/careers">See open positions</ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Contact us
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
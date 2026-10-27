import type { Metadata } from "next";
import { api, type Paginated } from "@/lib/api";
import type { CsrListItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import MediaCard from "@/components/ui/MediaCard";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "CSR | Swapno Bari Housing Ltd.",
  description: "How we give back to the communities around us.",
};

export default async function CsrPage() {
  const data = await api<Paginated<CsrListItem>>("/csr/?page_size=100");
  const items = [...data.results].sort((a, b) => a.order - b.order);

  return (
    <main>
      <PageHeader
        eyebrow="Corporate Social Responsibility"
        lines={["Building more", <span key="t" className="italic text-accent">than homes</span>]}
        intro="Responsible business means contributing positively to the communities around us."
      />

      <section className="px-6 py-16 md:px-16 md:py-24">
        {items.length > 0 ? (
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 0.1}>
                <MediaCard
                  href={`/csr/${c.slug}`}
                  image={c.cover_image}
                  alt={c.title}
                  title={c.title}
                  meta={[formatDate(c.activity_date), c.location]}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="py-24 text-center font-display text-4xl text-brand">
            Our CSR activities will be listed here soon.
          </p>
        )}
      </section>
    </main>
  );
}
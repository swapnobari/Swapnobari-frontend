import type { Metadata } from "next";
import Link from "next/link";
import { api, type Paginated } from "@/lib/api";
import type { NewsListItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import Boundary from "@/components/ui/Boundary";
import PageHeader from "@/components/ui/PageHeader";
import Pill from "@/components/ui/Pill";
import MediaCard from "@/components/ui/MediaCard";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "News & Events | Swapno Bari Housing Ltd.",
  description: "Company news, announcements and events.",
};

type SP = Promise<{ type?: string }>;

const TYPES = [
  { value: "", label: "All" },
  { value: "news", label: "News" },
  { value: "event", label: "Events" },
];

async function NewsContent({ searchParams }: { searchParams: SP }) {
  const { type = "" } = await searchParams;
  const data = await api<Paginated<NewsListItem>>("/news/?page_size=100");
  const all = [...data.results].sort(
    (a, b) => +new Date(b.published_at) - +new Date(a.published_at)
  );
  const shown = type ? all.filter((n) => n.post_type === type) : all;
  const countFor = (v: string) => (v ? all.filter((n) => n.post_type === v).length : all.length);

  return (
    <main>
      <PageHeader
        eyebrow="News & Events"
        lines={["What's", <span key="n" className="italic text-accent">happening</span>]}
        intro="Company announcements, project updates and upcoming events."
      />

      <section className="border-y border-line px-6 py-6 md:px-16">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          {TYPES.map((t) => (
            <Pill key={t.value} to={t.value ? `/news?type=${t.value}` : "/news"} active={type === t.value}>
              {t.label} <span className="opacity-60">({countFor(t.value)})</span>
            </Pill>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 md:px-16 md:py-24">
        {shown.length > 0 ? (
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((n, i) => (
              <Reveal key={n.id} delay={(i % 3) * 0.1}>
                <MediaCard
                  href={`/news/${n.slug}`}
                  image={n.cover_image}
                  alt={n.title}
                  badge={n.post_type_display}
                  tone={n.post_type === "event" ? "accent" : "brand"}
                  title={n.title}
                  text={n.excerpt}
                  meta={[
                    n.post_type === "event" && n.event_date
                      ? `Event ${formatDate(n.event_date)}`
                      : formatDate(n.published_at),
                    n.event_location,
                  ]}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-4xl text-brand">Nothing here yet</p>
            <Link href="/news" className="mt-8 inline-block text-accent underline">
              Show all
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default function NewsPage({ searchParams }: { searchParams: SP }) {
  return (
    <Boundary>
      <NewsContent searchParams={searchParams} />
    </Boundary>
  );
}
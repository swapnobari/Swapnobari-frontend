import type { Metadata } from "next";
import { getFooter, footerMapSrc } from "@/lib/footer";
import ContactForm from "@/components/forms/ContactForm";
import PageHeader from "@/components/ui/PageHeader";
import ButtonLink from "@/components/ui/ButtonLink";
import Reveal from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Contact Us | Swapno Bari Housing Ltd.",
  description: "Get in touch with Swapno Bari Housing Ltd.",
};

export default async function ContactPage() {
  const f = await getFooter();
  const map = f ? footerMapSrc(f) : null;
  const mapLink = f?.google_maps_link?.trim() ?? "";
  const wa = f ? f.whatsapp_number.replace(/\D/g, "") : "";

  const rows = f
    ? [
        { label: "Address", value: f.address },
        { label: "Phone", value: f.phone_1, href: f.phone_1 ? `tel:${f.phone_1}` : "" },
        { label: "Phone", value: f.phone_2, href: f.phone_2 ? `tel:${f.phone_2}` : "" },
        { label: "WhatsApp", value: f.whatsapp_number, href: wa ? `https://wa.me/${wa}` : "" },
        { label: "Email", value: f.email, href: f.email ? `mailto:${f.email}` : "" },
        { label: "Hours", value: f.working_hours },
      ].filter((r) => r.value)
    : [];

  return (
    <main>
      <PageHeader
        eyebrow="Contact"
        lines={["Let's talk", <span key="a" className="italic text-accent">about your home</span>]}
        intro="Questions about a project, a plot or a flat? Send us a message and our team will reply."
      />

      <section className="grid gap-16 px-6 pb-24 md:px-16 lg:grid-cols-[1fr_1.4fr]">
        <div>
          {rows.length > 0 && (
            <Reveal>
              <dl className="divide-y divide-line border-y border-line">
                {rows.map((r, i) => (
                  <div key={`${r.label}-${i}`} className="py-5">
                    <dt className="text-xs uppercase tracking-[0.25em] text-muted">{r.label}</dt>
                    <dd className="mt-1 font-display text-2xl text-brand">
                      {r.href ? (
                        <a
                          href={r.href}
                          target={r.href.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="transition hover:text-accent"
                        >
                          {r.value}
                        </a>
                      ) : (
                        r.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
          <Reveal delay={0.1}>
            <p className="mt-8 text-muted">
              Want to see a project in person?
            </p>
            <div className="mt-4">
              <ButtonLink href="/visit-booking" variant="outline">
                Book a Site Visit
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        <ContactForm />
      </section>

      {(map || mapLink) && (
        <section className="border-t border-line px-6 py-20 md:px-16">
          <div className="mb-8 flex items-end justify-between gap-6">
            <p className="font-display text-4xl text-brand">{f?.map_heading || "Find Us"}</p>
            {mapLink && (
              <ButtonLink href={mapLink} variant="outline">
                Open in Google Maps
              </ButtonLink>
            )}
          </div>
          {map && (
            <div className="overflow-hidden border border-line">
              <iframe
                src={map}
                title="Office location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="h-96 w-full grayscale transition duration-500 hover:grayscale-0"
              />
            </div>
          )}
        </section>
      )}
    </main>
  );
}
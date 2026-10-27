
import Image from "next/image";
import Link from "next/link";
import { getFooter, footerMapSrc } from "@/lib/footer";
import { NAV } from "@/lib/nav";
import { SITE } from "@/lib/site";
import type { Loose } from "@/lib/types";
import Year from "./Year";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// Short links (maps.app.goo.gl) can't be embedded. Follow the redirect on the
// server and pull the coordinates or place name out of the final URL.
async function resolveShortLink(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      next: { revalidate: 86400 },
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const finalUrl = decodeURIComponent(res.url);

    const coords =
      finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (coords) {
      return `https://maps.google.com/maps?q=${coords[1]},${coords[2]}&z=16&output=embed`;
    }

    const q = finalUrl.match(/[?&]q=([^&]+)/);
    if (q) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(q[1])}&z=16&output=embed`;
    }

    const place = finalUrl.match(/\/place\/([^/@?]+)/);
    if (place) {
      const name = place[1].replace(/\+/g, " ");
      return `https://maps.google.com/maps?q=${encodeURIComponent(name)}&z=16&output=embed`;
    }

    return null;
  } catch {
    return null;
  }
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 text-xs uppercase leading-none tracking-[0.3em] text-accent-bright">
      {children}
    </p>
  );
}

const linkCls = "transition hover:text-white";

export default async function Footer() {
  const f = await getFooter();

  const mapLink = f ? str(f.google_maps_link) : "";
  let mapSrc = f && f.show_map ? footerMapSrc(f) : null;
  if (!mapSrc && f?.show_map && mapLink) mapSrc = await resolveShortLink(mapLink);

  // The API allows any logo width. Keep it sensible in the footer.
  const logoW = Math.min(Math.max(f?.logo_width || 96, 72), 112);
  const logo = f?.logo || "/logo.png";

  const wa = f ? f.whatsapp_number.replace(/\D/g, "") : "";
  const groups = f?.link_groups ?? [];
  const socials = (f?.social_links ?? []).filter((s) => str(s.url));

  // "Saturday – Thursday: ... Friday: Closed" -> two lines
  const hours = f ? f.working_hours.replace(/\s+(Friday|Saturday|Sunday)/g, "\n$1").trim() : "";

  const contactRows = f
    ? [
        { label: "Address", value: f.address, href: "" },
        { label: "Phone", value: f.phone_1, href: f.phone_1 ? `tel:${f.phone_1}` : "" },
        { label: "Phone", value: f.phone_2, href: f.phone_2 ? `tel:${f.phone_2}` : "" },
        { label: "WhatsApp", value: f.whatsapp_number, href: wa ? `https://wa.me/${wa}` : "" },
        { label: "Email", value: f.email, href: f.email ? `mailto:${f.email}` : "" },
        { label: "Hours", value: hours, href: "" },
      ].filter((r) => r.value)
    : [];

  const showContact = (f?.show_contact ?? false) && contactRows.length > 0;
  const showLinks = f?.show_links ?? true;

  return (
    <footer className="bg-brand-deep text-white">
      <div className="grid gap-x-12 gap-y-14 px-6 py-20 md:grid-cols-2 md:px-16 lg:grid-cols-12">
        {/* Brand */}
        <div className="lg:col-span-5">
          {(f?.show_logo ?? true) && (
            <Link
              href={f?.logo_link || "/"}
              className="flex items-center gap-5"
              aria-label={SITE.name}
            >
              <Image
                src={logo}
                alt={f?.logo_alt_text || SITE.name}
                width={logoW}
                height={logoW}
                style={{ width: logoW, height: "auto" }}
                className="shrink-0"
              />
              <span className="font-display text-3xl leading-tight">{SITE.name}</span>
            </Link>
          )}

          {f?.show_about && f.about_text && (
            <div className="mt-8">
              {f.about_heading && <Heading>{f.about_heading}</Heading>}
              <p className="max-w-md leading-7 text-white/70">{f.about_text}</p>
            </div>
          )}

          {f?.show_social && socials.length > 0 && (
            <div className="mt-8">
              {f.social_heading && <Heading>{f.social_heading}</Heading>}
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {socials.map((s) => (
                  <li key={String(s.id)}>
                    <a
                      href={str(s.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 underline-offset-4 transition hover:text-white hover:underline"
                    >
                      {str(s.label) || str(s.platform_display) || str(s.platform)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Links */}
        {showLinks && (
          <nav aria-label="Footer" className="lg:col-span-3">
            {groups.length > 0 ? (
              <div className="space-y-10">
                {groups.map((g: Loose, gi) => {
                  const links = Array.isArray(g.links) ? (g.links as Loose[]) : [];
                  return (
                    <div key={gi}>
                      <Heading>{str(g.title) || str(g.heading) || str(g.name)}</Heading>
                      <ul className="space-y-3 text-white/70">
                        {links.map((l, li) => {
                          const href = str(l.url) || str(l.link) || str(l.href);
                          const label = str(l.label) || str(l.title) || str(l.name);
                          return href ? (
                            <li key={li}>
                              <Link href={href} className={linkCls}>
                                {label || href}
                              </Link>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <Heading>Quick Links</Heading>
                <ul className="space-y-3 text-white/70">
                  {NAV.map((n) => (
                    <li key={n.href}>
                      <Link href={n.href} className={linkCls}>
                        {n.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </nav>
        )}

        {/* Contact */}
        {showContact && (
          <div className="md:col-span-2 lg:col-span-4">
            <Heading>{f?.contact_heading || "Get in Touch"}</Heading>
            <dl className="space-y-5">
              {contactRows.map((r, i) => (
                <div key={`${r.label}-${i}`}>
                  <dt className="text-[11px] uppercase tracking-[0.25em] text-white/40">
                    {r.label}
                  </dt>
                  <dd className="mt-1 whitespace-pre-line text-white/85">
                    {r.href ? (
                      <a
                        href={r.href}
                        target={r.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className={linkCls}
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
          </div>
        )}
      </div>

      {/* Map */}
      {f?.show_map && (mapSrc || mapLink) && (
        <div className="px-6 pb-16 md:px-16">
          <div className="mb-4 flex items-end justify-between">
            <p className="font-display text-3xl">{f.map_heading || "Find Us"}</p>
            {mapLink && (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-[0.25em] text-white/70 transition hover:text-white"
              >
                Open in Google Maps ↗
              </a>
            )}
          </div>
          {mapSrc ? (
            <div className="overflow-hidden rounded-sm border border-white/10">
              <iframe
                src={mapSrc}
                title={`${SITE.name} location`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="w-full grayscale transition duration-500 hover:grayscale-0"
                style={{ height: f.map_height || 300 }}
              />
            </div>
          ) : (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full border border-white/30 px-8 py-3 transition hover:bg-white hover:text-brand-deep"
            >
              View our location on Google Maps ↗
            </a>
          )}
        </div>
      )}

      {/* Bottom bar */}
      <div className="flex flex-col gap-2 border-t border-white/10 px-6 py-6 text-xs text-white/50 md:flex-row md:justify-between md:px-16">
        <p>
          {f?.copyright_display || (
            <>
              © <Year /> {SITE.name} All rights reserved.
            </>
          )}
        </p>
        {f?.developed_by_text && (
          <p>
            {f.developed_by_url ? (
              <Link
                href={f.developed_by_url}
                {...(f.developed_by_url.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="transition hover:text-white"
              >
                {f.developed_by_text}
              </Link>
            ) : (
              f.developed_by_text
            )}
          </p>
        )}
      </div>
    </footer>
  );
}
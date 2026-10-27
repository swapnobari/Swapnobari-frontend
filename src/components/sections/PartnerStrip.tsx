import Image from "next/image";
import type { Partner } from "@/lib/types";
import { mediaUrl } from "@/lib/media";

function Logo({ p }: { p: Partner }) {
  const src = mediaUrl(p.logo);

  const inner = (
    <span className="relative block h-16 w-40 opacity-60 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0 md:h-20 md:w-48">
      {src ? (
        <Image src={src} alt={p.name} fill sizes="192px" className="object-contain" />
      ) : (
        <span className="flex h-full items-center justify-center text-center text-sm text-muted">
          {p.name}
        </span>
      )}
    </span>
  );

  return p.website_url ? (
    <a
      href={p.website_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={p.name}
      className="shrink-0 px-8"
    >
      {inner}
    </a>
  ) : (
    <div className="shrink-0 px-8">{inner}</div>
  );
}

export default function PartnerStrip({ partners }: { partners: Partner[] }) {
  if (!partners.length) return null;

  if (partners.length < 5) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-y-8">
        {partners.map((p) => (
          <Logo key={p.id} p={p} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="marquee-track flex w-max items-center">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {partners.map((p) => (
              <Logo key={`${k}-${p.id}`} p={p} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
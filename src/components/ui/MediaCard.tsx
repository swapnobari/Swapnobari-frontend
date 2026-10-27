import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import { TONE, type Tone } from "./badge";

type Props = {
  href: string;
  image: string | null;
  alt: string;
  badge?: string;
  tone?: Tone;
  title: string;
  text?: string;
  meta?: (string | null | undefined)[];
  aspect?: string;
};

export default function MediaCard({
  href,
  image,
  alt,
  badge,
  tone = "brand",
  title,
  text,
  meta = [],
  aspect = "aspect-[4/3]",
}: Props) {
  const src = mediaUrl(image);
  const items = meta.filter(Boolean) as string[];

  return (
    <Link href={href} className="group block cursor-pointer">
      <div className={`relative overflow-hidden bg-line ${aspect}`}>
        {src && (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
        )}
        {badge && (
          <span
            className={`absolute left-4 top-4 rounded-full px-4 py-1 text-[11px] font-medium uppercase tracking-[0.2em] ${TONE[tone]}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-3xl leading-tight text-brand transition-colors group-hover:text-accent">
            {title}
          </h3>
          {text && <p className="mt-2 line-clamp-3 text-muted">{text}</p>}
        </div>
        <span className="mt-2 text-2xl text-accent transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>

      {items.length > 0 && (
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-4 text-xs uppercase tracking-[0.2em] text-muted">
          {items.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </p>
      )}
    </Link>
  );
}
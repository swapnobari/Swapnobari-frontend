"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { Testimonial } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import ButtonLink from "@/components/ui/ButtonLink";
import LineReveal from "@/components/motion/LineReveal";

const ease = [0.22, 1, 0.36, 1] as const;

// Positions on desktop, as % of the container. depth = how far a tile drifts with the mouse.
type Slot = { x: number; y: number; w: number; a: string; depth: number };

const SLOTS: Slot[] = [
  // left side
  { x: 2, y: 20, w: 11, a: "4/5", depth: 10 },
  { x: 2, y: 58, w: 9, a: "1/1", depth: 18 },
  { x: 14, y: 4, w: 10, a: "4/5", depth: 14 },
  { x: 14.5, y: 42, w: 12, a: "1/1", depth: 8 },
  { x: 15, y: 74, w: 8, a: "1/1", depth: 20 },
  // right side
  { x: 87, y: 18, w: 11, a: "4/5", depth: 12 },
  { x: 89, y: 56, w: 9, a: "1/1", depth: 20 },
  { x: 74.5, y: 6, w: 11.5, a: "1/1", depth: 9 },
  { x: 75, y: 40, w: 10, a: "4/5", depth: 15 },
  { x: 76, y: 73, w: 8, a: "1/1", depth: 18 },
];

// Fill order keeps the cluster balanced between left and right
const ORDER = [0, 5, 3, 8, 2, 7, 1, 6, 4, 9];
const MIN_TILES = 6;

type Item =
  | { kind: "real"; t: Testimonial; idx: number }
  | { kind: "ghost"; tone: number };

const GHOST_TONE = [
  "bg-brand/10 text-brand",
  "bg-accent/10 text-accent",
  "bg-brand-deep text-white/80",
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function Stars({ rating }: { rating: number }) {
  const n = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="text-lg tracking-widest text-accent" role="img" aria-label={`${n} out of 5 stars`}>
      {"★".repeat(n)}
      <span className="text-line">{"★".repeat(5 - n)}</span>
    </span>
  );
}

// The visual card for one tile (photo, initials, or decorative)
function Face({
  item,
  active,
  className = "",
  style,
}: {
  item: Item;
  active: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const base = `relative overflow-hidden rounded-2xl transition-shadow duration-500 ${
    active ? "shadow-2xl ring-4 ring-white" : "shadow-md"
  } ${className}`;

  if (item.kind === "ghost") {
    return (
      <div
        aria-hidden
        style={style}
        className={`${base} flex items-center justify-center ${GHOST_TONE[item.tone % 3]}`}
      >
        <span className="font-display text-4xl leading-none">{item.tone % 2 ? "★" : "“"}</span>
      </div>
    );
  }

  const photo = mediaUrl(item.t.photo);
  return (
    <div style={style} className={`${base} bg-line`}>
      {photo ? (
        <Image src={photo} alt={item.t.name} fill sizes="180px" className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-brand font-display text-3xl text-white">
          {initials(item.t.name)}
        </span>
      )}
    </div>
  );
}

function Tile({
  item,
  slot,
  i,
  active,
  onActivate,
  mx,
  my,
  reduce,
}: {
  item: Item;
  slot: Slot;
  i: number;
  active: boolean;
  onActivate: () => void;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  reduce: boolean;
}) {
  const x = useTransform(mx, (v) => v * slot.depth);
  const y = useTransform(my, (v) => v * slot.depth);

  const float = reduce
    ? { scale: active ? 1.12 : 1 }
    : { y: [0, -12, 0], scale: active ? 1.12 : 1 };

  const floatTransition = reduce
    ? { scale: { duration: 0.5, ease } }
    : {
        y: { duration: 5 + (i % 4), repeat: Infinity, ease: "easeInOut" as const, delay: (i % 5) * 0.4 },
        scale: { duration: 0.5, ease },
      };

  const face = <Face item={item} active={active} style={{ aspectRatio: slot.a }} />;

  return (
    <motion.div
      className="absolute"
      style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.w}%`, x, y, zIndex: active ? 30 : 1 }}
    >
      <motion.div
        className="relative"
        initial={reduce ? false : { opacity: 0, scale: 0.6, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.9, delay: i * 0.09, ease }}
      >
        <motion.div animate={float} transition={floatTransition}>
          {item.kind === "real" ? (
            <button
              type="button"
              onMouseEnter={onActivate}
              onFocus={onActivate}
              onClick={onActivate}
              aria-label={`Show review from ${item.t.name}`}
              aria-pressed={active}
              className="block w-full cursor-pointer text-left"
            >
              {face}
            </button>
          ) : (
            face
          )}
        </motion.div>

        <AnimatePresence>
          {active && item.kind === "real" && (
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-xs font-medium text-brand shadow-lg"
            >
              {item.t.name}
              {item.t.designation && <span className="text-muted"> · {item.t.designation}</span>}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function Center({
  items,
  active,
  setActive,
}: {
  items: Testimonial[];
  active: number;
  setActive: (i: number) => void;
}) {
  const t = items[active];

  return (
    <div className="flex flex-col items-center text-center">
      <p className="mb-5 rounded-full border border-line bg-white/70 px-4 py-1 text-[11px] uppercase tracking-[0.3em] text-muted">
        Testimonials
      </p>

      <LineReveal
        className="font-display text-4xl leading-[1.05] text-brand md:text-5xl xl:text-6xl"
        lines={["Words from", <span key="c" className="italic text-accent">our clients</span>]}
      />

      <div className="mt-8 flex min-h-[220px] w-full flex-col items-center" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.figure
            key={t.id}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease }}
          >
            <Stars rating={t.rating} />
            <blockquote className="mt-4 max-w-md text-lg leading-8 text-muted">
              &ldquo;{t.message}&rdquo;
            </blockquote>
            <figcaption className="mt-5">
              <span className="block font-display text-2xl text-brand">{t.name}</span>
              {t.designation && (
                <span className="text-xs uppercase tracking-[0.25em] text-muted">{t.designation}</span>
              )}
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      {items.length > 1 && (
        <div className="mt-2 flex gap-2">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show testimonial ${i + 1}`}
              aria-current={i === active}
              className="py-3"
            >
              <span
                className={`block h-0.5 transition-all duration-500 ${
                  i === active ? "w-12 bg-accent" : "w-6 bg-line hover:bg-muted"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        <ButtonLink href="/contact">Talk to our team</ButtonLink>
      </div>
    </div>
  );
}

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const n = items.length;
  const reduce = !!useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const mx = useSpring(0, { stiffness: 60, damping: 20 });
  const my = useSpring(0, { stiffness: 60, damping: 20 });

  // Auto-cycle, pausing while the visitor is interacting
  useEffect(() => {
    if (n < 2 || paused || reduce) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % n), 6500);
    return () => clearTimeout(id);
  }, [active, n, paused, reduce]);

  const tiles = useMemo(() => {
    const total = Math.min(SLOTS.length, Math.max(n, MIN_TILES));
    return Array.from({ length: total }, (_, k): { item: Item; slot: Slot } => ({
      slot: SLOTS[ORDER[k]],
      item:
        k < n
          ? { kind: "real", t: items[k], idx: k }
          : { kind: "ghost", tone: k - n },
    }));
  }, [items, n]);

  if (!n) return null;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
    setPaused(false);
  };

  return (
    <section
      className="overflow-hidden border-t border-line px-6 py-24 md:px-16 md:py-32"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Desktop: floating photo cluster around the text */}
      <div
        className="relative mx-auto hidden h-[700px] max-w-[1400px] lg:block"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {tiles.map(({ item, slot }, i) => (
          <Tile
            key={item.kind === "real" ? item.t.id : `ghost-${i}`}
            item={item}
            slot={slot}
            i={i}
            active={item.kind === "real" && item.idx === active}
            onActivate={() => item.kind === "real" && setActive(item.idx)}
            mx={mx}
            my={my}
            reduce={reduce}
          />
        ))}

        <div className="absolute inset-y-0 left-[28%] right-[28%] z-10 flex items-center justify-center">
          <Center items={items} active={active} setActive={setActive} />
        </div>
      </div>

      {/* Mobile and tablet: small floating row, then the text */}
      <div className="lg:hidden">
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {tiles.map(({ item }, i) => {
            const isActive = item.kind === "real" && item.idx === active;
            const face = (
              <Face item={item} active={isActive} className="h-14 w-14 sm:h-16 sm:w-16" />
            );
            return (
              <motion.div
                key={item.kind === "real" ? item.t.id : `ghost-${i}`}
                initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.07, ease }}
              >
                <motion.div
                  animate={reduce ? undefined : { y: [0, -6, 0] }}
                  transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                >
                  {item.kind === "real" ? (
                    <button
                      type="button"
                      onClick={() => setActive(item.idx)}
                      aria-label={`Show review from ${item.t.name}`}
                      aria-pressed={isActive}
                      className="block cursor-pointer"
                    >
                      {face}
                    </button>
                  ) : (
                    face
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        <Center items={items} active={active} setActive={setActive} />
      </div>
    </section>
  );
}
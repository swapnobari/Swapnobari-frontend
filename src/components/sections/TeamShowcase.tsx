"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { TeamMember } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import LineReveal from "@/components/motion/LineReveal";

const ease = [0.22, 1, 0.36, 1] as const;

// The photo sits inset inside the card when inactive, and fills the whole card when active
const FULL = { top: "0%", left: "0%", right: "0%", bottom: "0%" };
const INSET = { top: "16%", left: "17%", right: "17%", bottom: "24%" };

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function Svg({ children, fill = false }: { children: React.ReactNode; fill?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const LinkedInIcon = () => (
  <Svg fill>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
  </Svg>
);
const FacebookIcon = () => (
  <Svg fill>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </Svg>
);
const MailIcon = () => (
  <Svg>
    <path d="M3 6h18v12H3z" />
    <path d="M3 7l9 6.5L21 7" />
  </Svg>
);
const PhoneIcon = () => (
  <Svg>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  </Svg>
);

function Social({
  href,
  label,
  active,
  external = true,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-500 ${
        active
          ? "bg-white text-brand hover:bg-accent hover:text-white"
          : "border border-line text-fg hover:border-brand hover:bg-brand hover:text-white"
      }`}
    >
      {children}
    </a>
  );
}

function Contacts({ m, active }: { m: TeamMember; active: boolean }) {
  return (
    <>
      {m.linkedin_url && (
        <Social href={m.linkedin_url} label={`${m.name} on LinkedIn`} active={active}>
          <LinkedInIcon />
        </Social>
      )}
      {m.facebook_url && (
        <Social href={m.facebook_url} label={`${m.name} on Facebook`} active={active}>
          <FacebookIcon />
        </Social>
      )}
      {m.email && (
        <Social href={`mailto:${m.email}`} label={`Email ${m.name}`} active={active} external={false}>
          <MailIcon />
        </Social>
      )}
      {m.phone && (
        <Social href={`tel:${m.phone}`} label={`Call ${m.name}`} active={active} external={false}>
          <PhoneIcon />
        </Social>
      )}
    </>
  );
}

export default function TeamShowcase({ members }: { members: TeamMember[] }) {
  const count = members.length;
  const reduce = !!useReducedMotion();
  const [active, setActive] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const locked = useRef(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (lockTimer.current) clearTimeout(lockTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    },
    []
  );

  const select = useCallback(
    (i: number) => {
      if (!count) return;
      const n = ((i % count) + count) % count;
      setActive(n);

      const track = trackRef.current;
      const card = cardRefs.current[n];
      if (track && card) {
        locked.current = true;
        track.scrollTo({ left: card.offsetLeft, behavior: reduce ? "auto" : "smooth" });
        if (lockTimer.current) clearTimeout(lockTimer.current);
        lockTimer.current = setTimeout(() => {
          locked.current = false;
        }, 900);
      }
    },
    [count, reduce]
  );

  // When the visitor swipes or drags the row, the card at the left becomes active
  const onScroll = () => {
    if (locked.current) return;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;
      let best = 0;
      let dist = Infinity;
      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        const d = Math.abs(c.offsetLeft - track.scrollLeft);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setActive(best);
    }, 140);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      select(Math.min(active + 1, count - 1));
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      select(Math.max(active - 1, 0));
    }
  };

  if (!count) return null;
  const current = members[active];

  return (
    <section className="px-6 py-20 md:px-16 md:py-28">
      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Heading */}
        <div className="lg:col-start-2 lg:row-start-1">
          <LineReveal
            className="font-display text-4xl leading-[1.05] md:text-6xl"
            lines={[
              <span key="a" className="text-brand">
                Our team
              </span>,
              <span key="b" className="text-muted">
                Committed to quality, transparency and trust
              </span>,
            ]}
          />
        </div>

        {/* Names */}
        <ul
          aria-label="Team members"
          className="flex flex-wrap gap-x-6 gap-y-3 lg:col-start-1 lg:row-start-2 lg:block lg:space-y-4"
        >
          {members.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => select(i)}
                aria-current={i === active}
                className={`flex items-center gap-3 text-left text-lg transition-colors duration-500 ${
                  i === active ? "text-fg" : "text-muted hover:text-fg"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full border transition-all duration-500 ${
                    i === active ? "border-fg bg-fg" : "border-muted/60 bg-transparent"
                  }`}
                />
                {m.name}
              </button>
            </li>
          ))}
        </ul>

        {/* Cards: the row runs off the right edge of the screen */}
        <div className="-mr-6 md:-mr-16 lg:col-start-2 lg:row-start-2">
          <div
            ref={trackRef}
            onScroll={onScroll}
            onKeyDown={onKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Team cards"
            className="no-scrollbar relative flex snap-x snap-mandatory gap-2 overflow-x-auto outline-none [--cw:78vw] sm:[--cw:360px] lg:[--cw:440px]"
          >
            {members.map((m, i) => {
              const isActive = i === active;
              const photo = mediaUrl(m.photo);

              return (
                <motion.article
                  key={m.id}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  initial={reduce ? false : { opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 0.9, delay: Math.min(i, 4) * 0.1, ease }}
                  aria-label={m.name}
                  className="relative aspect-[5/6] w-(--cw) shrink-0 snap-start overflow-hidden bg-[#f3f1ed]"
                >
                  {/* Photo: inset when inactive, full-bleed when active */}
                  <motion.div
                    initial={false}
                    animate={isActive ? FULL : INSET}
                    transition={{ duration: reduce ? 0 : 0.9, ease }}
                    className="absolute overflow-hidden bg-line"
                  >
                    <motion.div
                      initial={false}
                      animate={{ scale: isActive ? 1 : 1.08 }}
                      transition={{ duration: reduce ? 0 : 1.4, ease }}
                      className="absolute inset-0"
                    >
                      {photo ? (
                        <Image
                          src={photo}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 440px, (min-width: 640px) 360px, 78vw"
                          className="object-cover object-top"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-brand font-display text-6xl text-white">
                          {initials(m.name)}
                        </span>
                      )}
                    </motion.div>
                  </motion.div>

                  {/* Keeps the white text readable on the full-bleed photo */}
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent transition-opacity duration-700 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Click anywhere on the card to select it */}
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-pressed={isActive}
                    aria-label={`Show ${m.name}`}
                    className="absolute inset-0"
                  />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 md:p-6">
                    <div
                      className={`min-w-0 transition-colors duration-700 ${
                        isActive ? "text-white" : "text-fg"
                      }`}
                    >
                      <p className="text-lg leading-snug">{m.name}</p>
                      <p
                        className={`mt-0.5 text-sm leading-snug transition-colors duration-700 ${
                          isActive ? "text-white/75" : "text-muted"
                        }`}
                      >
                        {m.designation}
                      </p>
                    </div>
                    <div className="pointer-events-auto flex shrink-0 gap-2">
                      <Contacts m={m} active={isActive} />
                    </div>
                  </div>
                </motion.article>
              );
            })}

            {/* Lets the last card slide all the way to the left edge */}
            <div aria-hidden className="shrink-0" style={{ width: "calc(100% - var(--cw))" }} />
          </div>
        </div>

        {/* Controls and bio */}
        <div className="lg:col-start-2 lg:row-start-3">
          {count > 1 && (
            <div className="mb-8 flex items-center gap-6">
              <p className="font-display text-2xl italic text-brand">
                {String(active + 1).padStart(2, "0")}
                <span className="text-muted"> / {String(count).padStart(2, "0")}</span>
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => select(active - 1)}
                  disabled={active === 0}
                  aria-label="Previous person"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-line transition hover:border-brand hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-transparent disabled:hover:text-fg"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => select(active + 1)}
                  disabled={active === count - 1}
                  aria-label="Next person"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-line transition hover:border-brand hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-transparent disabled:hover:text-fg"
                >
                  →
                </button>
              </div>
            </div>
          )}

          <div aria-live="polite" className="min-h-40">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease }}
                className="max-w-2xl"
              >
                <p className="font-display text-3xl text-brand">{current.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-accent">{current.designation}</p>
                {current.bio && (
                  <p className="mt-5 whitespace-pre-line leading-7 text-muted">{current.bio}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
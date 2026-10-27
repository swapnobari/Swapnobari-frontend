
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import type { HeroSlide } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import ButtonLink from "@/components/ui/ButtonLink";

const OUT = [0.22, 1, 0.36, 1] as const;

const INTERVAL = 4000;
const DURATION = 1.5;

type State = {
  index: number;
  seq: number;
  first: boolean;
};

// Cinematic crossfade: no horizontal movement or side wipe.
const frame: Variants = {
  enter: {
    opacity: 0,
  },

  center: {
    opacity: 1,
    transition: {
      duration: DURATION,
      ease: OUT,
    },
  },

  exit: {
    opacity: 0,
    transition: {
      duration: DURATION,
      ease: OUT,
    },
  },
};

// Subtle cinematic camera movement.
const zoom: Variants = {
  enter: {
    scale: 1.08,
  },

  center: {
    scale: 1,
    transition: {
      duration: 6.5,
      ease: OUT,
    },
  },
};

// Respect users who prefer reduced motion.
const fade: Variants = {
  enter: {
    opacity: 0,
  },

  center: {
    opacity: 1,
    transition: {
      duration: 0.35,
    },
  },

  exit: {
    opacity: 0,
    transition: {
      duration: 0.25,
    },
  },
};

export default function HeroSlider({
  slides,
}: {
  slides: HeroSlide[];
}) {
  const count = slides.length;
  const reduce = useReducedMotion();
  const lock = useRef(false);

  const [paused, setPaused] = useState(false);

  const [s, setS] = useState<State>({
    index: 0,
    seq: 1,
    first: true,
  });

  // Delay the first text reveal if the site preloader has not completed.
  const [lead] = useState(() => {
    if (typeof window === "undefined") return 0;

    try {
      return sessionStorage.getItem("sb-preloaded") === "1"
        ? 0
        : 1.5;
    } catch {
      return 0;
    }
  });

  const go = useCallback(
    (target: number) => {
      if (lock.current || count < 2) return;

      const next = ((target % count) + count) % count;

      if (next === s.index) return;

      lock.current = true;

      window.setTimeout(() => {
        lock.current = false;
      }, DURATION * 1000 + 100);

      setS((prev) => ({
        index: next,
        seq: prev.seq + 1,
        first: false,
      }));
    },
    [count, s.index]
  );

  // Automatically advance slides after the page loads.
  useEffect(() => {
    if (count < 2 || paused) return;

    const timer = window.setTimeout(() => {
      go(s.index + 1);
    }, INTERVAL);

    return () => {
      window.clearTimeout(timer);
    };
  }, [count, paused, s.index, s.seq, go]);

  if (count === 0) return null;

  const slide = slides[s.index];
  const nextSlide = slides[(s.index + 1) % count];

  const img = mediaUrl(slide.image);
  const nextImg = mediaUrl(nextSlide.image);

  const textDelay = s.first ? lead + 0.7 : 0.2;

  return (
    <section
      className="relative h-svh min-h-[600px] overflow-hidden bg-brand-deep text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node | null
          )
        ) {
          setPaused(false);
        }
      }}
      aria-roledescription="carousel"
      aria-label="Featured projects"
    >
      {/* Cinematic background crossfade */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id}
          variants={reduce ? fade : frame}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 overflow-hidden"
        >
          <motion.div
            variants={reduce ? undefined : zoom}
            initial="enter"
            animate="center"
            className="absolute inset-0"
          >
            {img && (
              <Image
                src={img}
                alt=""
                fill
                priority={s.index === 0}
                sizes="100vw"
                className="object-cover"
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Premium contrast overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />

      {/* Optional subtle cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.18)_100%)]" />

      {/* Slide content */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-36 md:px-16 md:pb-40">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.id}
            initial={false}
          >
            {slide.subtitle && (
              <motion.p
                className="mb-5 text-xs uppercase tracking-[0.3em] text-white/80"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  duration: 0.7,
                  delay: textDelay,
                  ease: OUT,
                }}
              >
                {slide.subtitle}
              </motion.p>
            )}

            <h1 className="max-w-5xl font-display text-5xl leading-[1.05] md:text-8xl lg:text-9xl">
              <span className="block overflow-hidden pb-[0.12em]">
                <motion.span
                  className="block"
                  initial={{
                    opacity: 0,
                    y: reduce ? 0 : 26,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: reduce ? 0 : -10,
                    transition: {
                      duration: 0.25,
                      ease: OUT,
                    },
                  }}
                  transition={{
                    duration: reduce ? 0.3 : 0.9,
                    delay: textDelay + 0.1,
                    ease: OUT,
                  }}
                >
                  {slide.title}
                </motion.span>
              </span>
            </h1>

            {slide.button_text && slide.button_link && (
              <motion.div
                className="mt-8 md:mt-10"
                initial={{
                  opacity: 0,
                  y: reduce ? 0 : 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  duration: 0.7,
                  delay: textDelay + 0.35,
                  ease: OUT,
                }}
              >
                <ButtonLink
                  href={slide.button_link}
                  variant="light"
                >
                  {slide.button_text}
                </ButtonLink>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider navigation */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-6 pb-8 md:px-16">
          <div className="flex items-center gap-5 md:gap-6">
            {/* Slide counter */}
            <p className="font-display text-2xl italic">
              {String(s.index + 1).padStart(2, "0")}
              <span className="text-white/50">
                {" "}/ {String(count).padStart(2, "0")}
              </span>
            </p>

            {/* Animated progress indicators */}
            <div className="flex gap-2">
              {slides.map((sl, i) => (
                <button
                  key={sl.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={
                    i === s.index ? "true" : undefined
                  }
                  className="py-3"
                >
                  <span className="relative block h-0.5 w-10 overflow-hidden bg-white/30 md:w-16">
                    {i === s.index && (
                      <span
                        key={`${s.seq}-${paused ? "paused" : "running"}`}
                        className="absolute inset-0 origin-left bg-white"
                        style={
                          reduce
                            ? undefined
                            : {
                                animation: `hero-progress ${INTERVAL}ms linear 0s forwards`,
                                animationPlayState: paused
                                  ? "paused"
                                  : "running",
                              }
                        }
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Next slide preview and arrow controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(s.index + 1)}
              aria-label="Preview next slide"
              className="group hidden items-center gap-3 pr-3 md:flex"
            >
              <span className="text-xs uppercase tracking-[0.25em] text-white/70 transition-colors duration-300 group-hover:text-white">
                Next
              </span>

              <span className="relative h-14 w-24 overflow-hidden border border-white/30">
                {nextImg && (
                  <Image
                    src={nextImg}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={() => go(s.index - 1)}
              aria-label="Previous slide"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition-all duration-300 hover:bg-white hover:text-brand-deep md:h-12 md:w-12"
            >
              <span aria-hidden="true">←</span>
            </button>

            <button
              type="button"
              onClick={() => go(s.index + 1)}
              aria-label="Next slide"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition-all duration-300 hover:bg-white hover:text-brand-deep md:h-12 md:w-12"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

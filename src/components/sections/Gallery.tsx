"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

export type GalleryImage = { id: number; src: string; caption: string };

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const count = images.length;

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + count) % count)),
    [count]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  if (!count) return null;
  const current = open !== null ? images[open] : null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open image: ${img.caption || i + 1}`}
            className={`group relative cursor-zoom-in overflow-hidden bg-line ${
              i === 0 && count > 1 ? "sm:col-span-2 aspect-[16/10]" : "aspect-[4/3]"
            } ${count === 1 ? "sm:col-span-2 lg:col-span-3 aspect-[16/9]" : ""}`}
          >
            <Image
              src={img.src}
              alt={img.caption || ""}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
            {img.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-left text-sm text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            key="lightbox"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery"
            className="fixed inset-0 z-[90] flex flex-col bg-black/95 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between px-6 py-4 md:px-10">
              <p className="font-display text-xl italic">
                {String((open ?? 0) + 1).padStart(2, "0")}
                <span className="text-white/50"> / {String(count).padStart(2, "0")}</span>
              </p>
              <button
                type="button"
                onClick={close}
                className="text-sm uppercase tracking-[0.25em] transition hover:opacity-60"
              >
                Close
              </button>
            </div>

            <div className="relative flex-1" onClick={close}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  className="absolute inset-4 md:inset-10"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Image
                    src={current.src}
                    alt={current.caption || ""}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between px-6 py-5 md:px-10">
              <p className="text-white/70">{current.caption}</p>
              {count > 1 && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous image"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 transition hover:bg-white hover:text-black"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next image"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 transition hover:bg-white hover:text-black"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
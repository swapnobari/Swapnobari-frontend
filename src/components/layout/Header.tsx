"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MenuOverlay from "./MenuOverlay";
import { BOOKING_LINK } from "@/lib/nav";
import { SITE } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          open ? "bg-transparent text-white" : "bg-bg/80 text-fg backdrop-blur"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-3 md:px-16">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            aria-label={SITE.name}
            className="cursor-pointer"
          >
            <Image src="/logo.png" alt={SITE.name} width={56} height={56} priority />
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href={BOOKING_LINK.href}
              onClick={() => setOpen(false)}
              className="hidden cursor-pointer rounded-full border border-current px-5 py-2 text-sm transition hover:bg-accent hover:text-white md:inline-block"
            >
              {BOOKING_LINK.label}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="cursor-pointer text-sm font-medium uppercase tracking-[0.25em] transition-opacity hover:opacity-60"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>
      <Suspense fallback={null}>
        <MenuOverlay open={open} onClose={() => setOpen(false)} />
      </Suspense>
    </>
  );
}

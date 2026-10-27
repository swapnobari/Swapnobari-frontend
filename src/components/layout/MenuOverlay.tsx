"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { NAV, BOOKING_LINK } from "@/lib/nav";

const ease = [0.76, 0, 0.24, 1] as const;

export default function MenuOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <motion.nav
          key="menu"
          data-lenis-prevent
          aria-label="Main menu"
          className="fixed inset-0 z-40 overflow-y-auto bg-brand-deep px-6 pb-10 pt-28 text-white md:px-16"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)", transition: { duration: 0.8, ease } }}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.6, ease } }}
        >
          <ul className="grid gap-x-16 md:grid-cols-2">
            {NAV.map((item, i) => {
              const active = pathname === item.href;
              return (
                <li key={item.href} className="overflow-hidden border-b border-white/10">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{
                      y: "0%",
                      transition: { duration: 0.8, delay: 0.35 + i * 0.05, ease },
                    }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className="group flex cursor-pointer items-baseline gap-4 py-4"
                    >
                      <span className="font-accent text-xl italic text-accent-bright">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display text-4xl transition-transform duration-300 group-hover:translate-x-2 md:text-5xl ${
                          active ? "text-accent-bright" : ""
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="ml-auto text-white/40 transition group-hover:translate-x-1 group-hover:text-white">
                        →
                      </span>
                    </Link>
                  </motion.div>
                </li>
              );
            })}
          </ul>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1, duration: 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <Link
              href={BOOKING_LINK.href}
              onClick={onClose}
              className="inline-block cursor-pointer rounded-full bg-accent px-8 py-4 font-display text-xl transition hover:bg-accent-bright"
            >
              {BOOKING_LINK.label}
            </Link>
          </motion.div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
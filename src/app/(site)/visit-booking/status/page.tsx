import type { Metadata } from "next";
import { Suspense } from "react";
import StatusLookup from "@/components/forms/StatusLookup";
import LineReveal from "@/components/motion/LineReveal";

export const metadata: Metadata = {
  title: "Booking Status | Swapno Bari Housing Ltd.",
};

export default function StatusPage() {
  return (
    <main>
      <section className="px-6 pb-12 pt-36 md:px-16 md:pt-44">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">Site Visit</p>
        <LineReveal
          as="h1"
          className="font-display text-6xl leading-[1.05] text-brand md:text-9xl"
          lines={["Booking", <span key="s" className="italic text-accent">status</span>]}
        />
      </section>
      <section className="px-6 pb-24 md:px-16">
        <Suspense fallback={<div className="min-h-[300px]" aria-busy="true" />}>
          <StatusLookup />
        </Suspense>
      </section>
    </main>
  );
}
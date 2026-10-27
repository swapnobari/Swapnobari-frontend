"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Error</p>
      <h1 className="font-display text-4xl text-brand md:text-6xl">
        Somthing{" "}
        <span className="font-accent italic text-accent">is missing</span>
      </h1>
      <p className="max-w-md text-muted">
         Something went wrong while loading this page.
      </p>
      {error.digest && (
        <p className="text-xs text-muted/70">Ref: {error.digest}</p>
      )}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-accent px-8 py-3 text-white transition hover:bg-accent-bright"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-line px-8 py-3 transition hover:border-fg"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
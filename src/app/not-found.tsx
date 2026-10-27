import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-display text-2xl text-brand">
        Loading<span className="animate-pulse">...</span>
      </p>
      <Link
        href="/"
        className="rounded-full bg-accent px-8 py-3 text-white transition hover:bg-accent-bright"
      >
        Go to Home Page
      </Link>
    </main>
  );
}
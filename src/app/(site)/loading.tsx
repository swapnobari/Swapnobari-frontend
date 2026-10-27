export default function Loading() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-5"
      role="status"
      aria-live="polite"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-line border-t-accent" />
      <p className="font-display text-2xl text-brand">
        Loading<span className="animate-pulse">...</span>
      </p>
      <p className="text-[10px] uppercase tracking-[0.35em] text-muted">Loading</p>
    </main>
  );
}
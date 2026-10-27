const btn =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

export const btnPrimary = `${btn} bg-brand text-white hover:bg-brand-deep`;
export const btnGhost = `${btn} border border-line bg-white text-fg hover:border-brand hover:text-brand`;
export const btnDanger = `${btn} bg-accent text-white hover:bg-accent-bright`;

export const inputCls =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-fg outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/15 aria-[invalid=true]:border-accent";
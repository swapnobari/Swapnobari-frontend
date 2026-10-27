import type { ReactNode } from "react";

export const inputCls =
  "w-full border-b border-line bg-transparent py-3 text-fg outline-none transition placeholder:text-muted/50 focus:border-brand aria-[invalid=true]:border-accent";

export function Field({
  label,
  error,
  hint,
  optional,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted">
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal opacity-60">(optional)</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-sm text-accent">
          {error}
        </span>
      )}
    </label>
  );
}
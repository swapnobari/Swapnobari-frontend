"use client";

import { useEffect, useRef } from "react";

const stack: symbol[] = [];

export default function Modal({
  title,
  onClose,
  children,
  locked = false,
  size = "max-w-2xl",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  locked?: boolean;
  size?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  const isLocked = useRef(locked);

  useEffect(() => {
    close.current = onClose;
    isLocked.current = locked;
  });

  useEffect(() => {
    const id = Symbol("modal");
    stack.push(id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stack[stack.length - 1] === id && !isLocked.current) close.current();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("input, textarea, select, button")?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      stack.splice(stack.indexOf(id), 1);
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 md:p-10"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !locked) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${size} rounded-lg bg-white shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-2xl text-brand">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={locked}
            aria-label="Close"
            className="text-2xl leading-none text-muted transition hover:text-fg disabled:opacity-40"
          >
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
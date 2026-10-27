"use client";

import { useEffect, useRef } from "react";

export function plainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeUrl(u: string) {
  const v = u.trim();
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(v)) return v;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(v)) return `https://${v}`;
  return null;
}

type Tool = { label: string; title: string; cls?: string; cmd: string; arg?: string };

const TOOLS: Tool[] = [
  { label: "B", title: "Bold", cls: "font-bold", cmd: "bold" },
  { label: "I", title: "Italic", cls: "italic", cmd: "italic" },
  { label: "H2", title: "Large heading", cmd: "formatBlock", arg: "<h2>" },
  { label: "H3", title: "Small heading", cmd: "formatBlock", arg: "<h3>" },
  { label: "Text", title: "Normal paragraph", cmd: "formatBlock", arg: "<p>" },
  { label: "• List", title: "Bullet list", cmd: "insertUnorderedList" },
  { label: "1. List", title: "Numbered list", cmd: "insertOrderedList" },
];

const btn = "rounded px-2.5 py-1 text-xs transition hover:bg-bg";

export default function RichTextField({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Set the starting content once. Re-setting it while typing would move the cursor.
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value;
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    onChange(plainText(el.innerHTML) ? el.innerHTML : "");
  };

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt("Link address, for example https://example.com");
    if (!url) return;
    const safe = safeUrl(url);
    if (!safe) {
      window.alert("That does not look like a valid link.");
      return;
    }
    exec("createLink", safe);
  };

  return (
    <div
      className={`rounded-md border bg-white ${
        invalid ? "border-accent" : "border-line focus-within:border-brand"
      }`}
    >
      <div className="flex flex-wrap gap-1 border-b border-line p-1.5">
        {TOOLS.map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            className={`${btn} ${t.cls ?? ""}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(t.cmd, t.arg)}
          >
            {t.label}
          </button>
        ))}
        <button type="button" title="Add link" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={addLink}>
          Link
        </button>
        <button
          type="button"
          title="Remove link"
          className={btn}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("unlink")}
        >
          Unlink
        </button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Formatted text"
        onInput={emit}
        onBlur={emit}
        onPaste={(e) => {
          e.preventDefault(); // paste as plain text so Word and web formatting never leaks in
          document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
          emit();
        }}
        className="rich max-h-90 min-h-40 overflow-y-auto px-3 py-2 text-sm outline-none"
      />
    </div>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import { FOCUS_LABEL, prepareImage, type Focus, type ImageSpec, type Prepared } from "@/lib/admin/image";
import { btnGhost } from "./styles";

export type ImageValue = { original: File; prepared: Prepared } | null;

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const ratio = (w: number, h: number) => {
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
};

export default function ImageField({
  label,
  spec,
  existingUrl,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  spec: ImageSpec;
  existingUrl?: string | null;
  value: ImageValue;
  onChange: (v: ImageValue) => void;
  error?: string;
  required?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);
  const [focus, setFocus] = useState<Focus>(spec.focus ?? "center");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  const contain = spec.mode === "contain";

  // Free the preview URL when it is replaced or the form closes
  useEffect(() => {
    const prev = urlRef.current;
    urlRef.current = value?.prepared.url ?? null;
    if (prev && prev !== urlRef.current) URL.revokeObjectURL(prev);
  }, [value]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  async function run(file: File, f: Focus) {
    setBusy(true);
    setLocalError("");
    try {
      onChange({ original: file, prepared: await prepareImage(file, spec, f) });
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Could not process this image.");
    } finally {
      setBusy(false);
    }
  }

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) await run(file, focus);
  }

  function changeFocus(f: Focus) {
    setFocus(f);
    if (value) run(value.original, f);
  }

  const preview = value?.prepared.url ?? existingUrl ?? null;
  const problem = localError || error;

  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-[0.15em] text-muted">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className="w-full max-w-[14rem] shrink-0 overflow-hidden rounded-md border border-line bg-bg"
          style={contain ? { height: "7rem" } : { aspectRatio: `${spec.width} / ${spec.height}` }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className={`h-full w-full ${contain ? "object-contain p-2" : "object-cover"}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2 text-xs text-muted">
          <p>
            Recommended <strong className="text-fg">{spec.width} × {spec.height} px</strong>
            {!contain && <> · {ratio(spec.width, spec.height)}</>} ·{" "}
            {contain ? "PNG, never cropped" : "JPG, PNG or WebP"}. We resize it automatically.
          </p>
          {spec.note && <p>{spec.note}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={btnGhost} onClick={() => input.current?.click()} disabled={busy}>
              {busy ? "Processing…" : preview ? "Replace image" : "Choose image"}
            </button>
            {!contain && value && (
              <label className="flex items-center gap-2">
                Crop focus
                <select
                  value={focus}
                  onChange={(e) => changeFocus(e.target.value as Focus)}
                  className="rounded-md border border-line bg-white px-2 py-1 text-xs"
                >
                  {(Object.keys(FOCUS_LABEL) as Focus[]).map((f) => (
                    <option key={f} value={f}>
                      {FOCUS_LABEL[f]}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {value && (
            <p className="text-fg">
              Ready: {value.prepared.width} × {value.prepared.height} px · {value.prepared.kb} KB
            </p>
          )}
          {value?.prepared.warning && <p className="text-amber-700">{value.prepared.warning}</p>}
          {problem && (
            <p role="alert" className="text-sm text-accent">
              {problem}
            </p>
          )}
        </div>
      </div>

      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="sr-only" tabIndex={-1} />
    </div>
  );
}
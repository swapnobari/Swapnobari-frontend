"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi, errorText } from "@/lib/admin/api";
import { normaliseList } from "@/lib/admin/list";
import { prepareImage, type ImageSpec, type Prepared } from "@/lib/admin/image";
import { mediaUrl } from "@/lib/media";
import type { Row } from "./types";
import { btnGhost, btnPrimary, inputCls } from "./styles";

type Pending = { key: string; prepared: Prepared; caption: string };

export default function GalleryManager({ base, spec }: { base: string; spec: ImageSpec }) {
  const endpoint = `${base}/images`;
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Row[] | null>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState("");
  const pendingRef = useRef<Pending[]>([]);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(
    () => () => pendingRef.current.forEach((p) => URL.revokeObjectURL(p.prepared.url)),
    []
  );

  const load = useCallback(async () => {
    try {
      const d = await adminApi<unknown>("GET", endpoint);
      setItems(normaliseList(d).sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0) || a.id - b.id));
    } catch (e) {
      setMessage({ kind: "error", text: errorText(e) });
      setItems([]);
    }
  }, [endpoint]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!list.length) return;

    setMessage(null);
    setBusy("Preparing photos…");
    const ok: Pending[] = [];
    const bad: string[] = [];
    for (const f of list) {
      try {
        ok.push({ key: `${f.name}-${f.size}-${Math.random()}`, prepared: await prepareImage(f, spec), caption: "" });
      } catch (err) {
        bad.push(`${f.name}: ${err instanceof Error ? err.message : "could not be read"}`);
      }
    }
    setPending((p) => [...p, ...ok]);
    if (bad.length) setMessage({ kind: "error", text: bad.join(" ") });
    setBusy("");
  }

  async function upload() {
    setMessage(null);
    const start = items?.length ?? 0;
    let done = 0;

    for (let i = 0; i < pending.length; i++) {
      const p = pending[i];
      setBusy(`Uploading ${i + 1} of ${pending.length}…`);
      const fd = new FormData();
      fd.append("image", p.prepared.file);
      if (p.caption.trim()) fd.append("caption", p.caption.trim());
      fd.append("order", String(start + i + 1));
      try {
        await adminApi("POST", endpoint, fd);
        URL.revokeObjectURL(p.prepared.url);
        done++;
      } catch (err) {
        setMessage({ kind: "error", text: `Stopped at photo ${i + 1}. ${errorText(err)}` });
        break;
      }
    }

    setPending((p) => p.slice(done));
    setBusy("");
    if (done) {
      if (done === pending.length) setMessage({ kind: "ok", text: `${done} photo${done > 1 ? "s" : ""} added.` });
      await load();
    }
  }

  async function remove(row: Row) {
    if (!window.confirm("Delete this photo from the website?")) return;
    try {
      await adminApi("DELETE", `${endpoint}/${row.id}`);
      setItems((r) => (r ? r.filter((x) => x.id !== row.id) : r));
    } catch (e) {
      setMessage({ kind: "error", text: errorText(e) });
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={btnGhost} disabled={!!busy} onClick={() => input.current?.click()}>
          Choose photos
        </button>
        <p className="text-xs text-muted">
          Each photo is cropped to {spec.width} × {spec.height} px automatically. You can pick several at once.
        </p>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={pick} className="sr-only" tabIndex={-1} />
      </div>

      {message && (
        <p
          role={message.kind === "ok" ? "status" : "alert"}
          className={`rounded-md border px-4 py-3 text-sm ${
            message.kind === "ok" ? "border-brand/30 bg-brand/5 text-brand" : "border-accent/30 bg-accent/5 text-accent"
          }`}
        >
          {message.text}
        </p>
      )}

      {pending.length > 0 && (
        <div className="rounded-md border border-dashed border-brand p-4">
          <p className="mb-3 text-sm font-medium text-brand">Ready to upload ({pending.length})</p>
          <ul className="space-y-3">
            {pending.map((p) => (
              <li key={p.key} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.prepared.url} alt="" className="h-14 w-20 shrink-0 rounded object-cover" />
                <input
                  className={inputCls}
                  placeholder="Caption (optional)"
                  value={p.caption}
                  maxLength={200}
                  onChange={(e) =>
                    setPending((list) => list.map((x) => (x.key === p.key ? { ...x, caption: e.target.value } : x)))
                  }
                />
                <button
                  type="button"
                  className="text-sm text-accent hover:underline"
                  disabled={!!busy}
                  onClick={() => {
                    URL.revokeObjectURL(p.prepared.url);
                    setPending((list) => list.filter((x) => x.key !== p.key));
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={`${btnPrimary} mt-4`} disabled={!!busy} onClick={upload}>
            {busy || `Upload ${pending.length} photo${pending.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {busy && pending.length === 0 && <p className="text-sm text-muted">{busy}</p>}

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Current photos{items ? ` (${items.length})` : ""}
        </p>
        {!items ? (
          <div className="h-32 animate-pulse rounded bg-line/60" aria-busy="true" />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted">No photos yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <li key={r.id} className="overflow-hidden rounded-md border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(String(r.image)) ?? ""} alt={String(r.caption ?? "")} className="aspect-[4/3] w-full object-cover" />
                <div className="flex items-center justify-between gap-2 p-2 text-xs">
                  <span className="truncate text-muted">{String(r.caption || "No caption")}</span>
                  <button type="button" className="shrink-0 text-accent hover:underline" onClick={() => remove(r)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
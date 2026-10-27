"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, errorText } from "@/lib/admin/api";
import { normaliseList } from "@/lib/admin/list";
import { mediaUrl } from "@/lib/media";
import type { Row } from "./types";
import Modal from "./Modal";
import { btnDanger, btnGhost, btnPrimary, inputCls } from "./styles";

type Kind = "text" | "date" | "time" | "datetime" | "long" | "email" | "phone" | "file";

export type InboxConfig = {
  title: string;
  singular: string;
  description?: string;
  endpoint: string;
  statuses: { value: string; label: string }[];
  waiting: string[]; // statuses that still need attention
  unreadKey?: string;
  titleKey: string;
  subKey?: string;
  columns: { key: string; label: string; kind?: "date" | "datetime" | "text" }[];
  details: { label: string; key: string; kind?: Kind }[];
  confirm?: boolean; // site visits: confirmed date and time
};

const dateFmt = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function get(row: Row, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), row);
}

const empty = (v: unknown) => v === null || v === undefined || v === "";

function time12(t: string) {
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  return `${h % 12 || 12}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function text(kind: string | undefined, v: unknown): string {
  if (empty(v)) return "—";
  const s = String(v);
  if (kind === "date") {
    const d = new Date(s);
    return Number.isNaN(d.getTime())
      ? s
      : s.length === 10
        ? new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d)
        : dateFmt.format(d);
  }
  if (kind === "datetime") {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? s : dateTimeFmt.format(d);
  }
  if (kind === "time") return time12(s);
  return s;
}

function Value({ kind, v }: { kind?: Kind; v: unknown }) {
  if (empty(v)) return <span className="text-muted">—</span>;
  const s = String(v);
  if (kind === "email")
    return (
      <a href={`mailto:${s}`} className="text-brand underline">
        {s}
      </a>
    );
  if (kind === "phone")
    return (
      <a href={`tel:${s}`} className="text-brand underline">
        {s}
      </a>
    );
  if (kind === "file")
    return (
      <a href={mediaUrl(s) ?? s} target="_blank" rel="noopener noreferrer" className="text-brand underline">
        Open file
      </a>
    );
  if (kind === "long") return <p className="whitespace-pre-line">{s}</p>;
  return <span>{text(kind, v)}</span>;
}

function Detail({
  config,
  id,
  onClose,
  onChanged,
}: {
  config: InboxConfig;
  id: number;
  onClose: () => void;
  onChanged: (message: string) => void;
}) {
  const [row, setRow] = useState<Row | null>(null);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [cDate, setCDate] = useState("");
  const [cTime, setCTime] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [askDelete, setAskDelete] = useState(false);

  // Opening an item also marks it as read on the server
  useEffect(() => {
    adminApi<Row>("GET", `${config.endpoint}/${id}`)
      .then((r) => {
        setRow(r);
        setStatus(String(r.status ?? ""));
        setNote(String(r.admin_note ?? ""));
        setCDate(String(r.confirmed_date ?? ""));
        setCTime(r.confirmed_time ? String(r.confirmed_time).slice(0, 5) : "");
      })
      .catch((e) => setLoadError(errorText(e)));
  }, [config.endpoint, id]);

  const showConfirmFields = config.confirm && (status === "confirmed" || status === "rescheduled");
  const t8 = (t: string) => (t.length === 5 ? `${t}:00` : t);

  async function save() {
    if (!row) return;
    setError("");
    setSaving(true);
    try {
      const base = `${config.endpoint}/${id}`;
      if (config.confirm && status === "confirmed") {
        if (!cDate || !cTime) {
          setError("Choose the confirmed date and time.");
          setSaving(false);
          return;
        }
        await adminApi("POST", `${base}/confirm`, {
          status,
          confirmed_date: cDate,
          confirmed_time: t8(cTime),
        });
        if (note !== String(row.admin_note ?? "")) await adminApi("PATCH", base, { admin_note: note });
      } else {
        const body: Record<string, unknown> = { status, admin_note: note };
        if (config.confirm && status === "rescheduled") {
          if (cDate) body.confirmed_date = cDate;
          if (cTime) body.confirmed_time = t8(cTime);
        }
        await adminApi("PATCH", base, body);
      }
      onChanged("Saved.");
    } catch (e) {
      setError(errorText(e));
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    try {
      await adminApi("DELETE", `${config.endpoint}/${id}`);
      onChanged("Deleted.");
    } catch (e) {
      setError(errorText(e));
      setSaving(false);
    }
  }

  const docs = row && Array.isArray(row.documents) ? (row.documents as Row[]) : [];

  return (
    <Modal title={`${config.singular.charAt(0).toUpperCase()}${config.singular.slice(1)}`} onClose={onClose} locked={saving} size="max-w-4xl">
      {loadError ? (
        <p className="p-6 text-accent">{loadError}</p>
      ) : !row ? (
        <div className="h-64 animate-pulse p-6" aria-busy="true" />
      ) : (
        <div className="grid gap-8 p-6 md:grid-cols-[1.3fr_1fr]">
          <dl className="divide-y divide-line">
            {config.details
              .filter((d) => !empty(get(row, d.key)))
              .map((d) => (
                <div key={d.key} className="grid gap-1 py-3 sm:grid-cols-[150px_1fr]">
                  <dt className="text-xs uppercase tracking-[0.15em] text-muted">{d.label}</dt>
                  <dd>
                    <Value kind={d.kind} v={get(row, d.key)} />
                  </dd>
                </div>
              ))}
            {docs.length > 0 && (
              <div className="grid gap-1 py-3 sm:grid-cols-[150px_1fr]">
                <dt className="text-xs uppercase tracking-[0.15em] text-muted">Documents</dt>
                <dd className="space-y-1">
                  {docs.map((d, i) => (
                    <p key={i}>
                      <a
                        href={mediaUrl(String(d.file ?? d.document ?? "")) ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand underline"
                      >
                        {String(d.doc_type_display ?? d.doc_type ?? "Document")}
                      </a>
                    </p>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          <div className="space-y-5">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-muted">Status</span>
              <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
                {config.statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            {showConfirmFields && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-muted">Date</span>
                  <input type="date" className={inputCls} value={cDate} onChange={(e) => setCDate(e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-muted">Time</span>
                  <input type="time" className={inputCls} value={cTime} onChange={(e) => setCTime(e.target.value)} />
                </label>
              </div>
            )}

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-muted">
                Internal note
              </span>
              <textarea rows={5} className={`${inputCls} resize-y`} value={note} onChange={(e) => setNote(e.target.value)} />
              <span className="mt-1 block text-xs text-muted">Only your team sees this.</span>
            </label>

            {error && (
              <p role="alert" className="border-l-2 border-accent bg-accent/5 p-3 text-sm text-accent">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="button" className={btnPrimary} onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              {askDelete ? (
                <>
                  <button type="button" className={btnDanger} onClick={remove} disabled={saving}>
                    Yes, delete
                  </button>
                  <button type="button" className={btnGhost} onClick={() => setAskDelete(false)} disabled={saving}>
                    No
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={`${btnGhost} hover:!border-accent hover:!text-accent`}
                  onClick={() => setAskDelete(true)}
                  disabled={saving}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function InboxManager({ config }: { config: InboxConfig }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const data = await adminApi<unknown>("GET", `${config.endpoint}?page_size=100`);
      setRows(
        normaliseList(data).sort(
          (a, b) => +new Date(String(b.created_at ?? 0)) - +new Date(String(a.created_at ?? 0)) || b.id - a.id
        )
      );
    } catch (e) {
      setLoadError(errorText(e));
    }
  }, [config.endpoint]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const label = (v: unknown) => config.statuses.find((s) => s.value === v)?.label ?? String(v ?? "—");
  const isNew = (r: Row) =>
    config.waiting.includes(String(r.status)) || (config.unreadKey ? r[config.unreadKey] === false : false);

  const shown = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!filter || r.status === filter) &&
        (!q ||
          [...config.columns.map((c) => c.key), config.titleKey].some((k) =>
            String(get(r, k) ?? "").toLowerCase().includes(q)
          ))
    );
  }, [rows, query, filter, config.columns, config.titleKey]);

  const waitingCount = rows ? rows.filter(isNew).length : 0;

  return (
    <div>
      <h1 className="font-display text-4xl text-brand">{config.title}</h1>
      {config.description && <p className="mt-1 max-w-xl text-sm text-muted">{config.description}</p>}

      {notice && (
        <p role="status" className="mt-6 rounded-md border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-brand">
          {notice}
        </p>
      )}

      <div className="mt-6 rounded-lg border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label={`Search ${config.title}`}
            className={`${inputCls} md:max-w-xs`}
          />
          <div className="flex flex-wrap items-center gap-2">
            {rows &&
              [{ value: "", label: "All" }, ...config.statuses].map((s) => {
                const count = s.value ? rows.filter((r) => r.status === s.value).length : rows.length;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setFilter(s.value)}
                    aria-pressed={filter === s.value}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      filter === s.value ? "border-brand bg-brand text-white" : "border-line hover:border-brand hover:text-brand"
                    }`}
                  >
                    {s.label} ({count})
                  </button>
                );
              })}
          </div>
        </div>

        {loadError ? (
          <div className="p-10 text-center">
            <p className="text-accent">{loadError}</p>
            <button type="button" className={`${btnGhost} mt-4`} onClick={load}>
              Try again
            </button>
          </div>
        ) : !rows ? (
          <div className="space-y-3 p-6" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-line/60" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <p className="p-12 text-center font-display text-2xl text-brand">
            {rows.length === 0 ? "Nothing here yet" : "Nothing matches"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-[0.15em] text-muted">
                  {config.columns.map((c) => (
                    <th key={c.key} className="px-4 py-3 font-medium">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer transition hover:bg-bg/60"
                    onClick={() => setOpenId(r.id)}
                  >
                    {config.columns.map((c, i) => (
                      <td key={c.key} className={`px-4 py-3 ${isNew(r) && i === 0 ? "font-semibold" : ""}`}>
                        {i === 0 && isNew(r) && (
                          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" aria-label="New" />
                        )}
                        {text(c.kind, get(r, c.key))}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          config.waiting.includes(String(r.status)) ? "bg-accent/10 text-accent" : "bg-line text-muted"
                        }`}
                      >
                        {label(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className={`${btnGhost} !px-3 !py-1.5`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenId(r.id);
                        }}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rows && <p className="mt-3 text-sm text-muted">{waitingCount} waiting for attention</p>}

      {openId !== null && (
        <Detail
          config={config}
          id={openId}
          onClose={() => {
            setOpenId(null);
            load(); // refreshes the read state
          }}
          onChanged={(m) => {
            setOpenId(null);
            setNotice(m);
            load();
          }}
        />
      )}
    </div>
  );
}
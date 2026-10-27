"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, errorText } from "@/lib/admin/api";
import { normaliseList } from "@/lib/admin/list";
import { mediaUrl } from "@/lib/media";
import type { Column, Extra, ResourceConfig, Row } from "./types";
import ResourceForm from "./ResourceForm";
import GalleryManager from "./GalleryManager";
import Modal from "./Modal";
import { btnDanger, btnGhost, btnPrimary, inputCls } from "./styles";
import { withLookups } from "@/lib/admin/lookups";

type Notice = { kind: "ok" | "error"; text: string } | null;

const dateFmt = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" });

function sortRows(rows: Row[]) {
  return [...rows].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0) || a.id - b.id);
}

function Cell({
  col,
  row,
  busy,
  onToggle,
}: {
  col: Column;
  row: Row;
  busy: boolean;
  onToggle: (row: Row, key: string) => void;
}) {
  const v = row[col.key];

  switch (col.kind) {
    case "image":
      return v ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(String(v)) ?? ""}
          alt=""
          className={`h-12 w-12 rounded bg-line ${col.fit === "contain" ? "object-contain p-1" : "object-cover"}`}
        />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded bg-line text-xs text-muted">—</span>
      );

    case "bool":
      return (
        <button
          type="button"
          role="switch"
          aria-checked={!!v}
          aria-label={`${col.label}: ${v ? "on" : "off"}`}
          disabled={busy}
          onClick={() => onToggle(row, col.key)}
          className={`relative h-6 w-11 rounded-full transition disabled:opacity-60 ${v ? "bg-brand" : "bg-line"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              v ? "left-5.5" : "left-0.5"
            }`}
          />
        </button>
      );

    case "flag": {
      const [yes, no] = col.labels ?? ["Yes", "No"];
      return (
        <span
          className={`rounded-full px-3 py-1 text-xs ${v ? "bg-brand/10 text-brand" : "bg-line text-muted"}`}
        >
          {v ? yes : no}
        </span>
      );
    }

    case "date": {
      if (!v) return <span className="text-muted">—</span>;
      const s = String(v);
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? (
        <span>{s}</span>
      ) : (
        <span className="whitespace-nowrap">
          {s.length === 10 ? new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d) : dateFmt.format(d)}
        </span>
      );
    }

    case "stars": {
      const n = Math.max(0, Math.min(5, Number(v) || 0));
      return (
        <span className="whitespace-nowrap text-accent" aria-label={`${n} out of 5`}>
          {"★".repeat(n)}
          <span className="text-line">{"★".repeat(5 - n)}</span>
        </span>
      );
    }

    case "longtext":
      return <p className="line-clamp-2 max-w-md text-muted">{String(v ?? "")}</p>;

    default:
      return (
        <div>
          <p className="font-medium text-fg">{v === null || v === undefined || v === "" ? "—" : String(v)}</p>
          {col.sub && row[col.sub] ? <p className="text-xs text-muted">{String(row[col.sub])}</p> : null}
        </div>
      );
  }
}

export default function ResourceManager({
  config,
  embedded = false,
}: {
  config: ResourceConfig;
  embedded?: boolean;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [opening, setOpening] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [extra, setExtra] = useState<{ row: Row; extra: Extra } | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const idKey = config.idKey ?? "id";

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const data = await adminApi<unknown>("GET", `${config.endpoint}?page_size=100`);
      const list = sortRows(normaliseList(data));
      setRows(config.lookups?.length ? await withLookups(list, config.lookups) : list);
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
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  const shown = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    const keys = config.searchKeys ?? config.columns.map((c) => c.key);
    return rows.filter(
      (r) =>
        (!filter || String(r[config.filter!.key]) === filter) &&
        (!q || keys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)))
    );
  }, [rows, query, filter, config.searchKeys, config.columns, config.filter]);

  async function openEdit(row: Row) {
    if (!config.detail) return setEditing(row);
    setOpening(row.id);
    try {
      setEditing(await adminApi<Row>("GET", `${config.endpoint}/${row[idKey]}`));
    } catch (e) {
      setNotice({ kind: "error", text: errorText(e) });
    } finally {
      setOpening(null);
    }
  }

  async function toggle(row: Row, key: string) {
    setBusyId(row.id);
    try {
      const fd = new FormData();
      fd.append(key, String(!row[key]));
      const updated = await adminApi<Row>("PATCH", `${config.endpoint}/${row[idKey]}`, fd);
      setRows((r) => (r ? r.map((x) => (x.id === row.id ? { ...x, ...updated } : x)) : r));
    } catch (e) {
      setNotice({ kind: "error", text: errorText(e) });
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await adminApi("DELETE", `${config.endpoint}/${deleting[idKey]}`);
      setRows((r) => (r ? r.filter((x) => x.id !== deleting.id) : r));
      setNotice({ kind: "ok", text: "Deleted." });
      setDeleting(null);
    } catch (e) {
      setNotice({ kind: "error", text: errorText(e) });
    } finally {
      setDeleteBusy(false);
    }
  }

  const Heading = embedded ? "h3" : "h1";
  const rowTitle = (r: Row) => String(r.title ?? r.name ?? "");

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Heading className={`font-display text-brand ${embedded ? "text-2xl" : "text-4xl"}`}>{config.title}</Heading>
          {config.description && !embedded && <p className="mt-1 max-w-xl text-sm text-muted">{config.description}</p>}
        </div>
        <button type="button" className={btnPrimary} onClick={() => setEditing("new")}>
          + Add {config.singular}
        </button>
      </div>

      {notice && (
        <p
          role="status"
          className={`mt-6 rounded-md border px-4 py-3 text-sm ${
            notice.kind === "ok" ? "border-brand/30 bg-brand/5 text-brand" : "border-accent/30 bg-accent/5 text-accent"
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="mt-6 rounded-lg border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${config.title.toLowerCase()}`}
            aria-label={`Search ${config.title}`}
            className={`${inputCls} md:max-w-xs`}
          />
          <div className="flex flex-wrap items-center gap-2">
            {config.filter &&
              rows &&
              [{ value: "", label: "All" }, ...config.filter.options].map((o) => {
                const count = o.value
                  ? rows.filter((r) => String(r[config.filter!.key]) === o.value).length
                  : rows.length;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setFilter(o.value)}
                    aria-pressed={filter === o.value}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      filter === o.value
                        ? "border-brand bg-brand text-white"
                        : "border-line hover:border-brand hover:text-brand"
                    }`}
                  >
                    {o.label} ({count})
                  </button>
                );
              })}
            {rows && (
              <p className="ml-2 text-sm text-muted">
                {shown.length} of {rows.length}
              </p>
            )}
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
              <div key={i} className="h-14 animate-pulse rounded bg-line/60" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-2xl text-brand">
              {rows.length === 0 ? `No ${config.title.toLowerCase()} yet` : "Nothing matches your search"}
            </p>
            {rows.length === 0 && (
              <button type="button" className={`${btnPrimary} mt-5`} onClick={() => setEditing("new")}>
                Add the first {config.singular}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-[0.15em] text-muted">
                  {config.columns.map((c) => (
                    <th key={c.key} className="px-4 py-3 font-medium">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((row) => (
                  <tr key={row.id} className="transition hover:bg-bg/60">
                    {config.columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 align-middle">
                        <Cell col={c} row={row} busy={busyId === row.id} onToggle={toggle} />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {config.extras?.map((x) => (
                          <button
                            key={x.label}
                            type="button"
                            className={`${btnGhost} !px-3 !py-1.5`}
                            onClick={() => setExtra({ row, extra: x })}
                          >
                            {x.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          className={`${btnGhost} !px-3 !py-1.5`}
                          disabled={opening === row.id}
                          onClick={() => openEdit(row)}
                        >
                          {opening === row.id ? "Opening…" : "Edit"}
                        </button>
                        <button
                          type="button"
                          className={`${btnGhost} !px-3 !py-1.5 hover:!border-accent hover:!text-accent`}
                          onClick={() => setDeleting(row)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <ResourceForm
          config={config}
          row={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(text) => {
            setEditing(null);
            setNotice({ kind: "ok", text });
            load();
          }}
        />
      )}

      {extra && (
        <Modal
          title={`${extra.extra.label}: ${rowTitle(extra.row)}`}
          onClose={() => setExtra(null)}
          size="max-w-4xl"
        >
          {extra.extra.kind === "gallery" ? (
            <GalleryManager base={`${config.endpoint}/${extra.row[idKey]}`} spec={extra.extra.spec} />
          ) : (
            <div className="p-6">
              <ResourceManager
                embedded
                config={{
                  ...extra.extra.config,
                  endpoint: `${config.endpoint}/${extra.row[idKey]}/${extra.extra.path}`,
                }}
              />
            </div>
          )}
        </Modal>
      )}

      {deleting && (
        <Modal title={`Delete ${config.singular}?`} onClose={() => setDeleting(null)} locked={deleteBusy} size="max-w-md">
          <div className="p-6">
            <p className="text-muted">
              This removes it from the website and cannot be undone. Use the visibility switch instead if you only want
              to hide it.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className={btnGhost} onClick={() => setDeleting(null)} disabled={deleteBusy}>
                Cancel
              </button>
              <button type="button" className={btnDanger} onClick={confirmDelete} disabled={deleteBusy}>
                {deleteBusy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
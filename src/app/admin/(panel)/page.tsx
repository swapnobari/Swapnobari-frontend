"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/admin/api";
import { ADMIN_NAV } from "@/components/admin/nav";

type Item = Record<string, unknown>;
type Loaded = { count: number; items: Item[] } | null;

async function load(path: string): Promise<Loaded> {
  try {
    const d = await adminApi<Item[] | { count?: number; results?: Item[] }>("GET", `${path}?page_size=100`);
    if (Array.isArray(d)) return { count: d.length, items: d };
    const items = d.results ?? [];
    return { count: d.count ?? items.length, items };
  } catch {
    return null;
  }
}

const STATS = [
  { key: "projects", label: "Projects", path: "/projects", href: "/admin/projects" },
  { key: "plots", label: "Plots", path: "/plots", href: "/admin/plots" },
  { key: "flats", label: "Flats", path: "/flats", href: "/admin/flats" },
  { key: "news", label: "News & events", path: "/news", href: "/admin/news" },
  { key: "csr", label: "CSR activities", path: "/csr", href: "/admin/csr" },
  { key: "jobs", label: "Jobs", path: "/careers", href: "/admin/careers" },
];

const INBOX = [
  {
    key: "bookings",
    label: "Site visit bookings",
    path: "/bookings",
    href: "/admin/bookings",
    waiting: (r: Item) => r.status === "pending",
    name: (r: Item) => String(r.name ?? ""),
    sub: (r: Item) => String(r.project_title ?? r.visit_type_display ?? ""),
  },
  {
    key: "land",
    label: "Land-share requests",
    path: "/landowner/requests",
    href: "/admin/land-share",
    waiting: (r: Item) => r.status === "pending",
    name: (r: Item) => String(r.owner_name ?? ""),
    sub: (r: Item) => String(r.land_location ?? ""),
  },
  {
    key: "messages",
    label: "Contact messages",
    path: "/contact",
    href: "/admin/messages",
    waiting: (r: Item) => r.status === "new",
    name: (r: Item) => String(r.name ?? ""),
    sub: (r: Item) => String(r.subject ?? ""),
  },
  {
    key: "applications",
    label: "Job applications",
    path: "/careers/applications",
    href: "/admin/applications",
    waiting: (r: Item) => r.status === "new",
    name: (r: Item) => String(r.name ?? ""),
    sub: (r: Item) => String(r.job_title ?? ""),
  },
];

const dateFmt = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" });

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, Loaded> | null>(null);
  const [inbox, setInbox] = useState<Record<string, Loaded> | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      const all = await Promise.all([
        ...STATS.map((s) => load(s.path).then((r) => [s.key, r] as const)),
        ...INBOX.map((s) => load(s.path).then((r) => [s.key, r] as const)),
      ]);
      if (!live) return;
      setStats(Object.fromEntries(all.slice(0, STATS.length)));
      setInbox(Object.fromEntries(all.slice(STATS.length)));
    })();
    return () => {
      live = false;
    };
  }, []);

  const ready = new Set(ADMIN_NAV.flatMap((g) => g.items).filter((i) => i.ready).map((i) => i.href));

  return (
    <div>
      <h1 className="font-display text-4xl text-brand">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">A quick look at your website content and incoming requests.</p>

      <h2 className="mb-3 mt-10 text-xs font-medium uppercase tracking-[0.25em] text-muted">Needs attention</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {INBOX.map((c) => {
          const d = inbox?.[c.key];
          const waiting = d ? d.items.filter(c.waiting).length : 0;
          const more = d && d.count > d.items.length;
          const body = (
            <div className="h-full rounded-lg border border-line bg-white p-5 transition hover:border-brand">
              <p className="text-sm text-muted">{c.label}</p>
              <p className="mt-2 font-display text-5xl text-brand">
                {!inbox ? "…" : d ? `${waiting}${more ? "+" : ""}` : "—"}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {d ? `waiting · ${d.count} total` : inbox ? "unavailable" : ""}
              </p>
              {d && d.items.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-line pt-3 text-sm">
                  {d.items.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span className="min-w-0 truncate">
                        <span className="font-medium">{c.name(r)}</span>
                        <span className="text-muted"> {c.sub(r) && `· ${c.sub(r)}`}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {r.created_at ? dateFmt.format(new Date(String(r.created_at))) : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
          return ready.has(c.href) ? (
            <Link key={c.key} href={c.href}>
              {body}
            </Link>
          ) : (
            <div key={c.key}>{body}</div>
          );
        })}
      </div>

      <h2 className="mb-3 mt-10 text-xs font-medium uppercase tracking-[0.25em] text-muted">Website content</h2>
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {STATS.map((s) => {
          const d = stats?.[s.key];
          const body = (
            <div className="rounded-lg border border-line bg-white p-5 transition hover:border-brand">
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-2 font-display text-4xl text-brand">{!stats ? "…" : d ? d.count : "—"}</p>
            </div>
          );
          return ready.has(s.href) ? (
            <Link key={s.key} href={s.href}>
              {body}
            </Link>
          ) : (
            <div key={s.key}>{body}</div>
          );
        })}
      </div>
    </div>
  );
}
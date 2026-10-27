"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin/api";
import { mediaUrl } from "@/lib/media";
import { ADMIN_NAV } from "./nav";

type Profile = { email?: string; full_name?: string; avatar?: string | null };

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);

  // A 401 redirects to login inside adminApi. Any other failure just leaves the name blank.
  useEffect(() => {
    const load = () =>
      adminApi<Profile>("GET", "/auth/profile")
        .then(setProfile)
        .catch(() => {});
    load();
    window.addEventListener("admin-profile-updated", load);
    return () => window.removeEventListener("admin-profile-updated", load);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    try {
      await fetch("/api/session/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
    }
  }

  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const displayName = profile?.full_name || profile?.email || "Admin";
  const avatar = mediaUrl(profile?.avatar);

  return (
    <div className="min-h-screen">
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-deep text-white transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Link href="/admin" className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Image src="/logo.png" alt="" width={40} height={40} />
          <span className="font-display text-xl leading-tight">
            Swapno Bari
            <span className="block text-[10px] uppercase tracking-[0.3em] text-white/50">Admin</span>
          </span>
        </Link>

        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
          {ADMIN_NAV.map((g) => (
            <div key={g.group} className="mb-5">
              <p className="mb-1 px-3 text-[10px] uppercase tracking-[0.3em] text-white/40">{g.group}</p>
              <ul>
                {g.items.map((i) => (
                  <li key={i.href}>
                    {i.ready ? (
                      <Link
                        href={i.href}
                        aria-current={active(i.href) ? "page" : undefined}
                        className={`block rounded-md px-3 py-2 text-sm transition ${
                          active(i.href) ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {i.label}
                      </Link>
                    ) : (
                      <span className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-white/30">
                        {i.label}
                        <span className="text-[9px] uppercase tracking-widest">Soon</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-md border border-line px-3 py-1.5 text-sm lg:hidden"
          >
            Menu
          </button>

          <Link
            href="/admin/profile"
            className="hidden items-center gap-3 text-sm text-muted transition hover:text-brand lg:flex"
          >
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand text-xs font-medium text-white">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </span>
            {displayName}
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/admin/profile" className="text-muted transition hover:text-brand lg:hidden">
              Profile
            </Link>
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-muted transition hover:text-brand">
              View site ↗
            </a>
            <button type="button" onClick={signOut} className="text-accent transition hover:underline">
              Sign out
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
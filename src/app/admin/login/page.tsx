"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { inputCls } from "@/components/admin/styles";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.detail ?? "Could not sign in. Please try again.");
        setBusy(false);
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
    } catch {
      setError("Network error. Please check your connection.");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <form onSubmit={onSubmit} noValidate className="w-full max-w-sm rounded-lg border border-line bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Image src="/logo.png" alt="Swapno Bari Housing Ltd." width={72} height={72} priority />
          <h1 className="mt-4 font-display text-3xl text-brand">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Swapno Bari Housing Ltd.</p>
        </div>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-muted">Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-muted">Password</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute inset-y-0 right-3 text-xs text-muted hover:text-fg"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-5 border-l-2 border-accent bg-accent/5 p-3 text-sm text-accent">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
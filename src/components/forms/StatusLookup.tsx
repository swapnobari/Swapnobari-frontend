"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { lookup, SubmitError } from "@/lib/client";
import { formatDate, formatTime } from "@/lib/format";
import { cleanPhone } from "@/lib/validators";
import { Field, inputCls } from "./Field";

type Result = {
  reference_code: string;
  name: string;
  visiting: string;
  visit_type_display: string;
  preferred_date: string;
  preferred_time_slot_display: string;
  status: string;
  status_display: string;
  confirmed_date: string | null;
  confirmed_time: string | null;
};

const BADGE: Record<string, string> = {
  pending: "bg-line text-fg",
  confirmed: "bg-brand text-white",
  rescheduled: "bg-accent text-white",
  completed: "bg-brand-deep text-white",
  cancelled: "bg-accent-bright text-white",
};

export default function StatusLookup() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("code") ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!code.trim() || !phone.trim()) {
      setError("Please enter your reference code and phone number.");
      return;
    }

    setLoading(true);
    try {
      const q = new URLSearchParams({ code: code.trim().toUpperCase(), phone: cleanPhone(phone) });
      setResult(await lookup<Result>(`/bookings/status/?${q.toString()}`));
    } catch (err) {
      if (err instanceof SubmitError && (err.status === 404 || err.status === 400)) {
        setError("We could not find a booking with that code and phone number.");
      } else if (err instanceof SubmitError) {
        setError(err.detail || "Something went wrong. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const rows = result
    ? [
        { l: "Name", v: result.name },
        { l: "Visiting", v: result.visiting || result.visit_type_display },
        { l: "Visit type", v: result.visit_type_display },
        {
          l: "Requested",
          v: `${formatDate(result.preferred_date)}, ${result.preferred_time_slot_display}`,
        },
        ...(result.confirmed_date
          ? [
              {
                l: "Confirmed for",
                v: `${formatDate(result.confirmed_date)}${
                  result.confirmed_time ? ` at ${formatTime(result.confirmed_time)}` : ""
                }`,
              },
            ]
          : []),
      ]
    : [];

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <form onSubmit={onSubmit} noValidate className="grid gap-8">
        <Field label="Reference code">
          <input
            className={inputCls}
            placeholder="SB-V-000001"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Field>
        <Field label="Phone number used for the booking">
          <input
            className={inputCls}
            type="tel"
            inputMode="tel"
            placeholder="01712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>

        {error && (
          <p role="alert" className="border-l-2 border-accent bg-accent/5 p-4 text-sm text-accent">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-accent px-10 py-4 font-medium text-white transition hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking..." : "Check Status"}
          </button>
        </div>
      </form>

      <div aria-live="polite">
        {result && (
          <div className="border border-line bg-white/60 p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-muted">{result.reference_code}</p>
            <span
              className={`mt-4 inline-block rounded-full px-5 py-1 text-xs font-medium uppercase tracking-[0.2em] ${
                BADGE[result.status] ?? "bg-line text-fg"
              }`}
            >
              {result.status_display}
            </span>
            <dl className="mt-8 divide-y divide-line">
              {rows.map((r) => (
                <div key={r.l} className="flex justify-between gap-6 py-3">
                  <dt className="text-muted">{r.l}</dt>
                  <dd className="text-right font-medium text-brand">{r.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
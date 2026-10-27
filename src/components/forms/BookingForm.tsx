"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submit, SubmitError } from "@/lib/client";
import { cleanPhone, isBdPhone, isEmail, todayLocal } from "@/lib/validators";
import { Field, inputCls } from "./Field";

export type ProjectOption = { id: number; title: string; slug: string };

const FIELD_NAMES = [
  "name",
  "phone",
  "email",
  "number_of_visitors",
  "visit_type",
  "project",
  "preferred_date",
  "preferred_time_slot",
  "message",
] as const;

const schema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name"),
    phone: z
      .string()
      .trim()
      .refine(isBdPhone, "Enter a valid Bangladesh mobile number, e.g. 01712345678"),
    email: z.string().trim().refine((v) => !v || isEmail(v), "Enter a valid email address"),
    number_of_visitors: z
      .string()
      .refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 20, "Enter 1 to 20 visitors"),
    visit_type: z.enum(["site", "office"]),
    project: z.string(),
    preferred_date: z
      .string()
      .min(1, "Choose a date")
      .refine((v) => v >= todayLocal(), "The date cannot be in the past"),
    preferred_time_slot: z.enum(["morning", "noon", "afternoon", "evening"]),
    message: z.string().trim().max(1000, "Please keep the message under 1000 characters"),
  })
  .superRefine((v, ctx) => {
    if (v.visit_type === "site" && !v.project) {
      ctx.addIssue({
        code: "custom",
        path: ["project"],
        message: "Choose the project you would like to visit",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export default function BookingForm({
  projects,
  defaultProjectId,
}: {
  projects: ProjectOption[];
  defaultProjectId: string;
}) {
  const [minDate, setMinDate] = useState("");
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState<{ code: string } | null>(null);

  useEffect(() => {
    setMinDate(todayLocal());
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      number_of_visitors: "1",
      visit_type: "site",
      project: defaultProjectId,
      preferred_date: "",
      preferred_time_slot: "morning",
      message: "",
    },
  });

  const visitType = watch("visit_type");

  const onSubmit = async (v: FormValues) => {
    setServerError("");

    const payload: Record<string, unknown> = {
      name: v.name,
      phone: cleanPhone(v.phone),
      number_of_visitors: Number(v.number_of_visitors),
      visit_type: v.visit_type,
      preferred_date: v.preferred_date,
      preferred_time_slot: v.preferred_time_slot,
    };
    if (v.email) payload.email = v.email;
    if (v.project) payload.project = Number(v.project);
    if (v.message) payload.message = v.message;

    try {
      const res = await submit<{ reference_code?: string }>("/bookings/", payload);
      setDone({ code: res.reference_code ?? "" });
      reset();
    } catch (e) {
      if (!(e instanceof SubmitError)) {
        setServerError("Something went wrong. Please try again.");
        return;
      }
      const general: string[] = [];
      if (e.detail) general.push(e.detail);
      for (const [k, msgs] of Object.entries(e.fields)) {
        if ((FIELD_NAMES as readonly string[]).includes(k)) {
          setError(k as keyof FormValues, { message: msgs[0] });
        } else {
          general.push(`${k}: ${msgs[0]}`);
        }
      }
      setServerError(general.join(" "));
    }
  };

  if (done) {
    return (
      <div className="border border-line bg-white/60 p-8 md:p-12" role="status">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Request received</p>
        <h2 className="mt-4 font-display text-5xl text-brand">Thank you!</h2>
        <p className="mt-4 text-muted">
          Our team will contact you to confirm your visit. Keep your reference code and the phone
          number you used. You will need both to check the status of your booking.
        </p>
        {done.code && (
          <p className="mt-8 inline-block border border-dashed border-brand px-6 py-4 font-display text-4xl tracking-wider text-brand">
            {done.code}
          </p>
        )}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={`/visit-booking/status${done.code ? `?code=${encodeURIComponent(done.code)}` : ""}`}
            className="rounded-full bg-accent px-8 py-3 text-white transition hover:bg-accent-bright"
          >
            Check booking status
          </Link>
          <button
            type="button"
            onClick={() => setDone(null)}
            className="rounded-full border border-line px-8 py-3 transition hover:border-fg"
          >
            Book another visit
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-8 border border-line bg-white/60 p-6 sm:grid-cols-2 md:p-10"
    >
      <fieldset className="sm:col-span-2">
        <legend className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">Type of visit</legend>
        <div className="flex flex-wrap gap-3">
          {[
            { value: "site", label: "Site visit" },
            { value: "office", label: "Office visit" },
          ].map((o) => (
            <label
              key={o.value}
              className="cursor-pointer rounded-full border border-line px-6 py-2 text-sm transition has-[:checked]:border-brand has-[:checked]:bg-brand has-[:checked]:text-white"
            >
              <input type="radio" value={o.value} className="sr-only" {...register("visit_type")} />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="sm:col-span-2">
        <Field
          label={visitType === "site" ? "Project to visit" : "Project of interest"}
          optional={visitType === "office"}
          error={errors.project?.message}
        >
          <select
            className={inputCls}
            aria-invalid={!!errors.project}
            {...register("project")}
          >
            <option value="">
              {visitType === "site" ? "Select a project" : "No specific project"}
            </option>
            {projects.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Full name" error={errors.name?.message}>
        <input
          className={inputCls}
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
      </Field>

      <Field label="Mobile number" error={errors.phone?.message} hint="e.g. 01712345678">
        <input
          className={inputCls}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          {...register("phone")}
        />
      </Field>

      <Field label="Email" optional error={errors.email?.message}>
        <input
          className={inputCls}
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </Field>

      <Field label="Number of visitors" error={errors.number_of_visitors?.message}>
        <input
          className={inputCls}
          type="number"
          min={1}
          max={20}
          inputMode="numeric"
          aria-invalid={!!errors.number_of_visitors}
          {...register("number_of_visitors")}
        />
      </Field>

      <Field label="Preferred date" error={errors.preferred_date?.message}>
        <input
          className={inputCls}
          type="date"
          min={minDate || undefined}
          aria-invalid={!!errors.preferred_date}
          {...register("preferred_date")}
        />
      </Field>

      <Field label="Preferred time" error={errors.preferred_time_slot?.message}>
        <select className={inputCls} {...register("preferred_time_slot")}>
          <option value="morning">Morning</option>
          <option value="noon">Noon</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>
      </Field>

      <div className="sm:col-span-2">
        <Field label="Message" optional error={errors.message?.message}>
          <textarea
            rows={4}
            className={`${inputCls} resize-y`}
            placeholder="Anything you would like us to know?"
            aria-invalid={!!errors.message}
            {...register("message")}
          />
        </Field>
      </div>

      {serverError && (
        <p role="alert" className="border-l-2 border-accent bg-accent/5 p-4 text-sm text-accent sm:col-span-2">
          {serverError}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-accent px-10 py-4 font-medium text-white transition hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Request a Visit"}
        </button>
      </div>
    </form>
  );
}
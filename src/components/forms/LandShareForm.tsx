"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submit, SubmitError } from "@/lib/client";
import { cleanPhone, isBdPhone, isEmail } from "@/lib/validators";
import { Field, inputCls } from "./Field";
import type { ProjectOption } from "./BookingForm";

const FIELD_NAMES = [
  "owner_name",
  "phone",
  "email",
  "project",
  "land_location",
  "land_size",
  "land_size_unit",
  "land_type",
  "message",
] as const;

const schema = z.object({
  owner_name: z.string().trim().min(2, "Please enter your full name"),
  phone: z
    .string()
    .trim()
    .refine(isBdPhone, "Enter a valid Bangladesh mobile number, e.g. 01712345678"),
  email: z.string().trim().refine((v) => !v || isEmail(v), "Enter a valid email address"),
  project: z.string(),
  land_location: z.string().trim().min(3, "Please describe where the land is"),
  land_size: z
    .string()
    .refine((v) => v.trim() !== "" && Number(v) > 0, "Enter the land size as a number"),
  land_size_unit: z.enum(["katha", "decimal", "bigha"]),
  land_type: z.string().trim().max(120, "Please keep this short"),
  message: z.string().trim().max(1500, "Please keep the message under 1500 characters"),
});

type FormValues = z.infer<typeof schema>;

const MAX_FILES = 5;
const MAX_MB = 10;
const ALLOWED = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

export default function LandShareForm({
  projects,
  defaultProjectId,
}: {
  projects: ProjectOption[];
  defaultProjectId: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState<{ code: string } | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      owner_name: "",
      phone: "",
      email: "",
      project: defaultProjectId,
      land_location: "",
      land_size: "",
      land_size_unit: "katha",
      land_type: "",
      message: "",
    },
  });

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    setFileError("");

    const next = [...files];
    for (const f of picked) {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED.includes(ext)) {
        setFileError(`${f.name}: only PDF, DOC, DOCX, JPG or PNG files are allowed.`);
        continue;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setFileError(`${f.name} is larger than ${MAX_MB} MB.`);
        continue;
      }
      if (next.length >= MAX_FILES) {
        setFileError(`You can attach up to ${MAX_FILES} files.`);
        break;
      }
      next.push(f);
    }
    setFiles(next);
  }

  const onSubmit = async (v: FormValues) => {
    setServerError("");

    const body = new FormData();
    body.append("owner_name", v.owner_name);
    body.append("phone", cleanPhone(v.phone));
    if (v.email) body.append("email", v.email);
    if (v.project) body.append("project", v.project);
    body.append("land_location", v.land_location);
    body.append("land_size", v.land_size);
    body.append("land_size_unit", v.land_size_unit);
    if (v.land_type) body.append("land_type", v.land_type);
    if (v.message) body.append("message", v.message);
    files.forEach((f) => body.append("documents", f));

    try {
      const res = await submit<{ reference_code?: string }>("/landowner/requests/", body);
      setDone({ code: res.reference_code ?? "" });
      setFiles([]);
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
          Our team will review your land details and contact you to discuss the next steps.
        </p>
        {done.code && (
          <p className="mt-8 inline-block border border-dashed border-brand px-6 py-4 font-display text-4xl tracking-wider text-brand">
            {done.code}
          </p>
        )}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-accent px-8 py-3 text-white transition hover:bg-accent-bright"
          >
            Back to home
          </Link>
          <button
            type="button"
            onClick={() => setDone(null)}
            className="rounded-full border border-line px-8 py-3 transition hover:border-fg"
          >
            Submit another request
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
      <Field label="Your full name" error={errors.owner_name?.message}>
        <input
          className={inputCls}
          autoComplete="name"
          aria-invalid={!!errors.owner_name}
          {...register("owner_name")}
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

      <Field label="Project" optional error={errors.project?.message}>
        <select className={inputCls} {...register("project")}>
          <option value="">General inquiry (no specific project)</option>
          {projects.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.title}
            </option>
          ))}
        </select>
      </Field>

      <div className="sm:col-span-2">
        <Field label="Land location" error={errors.land_location?.message}>
          <input
            className={inputCls}
            placeholder="Area, district"
            aria-invalid={!!errors.land_location}
            {...register("land_location")}
          />
        </Field>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-4">
        <Field label="Land size" error={errors.land_size?.message}>
          <input
            className={inputCls}
            type="number"
            step="any"
            min="0"
            inputMode="decimal"
            aria-invalid={!!errors.land_size}
            {...register("land_size")}
          />
        </Field>
        <Field label="Unit">
          <select className={inputCls} {...register("land_size_unit")}>
            <option value="katha">Katha</option>
            <option value="decimal">Decimal</option>
            <option value="bigha">Bigha</option>
          </select>
        </Field>
      </div>

      <Field label="Land type / current use" optional error={errors.land_type?.message}>
        <input
          className={inputCls}
          placeholder="e.g. Residential land"
          aria-invalid={!!errors.land_type}
          {...register("land_type")}
        />
      </Field>

      <div className="sm:col-span-2">
        <Field label="Proposed arrangement or message" optional error={errors.message?.message}>
          <textarea
            rows={4}
            className={`${inputCls} resize-y`}
            aria-invalid={!!errors.message}
            {...register("message")}
          />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted">
          Land documents <span className="ml-2 normal-case tracking-normal opacity-60">(optional)</span>
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={onFiles}
          className="block w-full cursor-pointer text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand file:px-5 file:py-2 file:text-white hover:file:bg-brand-deep"
        />
        <p className="mt-1 text-xs text-muted">
          Deed, map or khatian. Up to {MAX_FILES} files, {MAX_MB} MB each (PDF, DOC, DOCX, JPG, PNG).
        </p>
        {fileError && (
          <p role="alert" className="mt-2 text-sm text-accent">
            {fileError}
          </p>
        )}
        {files.length > 0 && (
          <ul className="mt-4 space-y-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between border border-line px-4 py-2 text-sm"
              >
                <span className="truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="ml-4 text-accent hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
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
          {isSubmitting ? "Sending..." : "Submit Land-Share Request"}
        </button>
      </div>
    </form>
  );
}
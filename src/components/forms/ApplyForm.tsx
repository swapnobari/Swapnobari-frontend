"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submit } from "@/lib/client";
import { cleanPhone, isBdPhone, isEmail } from "@/lib/validators";
import { Field, inputCls } from "./Field";
import { handleSubmitError } from "@/lib/form";

const NAMES = ["name", "email", "phone", "cover_letter", "resume"] as const;
const ALLOWED = ["pdf", "doc", "docx"];
const MAX_MB = 10;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().refine(isEmail, "Enter a valid email address"),
  phone: z.string().trim().refine(isBdPhone, "Enter a valid mobile number, e.g. 01712345678"),
  cover_letter: z.string().trim().max(3000, "Please keep this under 3000 characters"),
});

type Values = z.infer<typeof schema>;

export default function ApplyForm({ slug, jobTitle }: { slug: string; jobTitle: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", cover_letter: "" },
  });

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFileError("");
    if (!f) return setFile(null);

    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED.includes(ext)) {
      setFile(null);
      e.target.value = "";
      return setFileError("Please upload a PDF, DOC or DOCX file.");
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setFile(null);
      e.target.value = "";
      return setFileError(`The file must be smaller than ${MAX_MB} MB.`);
    }
    setFile(f);
  }

  const onSubmit = async (v: Values) => {
    setServerError("");
    if (!file) {
      setFileError("Please attach your CV or resume.");
      return;
    }

    const body = new FormData();
    body.append("name", v.name);
    body.append("email", v.email);
    body.append("phone", cleanPhone(v.phone));
    if (v.cover_letter) body.append("cover_letter", v.cover_letter);
    body.append("resume", file);

    try {
      await submit(`/careers/${slug}/apply/`, body);
      setDone(true);
      setFile(null);
      reset();
    } catch (e) {
      setServerError(handleSubmitError<Values>(e, setError, NAMES));
    }
  };

  if (done) {
    return (
      <div className="border border-line bg-white/60 p-8 md:p-12" role="status">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Application sent</p>
        <h2 className="mt-4 font-display text-5xl text-brand">Thank you!</h2>
        <p className="mt-4 text-muted">
          We received your application for {jobTitle}. Our team will contact you if your profile
          matches.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-8 rounded-full border border-line px-8 py-3 transition hover:border-fg"
        >
          Send another application
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-8 border border-line bg-white/60 p-6 sm:grid-cols-2 md:p-10"
    >
      <Field label="Full name" error={errors.name?.message}>
        <input className={inputCls} autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
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
      <div className="sm:col-span-2">
        <Field label="Email" error={errors.email?.message}>
          <input
            className={inputCls}
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Cover letter" optional error={errors.cover_letter?.message}>
          <textarea
            rows={5}
            className={`${inputCls} resize-y`}
            placeholder="Tell us briefly why you are a good fit"
            aria-invalid={!!errors.cover_letter}
            {...register("cover_letter")}
          />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted">CV / Resume</p>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={onFile}
          className="block w-full cursor-pointer text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand file:px-5 file:py-2 file:text-white hover:file:bg-brand-deep"
        />
        <p className="mt-1 text-xs text-muted">PDF, DOC or DOCX, up to {MAX_MB} MB.</p>
        {fileError && (
          <p role="alert" className="mt-2 text-sm text-accent">
            {fileError}
          </p>
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
          {isSubmitting ? "Sending..." : "Submit Application"}
        </button>
      </div>
    </form>
  );
}
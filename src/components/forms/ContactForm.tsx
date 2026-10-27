"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submit } from "@/lib/client";
import { cleanPhone, isBdPhone, isEmail } from "@/lib/validators";
import { Field, inputCls } from "./Field";
import { handleSubmitError } from "@/lib/form";

const NAMES = ["name", "email", "phone", "subject", "message"] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().refine(isEmail, "Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .refine((v) => !v || isBdPhone(v), "Enter a valid mobile number, e.g. 01712345678"),
  subject: z.string().trim().min(3, "Please add a subject").max(200, "Please keep it shorter"),
  message: z.string().trim().min(10, "Please write a little more").max(3000, "Please keep it under 3000 characters"),
});

type Values = z.infer<typeof schema>;

export default function ContactForm() {
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
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const onSubmit = async (v: Values) => {
    setServerError("");
    const payload: Record<string, unknown> = {
      name: v.name,
      email: v.email,
      subject: v.subject,
      message: v.message,
    };
    if (v.phone) payload.phone = cleanPhone(v.phone);

    try {
      await submit("/contact/", payload);
      setDone(true);
      reset();
    } catch (e) {
      setServerError(handleSubmitError<Values>(e, setError, NAMES));
    }
  };

  if (done) {
    return (
      <div className="border border-line bg-white/60 p-8 md:p-12" role="status">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Message sent</p>
        <h2 className="mt-4 font-display text-5xl text-brand">Thank you!</h2>
        <p className="mt-4 text-muted">We received your message and will get back to you soon.</p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-8 rounded-full border border-line px-8 py-3 transition hover:border-fg"
        >
          Send another message
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
      <Field label="Your name" error={errors.name?.message}>
        <input className={inputCls} autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input
          className={inputCls}
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </Field>
      <Field label="Mobile number" optional error={errors.phone?.message}>
        <input
          className={inputCls}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          {...register("phone")}
        />
      </Field>
      <Field label="Subject" error={errors.subject?.message}>
        <input className={inputCls} aria-invalid={!!errors.subject} {...register("subject")} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Message" error={errors.message?.message}>
          <textarea
            rows={6}
            className={`${inputCls} resize-y`}
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
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  );
}
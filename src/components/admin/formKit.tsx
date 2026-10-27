"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin/api";
import { normaliseList } from "@/lib/admin/list";
import { SubmitError } from "@/lib/client";
import { mediaUrl } from "@/lib/media";
import type { Field, Row } from "./types";
import ImageField, { type ImageValue } from "./ImageField";
import RichTextField, { plainText } from "./RichTextField";
import { inputCls } from "./styles";

export type Values = Record<string, string | boolean>;
export type Images = Record<string, ImageValue>;
export type Files = Record<string, File | null>;
export type Opt = { value: string; label: string };
export type OptionMap = Record<string, Opt[]>;

const pad = (n: number) => String(n).padStart(2, "0");

function toLocalInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function initialValues(fields: Field[], row: Row | null): Values {
  const v: Values = {};
  for (const f of fields) {
    if (f.type === "image" || f.type === "file") continue;
    const raw = row?.[f.name];
    if (f.type === "boolean") {
      v[f.name] = row ? Boolean(raw) : typeof f.default === "boolean" ? f.default : true;
    } else if (f.type === "datetime") {
      v[f.name] = row
        ? raw
          ? toLocalInput(String(raw))
          : ""
        : f.default === "now"
          ? toLocalInput(new Date().toISOString())
          : "";
    } else {
      v[f.name] = row
        ? raw === null || raw === undefined
          ? ""
          : String(raw)
        : f.default !== undefined
          ? String(f.default)
          : "";
    }
  }
  return v;
}

export function validateFields(
  fields: Field[],
  values: Values,
  images: Images,
  files: Files,
  row: Row | null
) {
  const errs: Record<string, string> = {};
  for (const f of fields) {
    if (f.type === "image") {
      if (f.required && !images[f.name] && !(row && row[f.name])) errs[f.name] = "Please choose an image.";
      continue;
    }
    if (f.type === "file") {
      if (f.required && !files[f.name] && !(row && row[f.name])) errs[f.name] = "Please choose a file.";
      continue;
    }
    if (f.type === "boolean") continue;

    if (f.type === "richtext") {
      if (f.required && !plainText(String(values[f.name] ?? ""))) errs[f.name] = `${f.label} is required.`;
      continue;
    }

    const v = String(values[f.name] ?? "").trim();
    if (f.required && !v) {
      errs[f.name] = `${f.label} is required.`;
      continue;
    }
    if (!v) continue;

    if (f.type === "number") {
      const n = Number(v);
      if (!Number.isFinite(n)) errs[f.name] = "Enter a number.";
      else if (f.min !== undefined && n < f.min) errs[f.name] = `Must be at least ${f.min}.`;
      else if (f.max !== undefined && n > f.max) errs[f.name] = `Must be at most ${f.max}.`;
    }
    if (f.maxLength && v.length > f.maxLength) errs[f.name] = `Keep this under ${f.maxLength} characters.`;
  }
  return errs;
}

// On edit, only fields that changed are sent, so nothing is cleared by accident.
export function buildFormData(
  fields: Field[],
  values: Values,
  init: Values,
  images: Images,
  files: Files,
  isEdit: boolean
) {
  const fd = new FormData();
  let count = 0;
  const add = (k: string, v: string | Blob) => {
    fd.append(k, v);
    count++;
  };

  for (const f of fields) {
    if (f.type === "image") {
      const i = images[f.name];
      if (i) add(f.name, i.prepared.file);
      continue;
    }
    if (f.type === "file") {
      const x = files[f.name];
      if (x) add(f.name, x);
      continue;
    }
    if (f.type === "boolean") {
      const now = Boolean(values[f.name]);
      if (!isEdit || now !== Boolean(init[f.name])) add(f.name, now ? "true" : "false");
      continue;
    }

    let v = String(values[f.name] ?? "").trim();
    if (f.type === "richtext" && !plainText(v)) v = "";

    if (isEdit) {
      if (v === String(init[f.name] ?? "").trim()) continue;
      const nonText =
        f.type === "number" || f.type === "date" || f.type === "datetime" || f.type === "select" || f.skipEmpty;
      if (v === "" && nonText) continue;
    } else if (v === "") {
      continue;
    }

    if (f.type === "datetime" && v) v = new Date(v).toISOString();
    add(f.name, v);
  }
  return { fd, empty: count === 0 };
}

export function parseSubmitError(err: unknown, names: string[]) {
  const fieldErrors: Record<string, string> = {};
  const extra: string[] = [];
  if (err instanceof SubmitError) {
    if (err.detail) extra.push(err.detail);
    for (const [k, m] of Object.entries(err.fields)) {
      if (names.includes(k)) fieldErrors[k] = m[0];
      else extra.push(`${k}: ${m[0]}`);
    }
  } else {
    extra.push("Something went wrong. Please try again.");
  }
  return { fieldErrors, general: extra.join(" ") };
}

// Loads the choices for select fields that depend on another module (for example, a project's category)
export function useFieldOptions(fields: Field[]) {
  const [opts, setOpts] = useState<OptionMap>({});

  useEffect(() => {
    let live = true;
    fields
      .filter((f) => f.optionsFrom)
      .forEach(async (f) => {
        const src = f.optionsFrom!;
        try {
          const data = await adminApi<unknown>("GET", `${src.endpoint}?page_size=100`);
          const list = normaliseList(data).map((r) => ({
            value: String(r[src.valueKey]),
            label: String(r[src.labelKey]),
          }));
          if (live) setOpts((p) => ({ ...p, [f.name]: list }));
        } catch {}
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return opts;
}

const labelCls = "mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-muted";

function Shell({ field, error, children }: { field: Field; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>
        {field.label}
        {field.required && <span className="ml-1 text-accent">*</span>}
      </span>
      {children}
      {field.help && !error && <span className="mt-1 block text-xs text-muted">{field.help}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-sm text-accent">
          {error}
        </span>
      )}
    </label>
  );
}

function FileInput({
  field,
  existing,
  file,
  onChange,
  error,
}: {
  field: Field;
  existing?: string | null;
  file: File | null;
  onChange: (f: File | null) => void;
  error?: string;
}) {
  const [local, setLocal] = useState("");
  const cfg = field.file ?? { accept: ".pdf", maxMB: 4 };

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setLocal("");
    if (!f) return onChange(null);
    if (f.size > cfg.maxMB * 1024 * 1024) {
      e.target.value = "";
      setLocal(`This file is larger than ${cfg.maxMB} MB. Please compress it first.`);
      return onChange(null);
    }
    onChange(f);
  }

  const url = mediaUrl(existing);
  const problem = local || error;

  return (
    <div>
      <span className={labelCls}>
        {field.label}
        {field.required && <span className="ml-1 text-accent">*</span>}
      </span>
      <input
        type="file"
        accept={cfg.accept}
        onChange={pick}
        className="block w-full cursor-pointer text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-brand-deep"
      />
      <p className="mt-1 text-xs text-muted">
        {field.help ?? `Up to ${cfg.maxMB} MB.`}
        {url && !file && (
          <>
            {" "}
            Current file:{" "}
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand underline">
              open
            </a>
          </>
        )}
        {file && ` Selected: ${file.name}`}
      </p>
      {problem && (
        <p role="alert" className="mt-1 text-sm text-accent">
          {problem}
        </p>
      )}
    </div>
  );
}

export function FieldsGrid({
  fields,
  values,
  set,
  errors,
  images,
  setImage,
  files,
  setFile,
  options,
  row,
}: {
  fields: Field[];
  values: Values;
  set: (name: string, v: string | boolean) => void;
  errors: Record<string, string>;
  images: Images;
  setImage: (name: string, v: ImageValue) => void;
  files: Files;
  setFile: (name: string, f: File | null) => void;
  options: OptionMap;
  row: Row | null;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {fields.map((f) => {
        const wide =
          f.wide || f.type === "textarea" || f.type === "richtext" || f.type === "image" || f.type === "file";
        const err = errors[f.name];
        const choices = options[f.name] ?? f.options ?? [];

        return (
          <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
            {f.type === "image" && f.image ? (
              <ImageField
                label={f.label}
                spec={f.image}
                existingUrl={row ? mediaUrl(row[f.name] as string | null) : null}
                value={images[f.name] ?? null}
                onChange={(v) => setImage(f.name, v)}
                error={err}
                required={f.required && !row}
              />
            ) : f.type === "file" ? (
              <FileInput
                field={f}
                existing={row ? (row[f.name] as string | null) : null}
                file={files[f.name] ?? null}
                onChange={(x) => setFile(f.name, x)}
                error={err}
              />
            ) : f.type === "boolean" ? (
              <label className="flex cursor-pointer items-start gap-3 pt-6">
                <input
                  type="checkbox"
                  checked={Boolean(values[f.name])}
                  onChange={(e) => set(f.name, e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--brand)]"
                />
                <span>
                  <span className="text-sm font-medium">{f.label}</span>
                  {f.help && <span className="block text-xs text-muted">{f.help}</span>}
                </span>
              </label>
            ) : f.type === "richtext" ? (
              <div>
                <span className={labelCls}>
                  {f.label}
                  {f.required && <span className="ml-1 text-accent">*</span>}
                </span>
                <RichTextField
                  value={String(values[f.name] ?? "")}
                  onChange={(html) => set(f.name, html)}
                  invalid={!!err}
                />
                {f.help && !err && <span className="mt-1 block text-xs text-muted">{f.help}</span>}
                {err && (
                  <span role="alert" className="mt-1 block text-sm text-accent">
                    {err}
                  </span>
                )}
              </div>
            ) : (
              <Shell field={f} error={err}>
                {f.type === "textarea" ? (
                  <>
                    <textarea
                      rows={5}
                      value={String(values[f.name] ?? "")}
                      onChange={(e) => set(f.name, e.target.value)}
                      aria-invalid={!!err}
                      className={`${inputCls} resize-y`}
                    />
                    {f.maxLength && (
                      <span className="mt-1 block text-right text-xs text-muted">
                        {String(values[f.name] ?? "").length} / {f.maxLength}
                      </span>
                    )}
                  </>
                ) : f.type === "select" ? (
                  <select
                    value={String(values[f.name] ?? "")}
                    onChange={(e) => set(f.name, e.target.value)}
                    aria-invalid={!!err}
                    className={inputCls}
                  >
                    {(!f.required || !values[f.name]) && <option value="">{f.required ? "Select…" : "—"}</option>}
                    {choices.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={
                      f.type === "number"
                        ? "number"
                        : f.type === "date"
                          ? "date"
                          : f.type === "datetime"
                            ? "datetime-local"
                            : "text"
                    }
                    step={f.type === "number" ? "any" : undefined}
                    value={String(values[f.name] ?? "")}
                    min={f.min}
                    max={f.max}
                    maxLength={f.maxLength}
                    onChange={(e) => set(f.name, e.target.value)}
                    aria-invalid={!!err}
                    className={inputCls}
                  />
                )}
              </Shell>
            )}
          </div>
        );
      })}
    </div>
  );
}
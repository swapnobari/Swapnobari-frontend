"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin/api";
import type { Field, Row } from "./types";
import {
  buildFormData,
  FieldsGrid,
  initialValues,
  parseSubmitError,
  useFieldOptions,
  validateFields,
  type Files,
  type Images,
  type Values,
} from "./formKit";
import { btnPrimary } from "./styles";

function Inner({ endpoint, fields, row, onSaved }: { endpoint: string; fields: Field[]; row: Row; onSaved: () => void }) {
  const [init] = useState<Values>(() => initialValues(fields, row));
  const [values, setValues] = useState<Values>(init);
  const [images, setImages] = useState<Images>({});
  const [files, setFiles] = useState<Files>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const options = useFieldOptions(fields);

  const clear = (name: string) =>
    setErrors((p) => {
      if (!p[name]) return p;
      const n = { ...p };
      delete n[name];
      return n;
    });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);

    const errs = validateFields(fields, values, images, files, row);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const { fd, empty } = buildFormData(fields, values, init, images, files, true);
    if (empty) {
      setNotice({ kind: "ok", text: "No changes to save." });
      return;
    }

    setSaving(true);
    try {
      await adminApi("PATCH", endpoint, fd);
      setNotice({ kind: "ok", text: "Saved. The website is updated." });
      onSaved();
    } catch (err) {
      const { fieldErrors, general } = parseSubmitError(
        err,
        fields.map((f) => f.name)
      );
      setErrors(fieldErrors);
      if (general) setNotice({ kind: "error", text: general });
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <FieldsGrid
        fields={fields}
        values={values}
        set={(n, v) => {
          setValues((p) => ({ ...p, [n]: v }));
          clear(n);
        }}
        errors={errors}
        images={images}
        setImage={(n, v) => {
          setImages((p) => ({ ...p, [n]: v }));
          clear(n);
        }}
        files={files}
        setFile={(n, f) => {
          setFiles((p) => ({ ...p, [n]: f }));
          clear(n);
        }}
        options={options}
        row={row}
      />
      {notice && (
        <p
          role={notice.kind === "ok" ? "status" : "alert"}
          className={`rounded-md border px-4 py-3 text-sm ${
            notice.kind === "ok" ? "border-brand/30 bg-brand/5 text-brand" : "border-accent/30 bg-accent/5 text-accent"
          }`}
        >
          {notice.text}
        </p>
      )}
      <button type="submit" className={btnPrimary} disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export default function SingletonForm({
  title,
  description,
  endpoint,
  fields,
}: {
  title: string;
  description?: string;
  endpoint: string;
  fields: Field[];
}) {
  const [row, setRow] = useState<Row | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    adminApi<Row>("GET", endpoint)
      .then((r) => {
        setRow(r);
        setError("");
      })
      .catch(() => setError("Could not load this page. Check the address in Swagger."));
  }, [endpoint, version]);

  return (
    <section className="rounded-lg border border-line bg-white p-6">
      <h2 className="font-display text-3xl text-brand">{title}</h2>
      {description && <p className="mt-1 max-w-xl text-sm text-muted">{description}</p>}
      <div className="mt-6">
        {error ? (
          <p className="text-accent">{error}</p>
        ) : !row ? (
          <div className="h-48 animate-pulse rounded bg-line/60" aria-busy="true" />
        ) : (
          <Inner
            key={version}
            endpoint={endpoint}
            fields={fields}
            row={row}
            onSaved={() => setVersion((v) => v + 1)}
          />
        )}
      </div>
    </section>
  );
}
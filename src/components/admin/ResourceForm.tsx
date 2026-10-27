
"use client";

import { useState } from "react";
import { adminApi } from "@/lib/admin/api";
import type { ResourceConfig, Row } from "./types";
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
import Modal from "./Modal";
import { btnGhost, btnPrimary } from "./styles";

export default function ResourceForm({
  config,
  row,
  onClose,
  onSaved,
}: {
  config: ResourceConfig;
  row: Row | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [init] = useState<Values>(() => initialValues(config.fields, row));
  const [values, setValues] = useState<Values>(init);
  const [images, setImages] = useState<Images>({});
  const [files, setFiles] = useState<Files>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState("");
  const [saving, setSaving] = useState(false);
  const options = useFieldOptions(config.fields);

  const idKey = config.idKey ?? "id";
  const noun = config.singular.charAt(0).toUpperCase() + config.singular.slice(1);

  const clear = (name: string) =>
    setErrors((p) => {
      if (!p[name]) return p;
      const n = { ...p };
      delete n[name];
      return n;
    });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setGeneral("");

    const errs = validateFields(config.fields, values, images, files, row);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const { fd, empty } = buildFormData(config.fields, values, init, images, files, !!row);
    if (row && empty) {
      onSaved("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      if (row) await adminApi("PATCH", `${config.endpoint}/${row[idKey]}`, fd);
      else await adminApi("POST", config.endpoint, fd);
      onSaved(row ? `${noun} updated.` : `${noun} added.`);
    } catch (err) {
      const { fieldErrors, general: g } = parseSubmitError(
        err,
        config.fields.map((f) => f.name)
      );
      setErrors(fieldErrors);
      setGeneral(g);
      setSaving(false);
    }
  }

  return (
    <Modal
      title={row ? `Edit ${config.singular}` : `Add ${config.singular}`}
      onClose={onClose}
      locked={saving}
      size="max-w-3xl"
    >
      <form onSubmit={submit} noValidate>
        <div className="p-6">
          <FieldsGrid
            fields={config.fields}
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
        </div>

        {general && (
          <p role="alert" className="mx-6 mb-2 border-l-2 border-accent bg-accent/5 p-3 text-sm text-accent">
            {general}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" className={btnGhost} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
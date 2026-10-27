import type { ImageSpec } from "@/lib/admin/image";

export type Row = { id: number; [key: string]: unknown };

export type Field = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "richtext"
    | "number"
    | "select"
    | "boolean"
    | "image"
    | "date"
    | "datetime"
    | "file";
  required?: boolean;
  help?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  optionsFrom?: { endpoint: string; valueKey: string; labelKey: string };
  default?: string | number | boolean; 
  image?: ImageSpec;
  file?: { accept: string; maxMB: number };
  wide?: boolean;
  skipEmpty?: boolean;
};

export type Column = {
  key: string;
  label: string;
  kind?: "text" | "longtext" | "image" | "bool" | "stars" | "number" | "date" | "flag";
  sub?: string;
  fit?: "cover" | "contain";
  labels?: [string, string]; 
};

export type Extra = { label: string; path: string } & (
  | { kind: "gallery"; spec: ImageSpec }
  | { kind: "list"; config: ResourceConfig }
);

export type ResourceConfig = {
  title: string;
  singular: string;
  description?: string;
  endpoint: string;
  idKey?: string; 
  detail?: boolean; 
  columns: Column[];
  fields: Field[];
  searchKeys?: string[];
  filter?: { key: string; options: { value: string; label: string }[] };
  extras?: Extra[];
  lookups?: { key: string; endpoint: string; valueKey: string; labelKey: string }[];
};
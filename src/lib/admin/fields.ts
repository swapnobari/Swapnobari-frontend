import type { Field } from "@/components/admin/types";

export const slugField: Field = {
  name: "slug",
  label: "Web address name (slug)",
  type: "text",
  maxLength: 200,
  skipEmpty: true,
  help: "Leave empty to create it from the title. Changing it later breaks old links.",
};

export const seoFields: Field[] = [
  {
    name: "meta_title",
    label: "SEO title",
    type: "text",
    maxLength: 160,
    help: "Shown in Google results. Leave empty to use the title.",
  },
  {
    name: "meta_description",
    label: "SEO description",
    type: "textarea",
    maxLength: 320,
    help: "One or two sentences shown in Google results.",
  },
];

export const orderField: Field = {
  name: "order",
  label: "Order",
  type: "number",
  min: 0,
  default: 0,
  help: "Lower numbers show first.",
};

export const activeField: Field = {
  name: "is_active",
  label: "Visible on the website",
  type: "boolean",
  default: true,
};

export const featuredField: Field = {
  name: "is_featured",
  label: "Featured on the Home page",
  type: "boolean",
  default: false,
};

export const AREA_UNITS = [
  { value: "katha", label: "Katha" },
  { value: "decimal", label: "Decimal" },
  { value: "bigha", label: "Bigha" },
];

export const AVAILABILITY = [
  { value: "available", label: "Available" },
  { value: "booked", label: "Booked" },
  { value: "sold", label: "Sold" },
];
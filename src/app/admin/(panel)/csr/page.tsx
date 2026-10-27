import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";
import { activeField, orderField, slugField } from "@/lib/admin/fields";

export const metadata: Metadata = { title: "CSR | Admin" };

const config: ResourceConfig = {
  title: "CSR activities",
  singular: "activity",
  description: "Community and social activities. Use Gallery to add photos.",
  endpoint: "/csr",
  idKey: "slug",
  detail: true,
  searchKeys: ["title", "location"],
  extras: [{ label: "Gallery", path: "images", kind: "gallery", spec: IMAGE_SPECS.gallery.spec }],
  columns: [
    { key: "cover_image", label: "Image", kind: "image" },
    { key: "title", label: "Activity", sub: "location" },
    { key: "activity_date", label: "Date", kind: "date" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
    slugField,
    { name: "cover_image", label: "Cover image", type: "image", required: true, image: IMAGE_SPECS.cover.spec },
    { name: "activity_date", label: "Date", type: "date" },
    { name: "location", label: "Location", type: "text", maxLength: 250 },
    { name: "description", label: "Description", type: "richtext" },
    orderField,
    activeField,
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
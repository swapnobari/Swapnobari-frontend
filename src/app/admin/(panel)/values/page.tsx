import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";

export const metadata: Metadata = { title: "Core values | Admin" };

const config: ResourceConfig = {
  title: "Core values",
  singular: "value",
  description: "The numbered list of values on the About page.",
  endpoint: "/about/values",
  searchKeys: ["title", "description"],
  columns: [
    { key: "order", label: "No.", kind: "number" },
    { key: "title", label: "Title" },
    { key: "description", label: "Description", kind: "longtext" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true, maxLength: 150 },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "order", label: "Order", type: "number", min: 0, default: 0, help: "Lower numbers show first." },
    { name: "is_active", label: "Visible on the website", type: "boolean", default: true },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
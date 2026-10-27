import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";

export const metadata: Metadata = { title: "Landowner steps | Admin" };

const config: ResourceConfig = {
  title: "Landowner steps",
  singular: "step",
  description: "The numbered “How it works” steps on the Landowner page.",
  endpoint: "/landowner/steps",
  searchKeys: ["title", "description"],
  columns: [
    { key: "order", label: "Step", kind: "number" },
    { key: "title", label: "Title" },
    { key: "description", label: "Description", kind: "longtext" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "title", label: "Step title", type: "text", required: true, maxLength: 150 },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "order", label: "Order", type: "number", min: 0, default: 0, help: "Lower numbers show first. Step 1 uses order 1." },
    { name: "is_active", label: "Visible on the website", type: "boolean", default: true },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
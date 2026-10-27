import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";

export const metadata: Metadata = { title: "Project categories | Admin" };

const config: ResourceConfig = {
  title: "Project categories",
  singular: "category",
  description:"Groups for your projects, for example Residential or Land Sharing. Visitors can filter projects by category.",
  endpoint: "/projects-categories",
  idKey: "slug",
  searchKeys: ["name", "slug", "description"],
  columns: [
    { key: "name", label: "Name", sub: "slug" },
    { key: "project_count", label: "Projects", kind: "number" },
    { key: "order", label: "Order", kind: "number" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "name", label: "Name", type: "text", required: true, maxLength: 150 },
    {
      name: "slug",
      label: "Web address name (slug)",
      type: "text",
      maxLength: 160,
      skipEmpty: true,
      help: "Leave empty to create it from the name.",
    },
    { name: "description", label: "Description", type: "textarea" },
    { name: "order", label: "Order", type: "number", min: 0, default: 0, help: "Lower numbers show first." },
    { name: "is_active", label: "Visible on the website", type: "boolean", default: true },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
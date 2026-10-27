import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";

export const metadata: Metadata = { title: "Landowner benefits | Admin" };

const config: ResourceConfig = {
  title: "Landowner benefits",
  singular: "benefit",
  description: "The benefit cards on the Landowner page, each with an icon.",
  endpoint: "/landowner/benefits",
  searchKeys: ["title", "description"],
  columns: [
    { key: "order", label: "No.", kind: "number" },
    { key: "title", label: "Title", sub: "icon" },
    { key: "description", label: "Description", kind: "longtext" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true, maxLength: 150 },
    { name: "description", label: "Description", type: "textarea", required: true },
    {
      name: "icon",
      label: "Icon name",
      type: "text",
      maxLength: 60,
      help: "A name from lucide.dev/icons, for example handshake, shield-check, file-text, landmark. Leave empty for a tick mark.",
    },
    { name: "order", label: "Order", type: "number", min: 0, default: 0, help: "Lower numbers show first." },
    { name: "is_active", label: "Visible on the website", type: "boolean", default: true },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
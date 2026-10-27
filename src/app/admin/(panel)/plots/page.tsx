import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";
import { activeField, AVAILABILITY, featuredField, orderField, seoFields, slugField } from "@/lib/admin/fields";

export const metadata: Metadata = { title: "Plots | Admin" };

const config: ResourceConfig = {
  title: "Plots",
  singular: "plot",
  description: "Plots for sale. Use Gallery to add photos.",
  endpoint: "/plots",
  idKey: "slug",
  detail: true,
  searchKeys: ["title", "location", "project_title"],
  filter: { key: "status", options: AVAILABILITY },
  extras: [{ label: "Gallery", path: "images", kind: "gallery", spec: IMAGE_SPECS.gallery.spec }],
  columns: [
    { key: "thumbnail", label: "Image", kind: "image" },
    { key: "title", label: "Plot", sub: "project_title" },
    { key: "size_katha", label: "Katha", kind: "number" },
    { key: "status_display", label: "Status" },
    { key: "is_featured", label: "Featured", kind: "bool" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
    slugField,
    {
      name: "project",
      label: "Project",
      type: "select",
      optionsFrom: { endpoint: "/projects", valueKey: "id", labelKey: "title" },
      help: "Optional. Links the plot to a project.",
    },
    { name: "status", label: "Status", type: "select", required: true, default: "available", options: AVAILABILITY },
    { name: "thumbnail", label: "Main image", type: "image", required: true, image: IMAGE_SPECS.cover.spec },
    { name: "location", label: "Location", type: "text", required: true, maxLength: 250 },
    { name: "size_katha", label: "Size (katha)", type: "number", required: true, min: 0 },
    { name: "facing", label: "Facing", type: "text", maxLength: 50, help: "For example south." },
    { name: "road_width", label: "Road width", type: "text", maxLength: 50, help: "For example 25 (feet)." },
    { name: "price", label: "Price (Tk)", type: "number", min: 0, help: "Leave empty to show “Contact for price”." },
    { name: "price_note", label: "Price note", type: "text", maxLength: 250 },
    { name: "description", label: "Description", type: "richtext" },
    featuredField,
    ...seoFields,
    orderField,
    activeField,
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
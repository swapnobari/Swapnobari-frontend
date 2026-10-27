import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";

export const metadata: Metadata = { title: "Mission & vision | Admin" };

const config: ResourceConfig = {
  title: "Mission & vision",
  singular: "item",
  description: "The Mission and Vision blocks on the About page. Each shows an image beside the text.",
  endpoint: "/about/mission-vision",
  idKey: "type",
  searchKeys: ["title", "description", "type_display"],
  columns: [
    { key: "image", label: "Image", kind: "image" },
    { key: "type_display", label: "Type" },
    { key: "title", label: "Title" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      options: [
        { value: "mission", label: "Mission" },
        { value: "vision", label: "Vision" },
      ],
    },
    { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
    { name: "description", label: "Text", type: "textarea", required: true, help: "Use a blank line between paragraphs." },
    { name: "image", label: "Image", type: "image", image: IMAGE_SPECS.section.spec },
    { name: "is_active", label: "Visible on the website", type: "boolean", default: true },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
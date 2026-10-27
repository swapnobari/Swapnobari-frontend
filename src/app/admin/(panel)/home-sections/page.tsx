import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";

export const metadata: Metadata = { title: "Home sections | Admin" };

const config: ResourceConfig = {
  title: "Home sections",
  singular: "section",
  description:"The two text blocks on the Home page: the Intro (image on the left) and Secure Investment (navy section). Each block can be used once.",
  endpoint: "/home-sections",
  idKey: "key",
  searchKeys: ["title", "subtitle", "key_display"],
  columns: [
    { key: "image", label: "Image", kind: "image" },
    { key: "title", label: "Title", sub: "subtitle" },
    { key: "key_display", label: "Block" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    {
      name: "key",
      label: "Which block",
      type: "select",
      required: true,
      options: [
        { value: "intro", label: "Intro (Turning dreams into reality)" },
        { value: "secure_investment", label: "Secure investment for a better tomorrow" },
      ],
    },
    { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
    { name: "subtitle", label: "Small line above the title", type: "text", maxLength: 200 },
    { name: "body", label: "Text", type: "richtext" },
    { name: "image", label: "Image", type: "image", image: IMAGE_SPECS.section.spec },
    { name: "button_text", label: "Button text", type: "text", maxLength: 80 },
    { name: "button_link", label: "Button link", type: "text", maxLength: 200, help: "For example /projects" },
    { name: "is_active", label: "Visible on the website", type: "boolean", default: true },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
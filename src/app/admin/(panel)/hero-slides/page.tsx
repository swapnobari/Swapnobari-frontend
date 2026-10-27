import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";

export const metadata: Metadata = { title: "Hero slides | Admin" };

const config: ResourceConfig = {
  title: "Hero slides",
  singular: "slide",
  description:
    "The full-screen slideshow at the top of the Home page. Add two or more slides to turn on the slide transitions.",
  endpoint: "/hero-slides",
  searchKeys: ["title", "subtitle"],
  columns: [
    { key: "image", label: "Image", kind: "image" },
    { key: "title", label: "Headline", sub: "subtitle" },
    { key: "button_text", label: "Button" },
    { key: "order", label: "Order", kind: "number" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "title", label: "Headline", type: "text", required: true, maxLength: 120, help: "Keep it short. It is shown very large." },
    { name: "subtitle", label: "Small line above the headline", type: "text", maxLength: 200 },
    { name: "image", label: "Slide image", type: "image", required: true, image: IMAGE_SPECS.hero.spec },
    { name: "button_text", label: "Button text", type: "text", maxLength: 60, help: "Leave empty for no button." },
    { name: "button_link", label: "Button link", type: "text", maxLength: 200, help: "For example /projects or https://example.com" },
    { name: "order", label: "Order", type: "number", min: 0, default: 0, help: "Lower numbers show first." },
    { name: "is_active", label: "Visible on the website", type: "boolean", default: true },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
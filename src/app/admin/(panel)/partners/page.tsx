import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";

export const metadata: Metadata = { title: "Partners | Admin" };

const config: ResourceConfig = {
  title: "Partners",
  singular: "partner",
  description:
    "Logos in the two moving rows on the Home page. The effect looks best with 8 or more partners. Use transparent PNG logos.",
  endpoint: "/partners",
  searchKeys: ["name", "website_url"],
  columns: [
    { key: "logo", label: "Logo", kind: "image", fit: "contain" },
    { key: "name", label: "Name", sub: "website_url" },
    { key: "order", label: "Order", kind: "number" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "name", label: "Partner name", type: "text", required: true, maxLength: 150 },
    { name: "logo", label: "Logo", type: "image", required: true, image: IMAGE_SPECS.partnerLogo.spec },
    { name: "website_url", label: "Website", type: "text", maxLength: 200, help: "Starts with https://. Leave empty for no link." },
    { name: "order", label: "Order", type: "number", min: 0, default: 0, help: "Lower numbers show first." },
    { name: "is_active", label: "Visible on the website", type: "boolean", default: true },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
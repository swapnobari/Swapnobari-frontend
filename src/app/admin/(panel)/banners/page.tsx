import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";
import { activeField } from "@/lib/admin/fields";

export const metadata: Metadata = { title: "Page banners | Admin" };

const PAGES = [
  ["about", "About"],
  ["founders_message", "Founder's message"],
  ["team", "Team"],
  ["projects", "Projects"],
  ["plots", "Plots"],
  ["flats", "Flats"],
  ["landowner", "Landowner"],
  ["csr", "CSR"],
  ["careers", "Careers"],
  ["news", "News & events"],
  ["contact", "Contact"],
  ["booking", "Site visit booking"],
];

const config: ResourceConfig = {
  title: "Page banners",
  singular: "banner",
  description: "One banner per page. Banners are saved here, and will show on the website once they are connected to each page.",
  endpoint: "/banners",
  idKey: "page",
  searchKeys: ["page", "title", "subtitle"],
  columns: [
    { key: "image", label: "Image", kind: "image" },
    { key: "page", label: "Page" },
    { key: "title", label: "Title", sub: "subtitle" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    {
      name: "page",
      label: "Page",
      type: "select",
      required: true,
      options: PAGES.map(([value, label]) => ({ value, label })),
      help: "Each page can have only one banner.",
    },
    { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
    { name: "subtitle", label: "Subtitle", type: "text", maxLength: 250 },
    { name: "image", label: "Banner image", type: "image", required: true, image: IMAGE_SPECS.banner.spec },
    activeField,
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
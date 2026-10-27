import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";
import { featuredField, seoFields, slugField } from "@/lib/admin/fields";

export const metadata: Metadata = { title: "News & events | Admin" };

const config: ResourceConfig = {
  title: "News & events",
  singular: "post",
  description:
    "Company news and events. A post shows to visitors only when Published is on and its publish date has arrived.",
  endpoint: "/news",
  idKey: "slug",
  detail: true,
  searchKeys: ["title", "excerpt"],
  filter: {
    key: "post_type",
    options: [
      { value: "news", label: "News" },
      { value: "event", label: "Events" },
    ],
  },
  extras: [{ label: "Gallery", path: "images", kind: "gallery", spec: IMAGE_SPECS.gallery.spec }],
  columns: [
    { key: "cover_image", label: "Image", kind: "image" },
    { key: "title", label: "Title", sub: "post_type_display" },
    { key: "published_at", label: "Published", kind: "date" },
    { key: "is_featured", label: "Featured", kind: "bool" },
    { key: "is_published", label: "Published", kind: "bool" },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true, maxLength: 250 },
    slugField,
    {
      name: "post_type",
      label: "Type",
      type: "select",
      required: true,
      default: "news",
      options: [
        { value: "news", label: "News" },
        { value: "event", label: "Event" },
      ],
    },
    { name: "published_at", label: "Publish date and time", type: "datetime", required: true, default: "now" },
    { name: "cover_image", label: "Cover image", type: "image", required: true, image: IMAGE_SPECS.cover.spec },
    { name: "excerpt", label: "Short summary", type: "textarea", maxLength: 300, help: "Shown on cards." },
    { name: "content", label: "Content", type: "richtext" },
    { name: "event_date", label: "Event date", type: "date", help: "Events only." },
    { name: "event_location", label: "Event location", type: "text", maxLength: 250, help: "Events only." },
    featuredField,
    { name: "is_published", label: "Published", type: "boolean", default: true, help: "Turn off to keep it as a draft." },
    ...seoFields,
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";

export const metadata: Metadata = { title: "Testimonials | Admin" };

const config: ResourceConfig = {
  title: "Testimonials",
  singular: "testimonial",
  description:
    "Client reviews shown in the Home page testimonial section. Add a photo for the best look. Reviews without a photo show the person's initials.",
  endpoint: "/testimonials",
  searchKeys: ["name", "designation", "message"],
  columns: [
    { key: "photo", label: "Photo", kind: "image" },
    { key: "name", label: "Name", sub: "designation" },
    { key: "rating", label: "Rating", kind: "stars" },
    { key: "message", label: "Message", kind: "longtext" },
    { key: "order", label: "Order", kind: "number" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "name", label: "Name", type: "text", required: true, maxLength: 150 },
    {
      name: "designation",
      label: "Designation",
      type: "text",
      maxLength: 150,
      help: "For example: Flat owner, Landowner",
    },
    { name: "photo", label: "Photo", type: "image", image: IMAGE_SPECS.testimonial.spec },
    {
      name: "rating",
      label: "Rating",
      type: "select",
      required: true,
      default: "5",
      options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? "s" : ""}` })),
    },
    { name: "message", label: "Message", type: "textarea", required: true, maxLength: 600 },
    { name: "order", label: "Order", type: "number", min: 0, default: 0, help: "Lower numbers show first." },
    { name: "is_active", label: "Visible on the website", type: "boolean", default: true },
  ],
};

export default function TestimonialsAdminPage() {
  return <ResourceManager config={config} />;
}
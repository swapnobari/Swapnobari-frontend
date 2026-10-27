import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";

export const metadata: Metadata = { title: "Team | Admin" };

const config: ResourceConfig = {
  title: "Team",
  singular: "team member",
  description: "People shown on the Team page.",
  endpoint: "/teams",
  searchKeys: ["name", "designation", "email"],
  columns: [
    { key: "photo", label: "Photo", kind: "image" },
    { key: "name", label: "Name", sub: "designation" },
    { key: "email", label: "Email" },
    { key: "order", label: "Order", kind: "number" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "name", label: "Full name", type: "text", required: true, maxLength: 150 },
    { name: "designation", label: "Designation", type: "text", required: true, maxLength: 150 },
    { name: "photo", label: "Photo", type: "image", image: IMAGE_SPECS.team.spec },
    { name: "bio", label: "Short bio", type: "textarea", help: "The Team page shows the first four lines." },
    { name: "email", label: "Email", type: "text", maxLength: 200 },
    { name: "phone", label: "Phone", type: "text", maxLength: 30 },
    { name: "facebook_url", label: "Facebook link", type: "text", maxLength: 250 },
    { name: "linkedin_url", label: "LinkedIn link", type: "text", maxLength: 250 },
    { name: "order", label: "Order", type: "number", min: 0, default: 0, help: "Lower numbers show first." },
    { name: "is_active", label: "Visible on the website", type: "boolean", default: true },
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
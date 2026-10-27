import type { Metadata } from "next";
import InboxManager, { type InboxConfig } from "@/components/admin/InboxManager";

export const metadata: Metadata = { title: "Land-share requests | Admin" };

const config: InboxConfig = {
  title: "Land-share requests",
  singular: "request",
  description: "Landowners offering land. Open a request to see the details and any documents they attached.",
  endpoint: "/landowner/requests",
  statuses: [
    { value: "pending", label: "Pending" },
    { value: "under_review", label: "Under review" },
    { value: "site_inspected", label: "Site inspected" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ],
  waiting: ["pending"],
  titleKey: "owner_name",
  columns: [
    { key: "reference_code", label: "Code" },
    { key: "owner_name", label: "Owner" },
    { key: "phone", label: "Phone" },
    { key: "land_location", label: "Land location" },
    { key: "created_at", label: "Received", kind: "date" },
  ],
  details: [
    { label: "Reference", key: "reference_code" },
    { label: "Owner", key: "owner_name" },
    { label: "Phone", key: "phone", kind: "phone" },
    { label: "Email", key: "email", kind: "email" },
    { label: "Project", key: "project_detail.title" },
    { label: "Land location", key: "land_location" },
    { label: "Land size", key: "land_size" },
    { label: "Unit", key: "land_size_unit_display" },
    { label: "Land type", key: "land_type" },
    { label: "Message", key: "message", kind: "long" },
    { label: "Received", key: "created_at", kind: "datetime" },
  ],
};

export default function Page() {
  return <InboxManager config={config} />;
}
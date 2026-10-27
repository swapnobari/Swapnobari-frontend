import type { Metadata } from "next";
import InboxManager, { type InboxConfig } from "@/components/admin/InboxManager";

export const metadata: Metadata = { title: "Job applications | Admin" };

const config: InboxConfig = {
  title: "Job applications",
  singular: "application",
  description: "Applications from the Careers page, with the applicant's CV.",
  endpoint: "/careers/applications",
  statuses: [
    { value: "new", label: "New" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "rejected", label: "Rejected" },
    { value: "hired", label: "Hired" },
  ],
  waiting: ["new"],
  titleKey: "name",
  columns: [
    { key: "name", label: "Applicant" },
    { key: "job_title", label: "Job" },
    { key: "phone", label: "Phone" },
    { key: "created_at", label: "Received", kind: "date" },
  ],
  details: [
    { label: "Applicant", key: "name" },
    { label: "Job", key: "job_title" },
    { label: "Job", key: "job_detail.title" },
    { label: "Phone", key: "phone", kind: "phone" },
    { label: "Email", key: "email", kind: "email" },
    { label: "CV / resume", key: "resume", kind: "file" },
    { label: "Cover letter", key: "cover_letter", kind: "long" },
    { label: "Received", key: "created_at", kind: "datetime" },
  ],
};

export default function Page() {
  return <InboxManager config={config} />;
}
import type { Metadata } from "next";
import InboxManager, { type InboxConfig } from "@/components/admin/InboxManager";

export const metadata: Metadata = { title: "Site visits | Admin" };

const config: InboxConfig = {
  title: "Site visit bookings",
  singular: "booking",
  description: "Visit requests from the website. Set the status to Confirmed and choose the date and time to confirm a visit.",
  endpoint: "/bookings",
  confirm: true,
  statuses: [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "rescheduled", label: "Rescheduled" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ],
  waiting: ["pending"],
  titleKey: "name",
  columns: [
    { key: "reference_code", label: "Code" },
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "project_title", label: "Project" },
    { key: "preferred_date", label: "Date", kind: "date" },
  ],
  details: [
    { label: "Reference", key: "reference_code" },
    { label: "Name", key: "name" },
    { label: "Phone", key: "phone", kind: "phone" },
    { label: "Email", key: "email", kind: "email" },
    { label: "Visitors", key: "number_of_visitors" },
    { label: "Visit type", key: "visit_type_display" },
    { label: "Project", key: "project_title" },
    { label: "Plot", key: "plot_title" },
    { label: "Flat", key: "flat_title" },
    { label: "Preferred date", key: "preferred_date", kind: "date" },
    { label: "Preferred time", key: "preferred_time_slot_display" },
    { label: "Confirmed date", key: "confirmed_date", kind: "date" },
    { label: "Confirmed time", key: "confirmed_time", kind: "time" },
    { label: "Message", key: "message", kind: "long" },
    { label: "Received", key: "created_at", kind: "datetime" },
  ],
};

export default function Page() {
  return <InboxManager config={config} />;
}
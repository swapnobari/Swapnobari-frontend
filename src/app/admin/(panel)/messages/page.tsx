import type { Metadata } from "next";
import InboxManager, { type InboxConfig } from "@/components/admin/InboxManager";

export const metadata: Metadata = { title: "Contact messages | Admin" };

const config: InboxConfig = {
  title: "Contact messages",
  singular: "message",
  description: "Messages sent from the Contact page. Opening a message marks it as read.",
  endpoint: "/contact",
  unreadKey: "is_read",
  statuses: [
    { value: "new", label: "New" },
    { value: "replied", label: "Replied" },
    { value: "closed", label: "Closed" },
  ],
  waiting: ["new"],
  titleKey: "name",
  columns: [
    { key: "name", label: "Name" },
    { key: "subject", label: "Subject" },
    { key: "phone", label: "Phone" },
    { key: "created_at", label: "Received", kind: "date" },
  ],
  details: [
    { label: "Name", key: "name" },
    { label: "Email", key: "email", kind: "email" },
    { label: "Phone", key: "phone", kind: "phone" },
    { label: "Subject", key: "subject" },
    { label: "Message", key: "message", kind: "long" },
    { label: "Received", key: "created_at", kind: "datetime" },
  ],
};

export default function Page() {
  return <InboxManager config={config} />;
}
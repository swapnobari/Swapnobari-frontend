import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { activeField, slugField } from "@/lib/admin/fields";

export const metadata: Metadata = { title: "Jobs | Admin" };

const config: ResourceConfig = {
  title: "Jobs",
  singular: "job",
  description:
    "Open positions. A job is hidden from visitors automatically after its deadline, and stays here.",
  endpoint: "/careers",
  idKey: "slug",
  detail: true,
  searchKeys: ["title", "department", "location"],
  columns: [
    { key: "title", label: "Job", sub: "department" },
    { key: "employment_type_display", label: "Type" },
    { key: "vacancies", label: "Vacancies", kind: "number" },
    { key: "deadline", label: "Deadline", kind: "date" },
    { key: "is_open", label: "Open?", kind: "flag", labels: ["Open", "Closed"] },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "title", label: "Job title", type: "text", required: true, maxLength: 200 },
    slugField,
    { name: "department", label: "Department", type: "text", maxLength: 150 },
    { name: "location", label: "Location", type: "text", maxLength: 250 },
    {
      name: "employment_type",
      label: "Employment type",
      type: "select",
      required: true,
      default: "full_time",
      options: [
        { value: "full_time", label: "Full time" },
        { value: "part_time", label: "Part time" },
        { value: "contract", label: "Contract" },
        { value: "internship", label: "Internship" },
      ],
    },
    { name: "vacancies", label: "Vacancies", type: "number", min: 1, default: 1 },
    { name: "deadline", label: "Application deadline", type: "date" },
    { name: "salary_note", label: "Salary note", type: "text", maxLength: 250 },
    { name: "description", label: "Description", type: "richtext" },
    { name: "requirements", label: "Requirements", type: "richtext" },
    activeField,
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}
import type { Metadata } from "next";
import SingletonForm from "@/components/admin/SingletonForm";
import type { Field } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";

export const metadata: Metadata = { title: "About page | Admin" };

const about: Field[] = [
  { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
  { name: "subtitle", label: "Small line above the heading", type: "text", maxLength: 200 },
  {
    name: "description",
    label: "Main text",
    type: "textarea",
    help: "One paragraph per line. A short line without a full stop becomes a heading on the website.",
  },
  { name: "image", label: "Wide image", type: "image", image: IMAGE_SPECS.banner.spec },
  { name: "years_of_experience", label: "Years of experience", type: "number", min: 0, help: "A counter set to 0 is hidden." },
  { name: "total_projects_delivered", label: "Projects delivered", type: "number", min: 0 },
  { name: "happy_families", label: "Happy families", type: "number", min: 0 },
  { name: "established_year", label: "Established year", type: "number", min: 0 },
];

const founder: Field[] = [
  { name: "founder_name", label: "Name", type: "text", required: true, maxLength: 150 },
  { name: "designation", label: "Designation", type: "text", maxLength: 200 },
  { name: "message", label: "Message", type: "textarea" },
  { name: "image", label: "Portrait", type: "image", image: IMAGE_SPECS.founder.spec },
];

export default function Page() {
  return (
    <div>
      <h1 className="font-display text-4xl text-brand">About page</h1>
      <p className="mt-1 text-sm text-muted">
        Edit the text, counters and Founder&apos;s message. Mission, vision and values have their own menu items.
      </p>
      <div className="mt-8 space-y-8">
        <SingletonForm title="About us" endpoint="/about" fields={about} />
        <SingletonForm title="Founder's message" endpoint="/about/founders-message" fields={founder} />
      </div>
    </div>
  );
}
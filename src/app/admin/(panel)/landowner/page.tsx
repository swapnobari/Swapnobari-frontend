import type { Metadata } from "next";
import Link from "next/link";
import SingletonForm from "@/components/admin/SingletonForm";
import type { Field } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";

export const metadata: Metadata = { title: "Landowner page | Admin" };

const fields: Field[] = [
  { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
  { name: "subtitle", label: "Subtitle", type: "text", maxLength: 300, help: "A short line shown under the title." },
  { name: "description", label: "Main text", type: "richtext" },
  { name: "image", label: "Wide image", type: "image", image: IMAGE_SPECS.banner.spec },
];

export default function Page() {
  return (
    <div>
      <h1 className="font-display text-4xl text-brand">Landowner page</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        The text and image at the top of the Landowner page. The benefit cards and the “How it works” steps are managed
        in{" "}
        <Link href="/admin/landowner-benefits" className="text-brand underline">
          Benefits
        </Link>{" "}
        and{" "}
        <Link href="/admin/landowner-steps" className="text-brand underline">
          Steps
        </Link>
        .
      </p>

      <p className="mt-4 max-w-2xl rounded-md border border-line bg-white px-4 py-3 text-sm text-muted">
        <strong className="text-fg">Tip:</strong> if your main text already contains “Why Partner With Us” and “How Does
        It Work” sections, remove them here. The website shows the same information from Benefits and Steps, so
        visitors would read it twice.
      </p>

      <div className="mt-8">
        <SingletonForm title="Page content" endpoint="/landowner/page" fields={fields} />
      </div>
    </div>
  );
}
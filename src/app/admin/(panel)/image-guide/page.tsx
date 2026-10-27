import type { Metadata } from "next";
import { IMAGE_SPECS, type SpecMeta } from "@/lib/admin/imageSpecs";

export const metadata: Metadata = { title: "Image guide | Admin" };

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

export default function ImageGuidePage() {
  const rows = Object.values(IMAGE_SPECS) as SpecMeta[];

  return (
    <div>
      <h1 className="font-display text-4xl text-brand">Image guide</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Upload images at these sizes. The admin crops and compresses them automatically, so what you see in the preview
        is what the website shows. Always start from a photo at least this large.
      </p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-180 text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-[0.15em] text-muted">
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Ratio</th>
              <th className="px-4 py-3 font-medium">Used on</th>
              <th className="px-4 py-3 font-medium">Tip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line align-top">
            {rows.map((r) => {
              const g = gcd(r.spec.width, r.spec.height);
              const contain = r.spec.mode === "contain";
              return (
                <tr key={r.label}>
                  <td className="px-4 py-3 font-medium text-brand">{r.label}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {contain ? "up to " : ""}
                    {r.spec.width} × {r.spec.height} px
                    <span className="block text-xs text-muted">{contain ? "PNG" : "JPG"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {contain ? "Any" : `${r.spec.width / g}:${r.spec.height / g}`}
                  </td>
                  <td className="px-4 py-3 text-muted">{r.used}</td>
                  <td className="px-4 py-3 text-muted">{r.tip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Swapno Bari Housing",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f4f3f8] text-fg">{children}</div>;
}
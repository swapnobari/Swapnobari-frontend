import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
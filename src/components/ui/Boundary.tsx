import { Suspense } from "react";

export default function Boundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" aria-busy="true" />}>
      {children}
    </Suspense>
  );
}
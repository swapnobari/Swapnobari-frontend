import { Suspense } from "react";
import "lenis/dist/lenis.css";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/layout/Preloader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Preloader />
      <SmoothScroll>
        <Header />
        {children}
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </SmoothScroll>
    </>
  );
}
"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

const fmt = new Intl.NumberFormat("en-US");

export default function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;

    if (reduce) {
      el.textContent = fmt.format(to);
      return;
    }

    const controls = animate(0, to, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = fmt.format(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return (
    <>
      <span ref={ref}>{fmt.format(0)}</span>
      {suffix}
    </>
  );
}
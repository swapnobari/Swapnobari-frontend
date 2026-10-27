
"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  lines: ReactNode[];
  className?: string;
  stagger?: number;
  as?: "h1" | "h2" | "h3";
};

export default function LineReveal({
  lines,
  className,
  stagger = 0.12,
  as: Tag = "h2",
}: Props) {
  const reduce = useReducedMotion();

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="block overflow-hidden pb-[0.15em]"
        >
          <motion.span
            className="block"
            initial={reduce ? false : { y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={{
              once: true,
              margin: "0px 0px -10% 0px",
            }}
            transition={{
              duration: 1,
              delay: i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

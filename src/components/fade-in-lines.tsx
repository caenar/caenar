"use client";

import { motion } from "framer-motion";

// Subtitle/body: simple fade-in from top, optionally staggered by line
export default function FadeInLines({
  lines,
  className,
  delay = 0,
  stagger = 0.12,
}: {
  lines: string[];
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <motion.span
          key={i}
          className="block"
          initial={{ opacity: 0, y: -10, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: delay + i * stagger,
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {line}
        </motion.span>
      ))}
    </span>
  );
}

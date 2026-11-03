"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothScroll() {
  return (
    <ReactLenis
      root
      options={{
        prevent: (node) => node.classList.contains("terminal-scroll"),
      }}
    />
  );
}
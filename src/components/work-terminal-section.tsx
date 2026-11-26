"use client";

import { type RefObject } from "react";

export default function WorkTerminalSection({
  dockRef,
}: {
  dockRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className="content">
      <div
        ref={dockRef}
        className="w-full h-[70vh] md:h-[90vh]"
        aria-hidden="true"
      />
    </section>
  );
}

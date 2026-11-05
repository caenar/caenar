"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

export default function Background() {
  const [viewportHeight, setViewportHeight] = useState(1);
  const { scrollY } = useScroll();

  useEffect(() => {
    setViewportHeight(window.innerHeight);
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Scroll-driven fades
  const gradientOpacity = useTransform(
    scrollY,
    [0, viewportHeight / 1.5],
    [1, 0],
  );
  const gradientScreenOpacity = useTransform(
    scrollY,
    [0, viewportHeight / 1.5],
    [0.5, 0],
  );
  const logoPureOpacity = useTransform(
    scrollY,
    [0, viewportHeight],
    [0.2, 0],
  );
  const logoTexturedOpacity = useTransform(
    scrollY,
    [0, viewportHeight / 3.5],
    [0.4, 0],
  );
  const logoTexturedBlurredOpacity = useTransform(
    scrollY,
    [0, viewportHeight / 3.5],
    [0.2, 0],
  );

  // Only the 3 logo layers descend from above into place on scroll.
  // Initial y is negative (above final); they settle at y: 0 (the final state).
  const logoPureY = useTransform(
    scrollY,
    [0, viewportHeight],
    [-500, 0],
  );
  const logoTexturedY = useTransform(
    scrollY,
    [0, viewportHeight],
    [-500, 0],
  );
  const logoTexturedBlurredY = useTransform(
    scrollY,
    [0, viewportHeight],
    [-500, 0],
  );

  const layerBase = "absolute -bottom-1/4 w-[120%] h-[120vh] left-1/2 bg-cover bg-bottom";

  return (
    <div className="absolute inset-x-0 top-0 h-[150vh] z-[-1] pointer-events-none overflow-x-clip overflow-y-visible">
      {/* Static base fill */}
      <div className="absolute inset-x-0 top-0 h-[150vh] bg-background-100" />

      {/* Static gradients */}
      <motion.div
        className="absolute -inset-5 bg-[url('/images/bg-assets/gradient.png')] bg-cover bg-center"
        style={{ opacity: gradientOpacity }}
      />

      <motion.div
        className="absolute -inset-5 bg-[url('/images/bg-assets/gradient.png')] bg-cover bg-center mix-blend-screen"
        style={{ opacity: gradientScreenOpacity }}
      />

      {/* Only these 3 logo layers move on scroll */}
      <motion.div
        className={`${layerBase} bg-[url('/images/bg-assets/halftone-pure.png')] mix-blend-color-burn`}
        style={{ x: "-50%", opacity: logoPureOpacity, y: logoPureY }}
      />

      <motion.div
        className={`${layerBase} bg-[url('/images/bg-assets/halftone-textured.png')] mix-blend-color-dodge`}
        style={{ x: "-50%", opacity: logoTexturedOpacity, y: logoTexturedY }}
      />

      <motion.div
        className={`${layerBase} bg-[url('/images/bg-assets/halftone-textured-blurred.png')] mix-blend-plus-lighter`}
        style={{
          x: "-50%",
          opacity: logoTexturedBlurredOpacity,
          y: logoTexturedBlurredY,
        }}
      />

      {/* Static black fade from top to transparent */}
      <div className="absolute inset-x-0 top-0 h-[80vh] bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
    </div>
  );
}

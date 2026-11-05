"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const LOGO_LAYERS = [
  {
    className:
      "bg-[url('/images/bg-assets/halftone-pure.png')] mix-blend-color-burn",
    opacity: [0.4, 0.2] as const,
  },
  {
    className:
      "bg-[url('/images/bg-assets/halftone-textured.png')] mix-blend-color-dodge",
    opacity: 0.4,
  },
  {
    className:
      "bg-[url('/images/bg-assets/halftone-textured-blurred.png')] mix-blend-plus-lighter",
    opacity: 0.2,
  },
];

function LogoLayer({
  className,
  opacity,
  y,
  scrollY,
  viewportHeight,
  fade,
}: {
  className: string;
  opacity: number | readonly [number, number];
  y: ReturnType<typeof useTransform<number, number>>;
  scrollY: ReturnType<typeof useScroll>["scrollY"];
  viewportHeight: number;
  fade: ReturnType<typeof useTransform<number, number>>;
}) {
  const baseOpacity = useTransform(
    scrollY,
    [0, viewportHeight],
    typeof opacity === "number" ? [opacity, opacity] : [...opacity],
  );
  const layerOpacity = useTransform(
    [baseOpacity, fade],
    ([base, f]: number[]) => base * f,
  );

  return (
    <motion.div
      className={`absolute w-full h-[125vh] left-1/2 bg-cover bg-bottom ${className}`}
      style={{ x: "-50%", y, opacity: layerOpacity }}
    />
  );
}

export default function Background() {
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 1,
  );
  const { scrollY } = useScroll();

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const gradientY = useTransform(scrollY, [0, viewportHeight], [0, 500]);
  const logoY = useTransform(scrollY, [0, viewportHeight], [150, 1100]);

  const gradientFade = useTransform(
    scrollY,
    [viewportHeight * 0.25, viewportHeight * 1.05],
    [1, 0],
  );
  const gradientScreenFade = useTransform(
    scrollY,
    [viewportHeight * 0.25, viewportHeight * 1.05],
    [1, 0],
  );
  const gradientScreenOpacity = useTransform(
    gradientScreenFade,
    (fade) => fade * 0.5,
  );

  const logoPureFade = useTransform(
    scrollY,
    [viewportHeight * 0.25, viewportHeight * 1.2],
    [1, 0],
  );
  const logoTexturedFade = useTransform(
    scrollY,
    [viewportHeight * 0.25, viewportHeight * 1.15],
    [1, 0],
  );
  const logoTexturedBlurredFade = useTransform(
    scrollY,
    [viewportHeight * 0.25, viewportHeight * 1.15],
    [1, 0],
  );

  return (
    <motion.div
      className="absolute inset-x-0 top-0 h-[150vh] z-[-1] pointer-events-none overflow-x-clip overflow-y-visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* <div className="absolute inset-x-0 top-0 h-[150vh] bg-background-100" /> */}

      <motion.div
        className="absolute -inset-5 bg-[url('/images/bg-assets/gradient.png')] bg-cover bg-center"
        style={{ y: gradientY, opacity: gradientFade }}
      />
      <motion.div
        className="absolute -inset-5 bg-[url('/images/bg-assets/gradient.png')] bg-cover bg-center mix-blend-screen"
        style={{ y: gradientY, opacity: gradientScreenOpacity }}
      />

      <LogoLayer
        className={LOGO_LAYERS[0].className}
        opacity={LOGO_LAYERS[0].opacity}
        y={logoY}
        scrollY={scrollY}
        viewportHeight={viewportHeight}
        fade={logoPureFade}
      />
      <LogoLayer
        className={LOGO_LAYERS[1].className}
        opacity={LOGO_LAYERS[1].opacity}
        y={logoY}
        scrollY={scrollY}
        viewportHeight={viewportHeight}
        fade={logoTexturedFade}
      />
      <LogoLayer
        className={LOGO_LAYERS[2].className}
        opacity={LOGO_LAYERS[2].opacity}
        y={logoY}
        scrollY={scrollY}
        viewportHeight={viewportHeight}
        fade={logoTexturedBlurredFade}
      />

      <div className="absolute inset-x-0 top-0 h-[80vh] bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
    </motion.div>
  );
}

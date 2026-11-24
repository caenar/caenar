"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type HalftoneLayerConfig = {
  className: string;
  opacity: number | readonly [number, number];
  fade: ReturnType<typeof useTransform<number, number>>;
  /** Base color for squares, or gradient stops */
  color: string;
  /** Optional gradient stops; overrides color when set */
  gradient?: [string, string, ...string[]];
  /** Grid cell size in CSS px */
  cell: number;
  /** Square size relative to cell, 0-1 */
  fill: number;
  /** Corner radius relative to square size, 0-0.5 */
  radius: number;
  /** Random size/alpha variation, 0-1 */
  jitter: number;
  /** Optional CSS blur in px for softer variant */
  blur?: number;
  /** Sample threshold, 0-255 */
  threshold: number;
};

function getCoverRect(srcW: number, srcH: number, dstW: number, dstH: number) {
  const scale = Math.max(dstW / srcW, dstH / srcH);
  const w = srcW * scale;
  const h = srcH * scale;
  const x = (dstW - w) / 2;
  const y = dstH - h; // bg-bottom
  return { x, y, w, h };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  r: number,
) {
  const radius = Math.min(r, size / 2);
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, size, size, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + size, y, x + size, y + size, radius);
    ctx.arcTo(x + size, y + size, x, y + size, radius);
    ctx.arcTo(x, y + size, x, y, radius);
    ctx.arcTo(x, y, x + size, y, radius);
    ctx.closePath();
  }
  ctx.fill();
}

function HalftoneCanvas({
  src,
  color,
  gradient,
  cell,
  fill,
  radius,
  jitter,
  blur,
  threshold,
  className,
}: {
  src: string;
  color: string;
  gradient?: [string, string, ...string[]];
  cell: number;
  fill: number;
  radius: number;
  jitter: number;
  blur?: number;
  threshold: number;
  className: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const sampleRef = useRef<{
    data: Uint8ClampedArray;
    sw: number;
    sh: number;
  } | null>(null);
  const gradientRef = useRef<{
    key: string;
    style: CanvasGradient | string;
  } | null>(null);
  const activeCellsRef = useRef<Array<[number, number]>>([]);
  const sparklesRef = useRef<
    Array<{ col: number; row: number; born: number; life: number }>
  >([]);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => {
      imageRef.current = img;
      setReady(true);
    };
    img.onerror = () => setReady(false);
    return () => {
      img.onload = null;
    };
  }, [src]);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const finePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches;

    let raf = 0;
    let lastFrame = 0;
    let baseCanvas: HTMLCanvasElement | null = null;

    const resample = (width: number, height: number) => {
      const sampleScale = Math.min(1, 960 / Math.max(width, height));
      const sw = Math.max(1, Math.floor(width * sampleScale));
      const sh = Math.max(1, Math.floor(height * sampleScale));
      const sample = document.createElement("canvas");
      sample.width = sw;
      sample.height = sh;
      const sctx = sample.getContext("2d", { willReadFrequently: true });
      if (!sctx) return;
      const cover = getCoverRect(img.naturalWidth, img.naturalHeight, sw, sh);
      sctx.clearRect(0, 0, sw, sh);
      sctx.drawImage(img, cover.x, cover.y, cover.w, cover.h);
      sampleRef.current = {
        data: sctx.getImageData(0, 0, sw, sh).data,
        sw,
        sh,
      };
    };

    const buildBase = (w: number, h: number, dpr: number) => {
      const sample = sampleRef.current;
      if (!sample) return;
      const base = document.createElement("canvas");
      base.width = w;
      base.height = h;
      const ctx = base.getContext("2d");
      if (!ctx) return;

      const gradientKey = gradient
        ? `${w}x${h}:${gradient.join(",")}`
        : `solid:${color}:${w}x${h}`;
      if (!gradientRef.current || gradientRef.current.key !== gradientKey) {
        if (gradient && gradient.length >= 2) {
          const g = ctx.createLinearGradient(0, 0, 0, h);
          gradient.forEach((stop, index) => {
            g.addColorStop(index / (gradient.length - 1), stop);
          });
          gradientRef.current = { key: gradientKey, style: g };
        } else {
          gradientRef.current = { key: gradientKey, style: color };
        }
      }
      ctx.fillStyle = gradientRef.current.style;

      const cellPx = cell * dpr;
      const cols = Math.ceil(w / cellPx);
      const rows = Math.ceil(h / cellPx);
      const activeCells: Array<[number, number]> = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cx = col * cellPx + cellPx / 2;
          const cy = row * cellPx + cellPx / 2;
          const sx = Math.min(sample.sw - 1, Math.floor((cx / w) * sample.sw));
          const sy = Math.min(sample.sh - 1, Math.floor((cy / h) * sample.sh));
          const i = (sy * sample.sw + sx) * 4;
          const alpha = sample.data[i + 3];
          const lum =
            (sample.data[i] * 0.2126 +
              sample.data[i + 1] * 0.7152 +
              sample.data[i + 2] * 0.0722) /
            255;
          const strength = (alpha / 255) * lum;
          if (alpha < threshold && strength < threshold / 255) continue;

          activeCells.push([col, row]);
          const seed = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
          const rand = seed - Math.floor(seed);
          const j = 1 - jitter * 0.5 + rand * jitter;
          const size = Math.max(
            1,
            cellPx * fill * j * (0.55 + strength * 0.45),
          );
          const x = cx - size / 2;
          const y = cy - size / 2;
          ctx.globalAlpha = Math.max(
            0.08,
            Math.min(1, (0.45 + strength * 0.55) * j),
          );
          drawRoundedRect(ctx, x, y, size, Math.max(0, size * radius));
        }
      }
      activeCellsRef.current = activeCells;
      sparklesRef.current = [];
      ctx.globalAlpha = 1;
      baseCanvas = base;
    };

    const renderStatic = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(width * dpr);
      const h = Math.floor(height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        resample(width, height);
        baseCanvas = null;
      }
      if (!sampleRef.current) resample(width, height);
      if (!baseCanvas) buildBase(w, h, dpr);
      if (!baseCanvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(baseCanvas, 0, 0);
    };

    const drawSparkles = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      dpr: number,
      time: number,
    ) => {
      const sample = sampleRef.current;
      const active = activeCellsRef.current;
      if (!sample || active.length === 0) return;

      const sparkles = sparklesRef.current;
      // Spawn sparkles occasionally.
      if (sparkles.length < 5 && Math.random() < 0.12) {
        const [col, row] = active[Math.floor(Math.random() * active.length)];
        sparkles.push({
          col,
          row,
          born: time,
          life: 900 + Math.random() * 700,
        });
      }

      // Keep alive sparkles only.
      sparklesRef.current = sparkles.filter((s) => time - s.born < s.life);
      const cellPx = cell * dpr;
      const baseFill = gradientRef.current?.style ?? color;

      for (const s of sparklesRef.current) {
        const t = (time - s.born) / s.life;
        const pulse = Math.sin(t * Math.PI); // 0 -> 1 -> 0
        if (pulse <= 0.01) continue;

        const { col, row } = s;
        const cx = col * cellPx + cellPx / 2;
        const cy = row * cellPx + cellPx / 2;
        const sx = Math.min(sample.sw - 1, Math.floor((cx / w) * sample.sw));
        const sy = Math.min(sample.sh - 1, Math.floor((cy / h) * sample.sh));
        const i = (sy * sample.sw + sx) * 4;
        const alpha = sample.data[i + 3];
        const lum =
          (sample.data[i] * 0.2126 +
            sample.data[i + 1] * 0.7152 +
            sample.data[i + 2] * 0.0722) /
          255;
        const strength = (alpha / 255) * lum;
        if (alpha < threshold && strength < threshold / 255) continue;

        const seed = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
        const rand = seed - Math.floor(seed);
        const j = 1 - jitter * 0.5 + rand * jitter;
        const size = Math.max(
          1,
          cellPx * fill * j * (0.55 + strength * 0.45) * (1 + pulse * 0.12),
        );
        const x = cx - size / 2;
        const y = cy - size / 2;
        const baseAlpha = Math.max(
          0.08,
          Math.min(1, (0.45 + strength * 0.55) * j),
        );

        ctx.fillStyle = baseFill;
        ctx.globalAlpha = Math.min(1, baseAlpha + pulse * 0.18);
        drawRoundedRect(ctx, x, y, size, Math.max(0, size * radius));

        ctx.fillStyle = "#ede9fe";
        ctx.globalAlpha = pulse * 0.35;
        drawRoundedRect(ctx, x, y, size, Math.max(0, size * radius));
      }
      ctx.globalAlpha = 1;
    };

    const drawIdle = (time: number) => {
      if (time - lastFrame < 66) {
        raf = requestAnimationFrame(drawIdle);
        return;
      }
      lastFrame = time;
      renderStatic();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      drawSparkles(ctx, canvas.width, canvas.height, dpr, time);
      if (!pointerRef.current.active) raf = requestAnimationFrame(drawIdle);
    };

    const drawHover = (time: number) => {
      if (time - lastFrame < 33) {
        raf = requestAnimationFrame(drawHover);
        return;
      }
      lastFrame = time;

      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(width * dpr);
      const h = Math.floor(height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        resample(width, height);
        baseCanvas = null;
      }
      if (!sampleRef.current) resample(width, height);
      if (!baseCanvas) buildBase(w, h, dpr);
      if (!baseCanvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(baseCanvas, 0, 0);

      const pointer = pointerRef.current;
      if (!pointer.active) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(drawIdle);
        return;
      }

      const sample = sampleRef.current;
      if (!sample) return;

      const cellPx = cell * dpr;
      const hoverRadius = 180 * dpr;
      const minCol = Math.max(
        0,
        Math.floor((pointer.x - hoverRadius) / cellPx),
      );
      const maxCol = Math.ceil((pointer.x + hoverRadius) / cellPx);
      const minRow = Math.max(
        0,
        Math.floor((pointer.y - hoverRadius) / cellPx),
      );
      const maxRow = Math.ceil((pointer.y + hoverRadius) / cellPx);
      const hoverRadiusSq = hoverRadius * hoverRadius;

      const baseFill = gradientRef.current?.style ?? color;

      // Pass 1: clear original cells in the hover radius to make space.
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const cx = col * cellPx + cellPx / 2;
          const cy = row * cellPx + cellPx / 2;
          const dx = cx - pointer.x;
          const dy = cy - pointer.y;
          if (dx * dx + dy * dy >= hoverRadiusSq) continue;

          const sx = Math.min(sample.sw - 1, Math.floor((cx / w) * sample.sw));
          const sy = Math.min(sample.sh - 1, Math.floor((cy / h) * sample.sh));
          const i = (sy * sample.sw + sx) * 4;
          const alpha = sample.data[i + 3];
          const lum =
            (sample.data[i] * 0.2126 +
              sample.data[i + 1] * 0.7152 +
              sample.data[i + 2] * 0.0722) /
            255;
          const strength = (alpha / 255) * lum;
          if (alpha < threshold && strength < threshold / 255) continue;

          const seed = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
          const rand = seed - Math.floor(seed);
          const j = 1 - jitter * 0.5 + rand * jitter;
          const size = Math.max(
            1,
            cellPx * fill * j * (0.55 + strength * 0.45),
          );
          ctx.globalAlpha = 1;
          drawRoundedRect(
            ctx,
            cx - size / 2,
            cy - size / 2,
            size,
            Math.max(0, size * radius),
          );
        }
      }
      ctx.restore();

      // Pass 2: draw displaced cells.
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const cx = col * cellPx + cellPx / 2;
          const cy = row * cellPx + cellPx / 2;
          const dx = cx - pointer.x;
          const dy = cy - pointer.y;
          const distSq = dx * dx + dy * dy;
          if (distSq >= hoverRadiusSq) continue;

          const sx = Math.min(sample.sw - 1, Math.floor((cx / w) * sample.sw));
          const sy = Math.min(sample.sh - 1, Math.floor((cy / h) * sample.sh));
          const i = (sy * sample.sw + sx) * 4;
          const alpha = sample.data[i + 3];
          const lum =
            (sample.data[i] * 0.2126 +
              sample.data[i + 1] * 0.7152 +
              sample.data[i + 2] * 0.0722) /
            255;
          const strength = (alpha / 255) * lum;
          if (alpha < threshold && strength < threshold / 255) continue;

          const dist = Math.sqrt(distSq);
          const t = 1 - dist / hoverRadius;
          const hover = t * t * (3 - 2 * t);

          const seed = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
          const rand = seed - Math.floor(seed);
          const j = 1 - jitter * 0.5 + rand * jitter;
          const size = Math.max(
            1,
            cellPx * fill * j * (0.55 + strength * 0.45),
          );
          const push = hover * 34 * dpr;
          const dir = dist > 0.001 ? 1 / dist : 0;
          const x = cx + dx * dir * push - size / 2;
          const y = cy + dy * dir * push - size / 2;
          const baseAlpha = Math.max(
            0.08,
            Math.min(1, (0.45 + strength * 0.55) * j + hover * 0.12),
          );
          ctx.fillStyle = baseFill;
          ctx.globalAlpha = baseAlpha;
          drawRoundedRect(ctx, x, y, size, Math.max(0, size * radius));

          ctx.fillStyle = "#cba8ff";
          ctx.globalAlpha = hover * 0.58;
          drawRoundedRect(ctx, x, y, size, Math.max(0, size * radius));
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(drawHover);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const active =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      pointerRef.current = {
        x: (e.clientX - rect.left) * dpr,
        y: (e.clientY - rect.top) * dpr,
        active,
      };
      if (finePointer && active) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(drawHover);
      } else if (finePointer) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(drawIdle);
      }
    };

    const onPointerLeave = () => {
      pointerRef.current.active = false;
      if (finePointer) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(drawIdle);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (pointerRef.current.active && finePointer) {
        raf = requestAnimationFrame(drawHover);
      } else if (finePointer) {
        raf = requestAnimationFrame(drawIdle);
      } else {
        renderStatic();
      }
    };

    const onResize = () => {
      cancelAnimationFrame(raf);
      if (pointerRef.current.active && finePointer) {
        renderStatic();
        raf = requestAnimationFrame(drawHover);
      } else if (finePointer) {
        raf = requestAnimationFrame(drawIdle);
      } else {
        renderStatic();
      }
    };

    if (finePointer) {
      raf = requestAnimationFrame(drawIdle);
    } else {
      renderStatic();
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas.parentElement ?? canvas);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave, {
        passive: true,
      });
      window.addEventListener("blur", onPointerLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (finePointer) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("blur", onPointerLeave);
      }
    };
  }, [
    ready,
    cell,
    fill,
    radius,
    jitter,
    threshold,
    color,
    gradient?.join(","),
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={blur ? { filter: `blur(${blur}px)` } : undefined}
    />
  );
}

function HalftoneLayer({
  src,
  config,
  y,
  scrollY,
  viewportHeight,
}: {
  src: string;
  config: HalftoneLayerConfig;
  y: ReturnType<typeof useTransform<number, number>>;
  scrollY: ReturnType<typeof useScroll>["scrollY"];
  viewportHeight: number;
}) {
  const baseOpacity = useTransform(
    scrollY,
    [0, viewportHeight],
    typeof config.opacity === "number"
      ? [config.opacity, config.opacity]
      : [...config.opacity],
  );
  const layerOpacity = useTransform(
    [baseOpacity, config.fade],
    ([base, f]: number[]) => base * f,
  );

  return (
    <motion.div
      className={`absolute w-full h-[125vh] left-1/2 ${config.className}`}
      style={{ x: "-50%", y, opacity: layerOpacity }}
    >
      <HalftoneCanvas
        src={src}
        color={config.color}
        gradient={config.gradient}
        cell={config.cell}
        fill={config.fill}
        radius={config.radius}
        jitter={config.jitter}
        blur={config.blur}
        threshold={config.threshold}
        className="absolute inset-0 h-full w-full"
      />
    </motion.div>
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
  const logoY = useTransform(scrollY, [0, viewportHeight], [150, 1000]);

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

  const logoFade = useTransform(
    scrollY,
    [viewportHeight * 0.25, viewportHeight * 1.2],
    [1, 0],
  );

  const SHAPE_SRC = "/images/bg-assets/raw.png";

  const layers: HalftoneLayerConfig[] = [
    {
      className: "",
      opacity: [1, 0.5],
      fade: logoFade,
      color: "#8d49ed",
      cell: 14,
      fill: 1.1,
      radius: 0.25,
      jitter: 0.27,
      threshold: 50,
    },
  ];

  return (
    <motion.div
      className="absolute inset-x-0 top-0 h-[150vh] z-[-1] pointer-events-none overflow-x-clip overflow-y-visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="absolute -inset-5 bg-[url('/images/bg-assets/gradient.png')] bg-cover bg-center"
        style={{ y: gradientY, opacity: gradientFade }}
      />
      <motion.div
        className="absolute -inset-5 bg-[url('/images/bg-assets/gradient.png')] bg-cover bg-center mix-blend-screen"
        style={{ y: gradientY, opacity: gradientScreenOpacity }}
      />

      {layers.map((config, index) => (
        <HalftoneLayer
          key={index}
          src={SHAPE_SRC}
          config={config}
          y={logoY}
          scrollY={scrollY}
          viewportHeight={viewportHeight}
        />
      ))}

      <div className="absolute inset-x-0 top-0 h-[80vh] bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
    </motion.div>
  );
}

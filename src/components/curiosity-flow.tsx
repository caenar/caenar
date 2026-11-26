"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

type NodeId =
  | "origin"
  | "creative"
  | "web"
  | "programming"
  | "linux"
  | "engineering"
  | "present";

type JourneyNode = {
  id: NodeId;
  label: string;
  headline: string;
  supporting: string;
};

type Connection = {
  id: string;
  from: NodeId | NodeId[];
  to: NodeId;
  kind: "forward" | "bidirectional";
  /** Draw order group; lower draws earlier. Same step draws together. */
  step: number;
};

const NODES: JourneyNode[] = [
  {
    id: "origin",
    label: "main",
    headline: "A Digital Playground",
    supporting:
      "Games, online communities & friends, and just playing around in the internet",
  },
  {
    id: "creative",
    label: "feat",
    headline: "Expressing Taste",
    supporting:
      "Freelancing, banners, branding, graphics, video production, and experimenting with 3D",
  },
  {
    id: "web",
    label: "feat",
    headline: "Showcasing Taste",
    supporting:
      "Early websites, HTML, and baby steps into the programming world",
  },
  {
    id: "programming",
    label: "feat",
    headline: "Learning Interest",
    supporting:
      "Algorithms, frameworks, tools, and understanding how things work beyond basics",
  },
  {
    id: "linux",
    label: "refactor",
    headline: "Beyond Learning",
    supporting:
      "Linux, customization, tiling managers, and exploring things closer to the system",
  },
  {
    id: "engineering",
    label: "merge",
    headline: "Integrating Concepts",
    supporting:
      "Architecture, abstractions, optimizations, and working towards substantial software",
  },
  {
    id: "present",
    label: "HEAD",
    headline: "???",
    supporting:
      "Building platforms that are designed around real people and real workflows",
  },
];

const NODE_ORDER: NodeId[] = [
  "origin",
  "creative",
  "programming",
  "web",
  "linux",
  "engineering",
  "present",
];

const SHORT_HASH: Record<NodeId, string> = {
  origin: "8f2a1c0",
  creative: "c3d9b4e",
  programming: "7a1f02d",
  web: "e4b82f1",
  linux: "9d0c3a7",
  engineering: "1b7e4f2",
  present: "f0c55a1",
};

type Rect = { x: number; y: number; w: number; h: number };
type Point = { x: number; y: number };

const anchor = {
  top: (r: Rect) => ({ x: r.x + r.w / 2, y: r.y }),
  bottom: (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h }),
  left: (r: Rect) => ({ x: r.x, y: r.y + r.h / 2 }),
  right: (r: Rect) => ({ x: r.x + r.w, y: r.y + r.h / 2 }),
};

const line = (a: Point, b: Point) => `M ${a.x} ${a.y} L ${b.x} ${b.y}`;

function buildPath(
  id: string,
  rects: Record<string, Rect>,
  box: DOMRect,
): { d: string; points: Point[] } | null {
  const r = (nid: NodeId) => {
    const el = rects[nid];
    if (!el) return null;
    return { x: el.x - box.left, y: el.y - box.top, w: el.w, h: el.h };
  };
  const origin = r("origin");
  const creative = r("creative");
  const web = r("web");
  const programming = r("programming");
  const linux = r("linux");
  const engineering = r("engineering");
  const present = r("present");
  if (
    !origin ||
    !creative ||
    !web ||
    !programming ||
    !linux ||
    !engineering ||
    !present
  )
    return null;

  const midYBand3 = (web.y + web.y + web.h) / 2; // vertical center of band 3
  const splitY = origin.y + origin.h + (creative.y - (origin.y + origin.h)) / 2;
  const o = anchor.bottom(origin);
  const cTop = anchor.top(creative);
  const pTop = anchor.top(programming);
  const cBot = anchor.bottom(creative);
  const pBot = anchor.bottom(programming);
  const wTop = anchor.top(web);
  const lTop = anchor.top(linux);
  const eTop = anchor.top(engineering);
  const eBot = anchor.bottom(engineering);
  const prTop = anchor.top(present);

  const wRight: Point = { x: anchor.right(web).x, y: midYBand3 };
  const lLeft: Point = { x: anchor.left(linux).x, y: midYBand3 };

  switch (id) {
    case "origin-down":
      return {
        d: line(o, { x: o.x, y: splitY }),
        points: [o, { x: o.x, y: splitY }],
      };
    case "origin-split-left":
      return {
        d: line({ x: o.x, y: splitY }, { x: cTop.x, y: splitY }),
        points: [],
      };
    case "origin-split-right":
      return {
        d: line({ x: o.x, y: splitY }, { x: pTop.x, y: splitY }),
        points: [],
      };
    case "origin-to-creative":
      return { d: line({ x: cTop.x, y: splitY }, cTop), points: [cTop] };
    case "origin-to-programming":
      return { d: line({ x: pTop.x, y: splitY }, pTop), points: [pTop] };
    case "creative-web":
      return { d: line(cBot, wTop), points: [cBot, wTop] };
    case "programming-linux":
      return { d: line(pBot, lTop), points: [pBot, lTop] };
    case "web-linux-h-left":
      return {
        d: line(wRight, { x: (wRight.x + lLeft.x) / 2, y: midYBand3 }),
        points: [wRight],
      };
    case "web-linux-h-right":
      return {
        d: line(lLeft, { x: (wRight.x + lLeft.x) / 2, y: midYBand3 }),
        points: [lLeft],
      };
    case "web-engineering-v":
      return {
        d: line({ x: eTop.x, y: midYBand3 }, eTop),
        points: [eTop],
      };
    case "engineering-present":
      return { d: line(eBot, prTop), points: [eBot, prTop] };
    default:
      return null;
  }
}

const ALL_CONNECTIONS: Connection[] = [
  {
    id: "origin-down",
    from: "origin",
    to: "creative",
    kind: "forward",
    step: 1,
  },
  {
    id: "origin-split-left",
    from: "origin",
    to: "creative",
    kind: "forward",
    step: 2,
  },
  {
    id: "origin-split-right",
    from: "origin",
    to: "programming",
    kind: "forward",
    step: 2,
  },
  {
    id: "origin-to-creative",
    from: "origin",
    to: "creative",
    kind: "forward",
    step: 3,
  },
  {
    id: "origin-to-programming",
    from: "origin",
    to: "programming",
    kind: "forward",
    step: 3,
  },
  { id: "creative-web", from: "creative", to: "web", kind: "forward", step: 5 },
  {
    id: "programming-linux",
    from: "programming",
    to: "linux",
    kind: "forward",
    step: 5,
  },
  {
    id: "web-linux-h-left",
    from: "web",
    to: "linux",
    kind: "bidirectional",
    step: 7,
  },
  {
    id: "web-linux-h-right",
    from: "linux",
    to: "web",
    kind: "bidirectional",
    step: 7,
  },
  {
    id: "web-engineering-v",
    from: "web",
    to: "engineering",
    kind: "forward",
    step: 8,
  },
  {
    id: "engineering-present",
    from: "engineering",
    to: "present",
    kind: "forward",
    step: 10,
  },
];

function NodeCard({
  node,
  index,
  registerRef,
  centered,
  progress,
  revealStep,
  totalSteps,
}: {
  node: JourneyNode;
  index: number;
  registerRef: (id: NodeId, el: HTMLDivElement | null) => void;
  centered?: boolean;
  progress?: MotionValue<number>;
  revealStep?: number;
  totalSteps?: number;
}) {
  const fallback = useMotionValue(1);
  const p = progress ?? fallback;
  const start =
    revealStep !== undefined && totalSteps ? revealStep / totalSteps : 0;
  const end = start + (totalSteps ? 0.8 / totalSteps : 0.1);
  const scrollOpacity = useTransform(p, [start, end], [0, 1]);
  const scrollY = useTransform(p, [start, end], [12, 0]);
  const scrollBlur = useTransform(p, [start, end], [3, 0]);
  const scrollFilter = useTransform(scrollBlur, (v) => `blur(${v}px)`);
  const prefersReducedMotion = useReducedMotion();
  const scrollDriven = !!progress && !prefersReducedMotion;

  return (
    <div
      ref={(el) => registerRef(node.id, el)}
      className={`h-[170px] w-full md:w-[290px] lg:w-[320px] xl:w-[385px] ${centered ? "mx-auto" : ""}`}
    >
      <motion.div
        className="card flex h-full justify-center flex-col overflow-hidden p-4 md:p-5 "
        initial={
          scrollDriven ? undefined : { opacity: 0, y: 8, filter: "blur(3px)" }
        }
        whileInView={
          scrollDriven ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }
        }
        viewport={scrollDriven ? undefined : { once: true, margin: "-150px" }}
        transition={
          scrollDriven
            ? undefined
            : {
              duration: 0.5,
              delay: index * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }
        }
        style={
          scrollDriven
            ? { opacity: scrollOpacity, y: scrollY, filter: scrollFilter }
            : undefined
        }
      >
        <div className="flex items-center gap-2 mb-2">
          <p
            className={`font-mono text-xs uppercase tracking-wider w-fit px-1.5 py-0.5 bg-foreground-300/5 ${
              node.id === "creative" || node.id === "web"
                ? "text-cyan-300"
                : node.id === "programming" || node.id === "linux"
                  ? "text-pink-300"
                  : "text-violet-100"
            }`}
          >
            {node.label}
          </p>
          <span className="font-mono text-xs text-white/35">
            {SHORT_HASH[node.id]}
          </span>
        </div>
        <h3 className="text-lg md:text-xl font-semibold leading-[1.15] mb-2">
          {node.headline}
        </h3>
        <p className="text-sm text-background-200 leading-relaxed">
          {node.supporting}
        </p>
      </motion.div>
    </div>
  );
}

function ScrollConnector({
  path,
  totalSteps,
  progress,
  reduceMotion,
}: {
  path: Connection & { d: string; points: Point[] };
  totalSteps: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const start = path.step / totalSteps;
  const end = (path.step + 1) / totalSteps;
  const pathLength = useTransform(progress, [start, end], [0, 1]);
  const opacity = useTransform(progress, [start, start + 0.02], [0, 1]);

  const nums = path.d.match(/-?[\d.]+/g)?.map(Number) ?? [];
  const x1 = nums[0] ?? 0,
    y1 = nums[1] ?? 0,
    x2 = nums[2] ?? 0,
    y2 = nums[3] ?? 0;
  const segLen = Math.hypot(x2 - x1, y2 - y1) || 1;

  const creativeBranch = new Set([
    "origin-split-left",
    "origin-to-creative",
    "creative-web",
    "web-linux-h-left",
  ]);
  const technicalBranch = new Set([
    "origin-split-right",
    "origin-to-programming",
    "programming-linux",
    "web-linux-h-right",
  ]);
  const stroke = creativeBranch.has(path.id)
    ? "rgba(103, 232, 249, 0.5)"
    : technicalBranch.has(path.id)
      ? "rgba(249, 168, 212, 0.5)"
      : "rgba(136, 74, 255, 0.5)";
  const dotFill = creativeBranch.has(path.id)
    ? "#67e8f9"
    : technicalBranch.has(path.id)
      ? "#f9a8d4"
      : "#7e45cd";

  return (
    <g>
      <motion.path
        d={path.d}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        style={reduceMotion ? undefined : { pathLength, opacity }}
        initial={reduceMotion ? { pathLength: 1, opacity: 1 } : undefined}
      />
      {(path.points ?? []).map((p, j) => {
        const t = Math.max(
          0,
          Math.min(1, Math.hypot(p.x - x1, p.y - y1) / segLen),
        );
        const dotAt = start + t * (end - start);
        return (
          <ScrollDot
            key={`${path.id}-${j}`}
            x={p.x}
            y={p.y}
            at={dotAt}
            progress={progress}
            reduceMotion={reduceMotion}
            fill={dotFill}
          />
        );
      })}
    </g>
  );
}

function ScrollDot({
  x,
  y,
  at,
  progress,
  reduceMotion,
  fill = "#7e45cd",
}: {
  x: number;
  y: number;
  at: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
  fill?: string;
}) {
  const opacity = useTransform(progress, [at - 0.01, at + 0.02], [0, 1]);
  return (
    <motion.rect
      x={x - 3}
      y={y - 3}
      width={6}
      height={6}
      fill={fill}
      style={reduceMotion ? undefined : { opacity }}
      initial={reduceMotion ? { opacity: 1 } : undefined}
    />
  );
}

function BranchLabel({
  label,
  color,
  progress,
  totalSteps,
  reduceMotion,
}: {
  label: string;
  color: "cyan" | "pink";
  progress: MotionValue<number>;
  totalSteps: number;
  reduceMotion: boolean;
}) {
  const start = 3 / totalSteps;
  const end = 4 / totalSteps;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [6, 0]);
  const styles =
    color === "cyan"
      ? "text-cyan-200 bg-cyan-950"
      : "text-pink-200 bg-pink-950";
  const dot = color === "cyan" ? "bg-cyan-300" : "bg-pink-300";

  return (
    <motion.div
      className="relative flex justify-center z-20 md:w-[290px] lg:w-[320px] xl:w-[385px]"
      style={reduceMotion ? undefined : { opacity, y }}
      initial={reduceMotion ? { opacity: 1 } : undefined}
    >
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 font-mono text-xs tracking-wide ${styles}`}
      >
        <span className={`h-1.5 w-1.5 ${dot}`} />
        {label}
      </span>
    </motion.div>
  );
}

function MergeLabel({
  progress,
  totalSteps,
  reduceMotion,
}: {
  progress: MotionValue<number>;
  totalSteps: number;
  reduceMotion: boolean;
}) {
  const start = 8 / totalSteps;
  const end = 9 / totalSteps;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [6, 0]);

  return (
    <motion.div
      className="relative z-20 flex justify-center"
      style={reduceMotion ? undefined : { opacity, y }}
      initial={reduceMotion ? { opacity: 1 } : undefined}
    >
      <span className="inline-flex items-center gap-2 border border-white/15 bg-background-100 px-3 py-1 font-mono text-xs tracking-wide text-white/70">
        <span className="h-1.5 w-1.5  bg-white/60" />
        git merge feat/creative feat/technical
      </span>
    </motion.div>
  );
}

export default function CuriosityFlow() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Partial<Record<NodeId, HTMLDivElement | null>>>({});
  const [paths, setPaths] = useState<
    Array<Connection & { d: string; points: Point[] }>
  >([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.6", "end 1"],
  });

  const registerRef = useCallback((id: NodeId, el: HTMLDivElement | null) => {
    nodeRefs.current[id] = el;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const box = container.getBoundingClientRect();
      const rects: Record<string, Rect> = {};
      (Object.keys(nodeRefs.current) as NodeId[]).forEach((id) => {
        const el = nodeRefs.current[id];
        if (!el) return;
        const r = el.getBoundingClientRect();
        rects[id] = { x: r.left, y: r.top, w: r.width, h: r.height };
      });
      const next = ALL_CONNECTIONS.map((c) => {
        const built = buildPath(c.id, rects, box);
        return built ? { ...c, d: built.d, points: built.points } : null;
      }).filter(
        (c): c is Connection & { d: string; points: Point[] } => c !== null,
      );
      setPaths(next);
      setSize({ w: box.width, h: box.height });
    };

    measure();
    const frame = requestAnimationFrame(measure);
    const frame2 = requestAnimationFrame(() => requestAnimationFrame(measure));
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    Object.values(nodeRefs.current).forEach((el) => el && ro.observe(el));
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(frame2);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const byId = (id: NodeId) => NODES.find((n) => n.id === id)!;
  const totalSteps = Math.max(12, ...paths.map((p) => p.step + 1));

  return (
    <section className="relative overflow-hidden pb-16 pt-16 sm:pb-20 sm:pt-20 md:pb-28 md:pt-24 lg:pb-36 lg:pt-28">
      <div aria-hidden className="pointer-events-none absolute inset-0" />
      <div className="relative w-full px-4 sm:px-6 md:px-[8vw] lg:px-[15vw]">
        <motion.div
          className="grid gap-2 mb-14 md:mb-20 items-center justify-items-center text-center"
          initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-sm uppercase tracking-wider text-violet-100">
            What led to what?
          </p>
          <h2>A Journey of Spontaneity</h2>
          <p className="max-w-[46ch] text-background-200">
            The shift from Minecraft and tomfoolery in Windows eventually led to
            Linux and software development.
          </p>
        </motion.div>

        {/* Desktop: centered canvas with SVG connectors */}
        <div ref={containerRef} className="relative hidden md:block">
          <svg
            className="absolute inset-0 z-10 pointer-events-none overflow-visible"
            width={size.w}
            height={size.h}
            aria-hidden
          >
            {paths.map((c) => (
              <ScrollConnector
                key={c.id}
                path={c}
                totalSteps={totalSteps}
                progress={scrollYProgress}
                reduceMotion={!!reduceMotion}
              />
            ))}
          </svg>

          <div className="relative flex flex-col gap-8 lg:gap-16">
            <div className="flex justify-center mb-16">
              <NodeCard
                node={byId("origin")}
                index={0}
                registerRef={registerRef}
                centered
                progress={scrollYProgress}
                revealStep={0}
                totalSteps={totalSteps}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-[auto_auto] gap-12 lg:gap-36 justify-center">
                <BranchLabel
                  label="feat/creative"
                  color="cyan"
                  progress={scrollYProgress}
                  totalSteps={totalSteps}
                  reduceMotion={!!reduceMotion}
                />
                <BranchLabel
                  label="feat/technical"
                  color="pink"
                  progress={scrollYProgress}
                  totalSteps={totalSteps}
                  reduceMotion={!!reduceMotion}
                />
              </div>
              <div className="grid grid-cols-[auto_auto] gap-12 lg:gap-36 items-start justify-center">
                <NodeCard
                  node={byId("creative")}
                  index={1}
                  registerRef={registerRef}
                  progress={scrollYProgress}
                  revealStep={4}
                  totalSteps={totalSteps}
                />
                <NodeCard
                  node={byId("programming")}
                  index={2}
                  registerRef={registerRef}
                  progress={scrollYProgress}
                  revealStep={4}
                  totalSteps={totalSteps}
                />
              </div>
            </div>

            <div className="grid grid-cols-[auto_auto] gap-12 lg:gap-36 items-start justify-center">
              <NodeCard
                node={byId("web")}
                index={3}
                registerRef={registerRef}
                progress={scrollYProgress}
                revealStep={6}
                totalSteps={totalSteps}
              />
              <NodeCard
                node={byId("linux")}
                index={4}
                registerRef={registerRef}
                progress={scrollYProgress}
                revealStep={6}
                totalSteps={totalSteps}
              />
            </div>

            <div className="flex flex-col items-center gap-3">
              <MergeLabel
                progress={scrollYProgress}
                totalSteps={totalSteps}
                reduceMotion={!!reduceMotion}
              />
              <NodeCard
                node={byId("engineering")}
                index={5}
                registerRef={registerRef}
                centered
                progress={scrollYProgress}
                revealStep={9}
                totalSteps={totalSteps}
              />
            </div>

            <div className="flex justify-center">
              <NodeCard
                node={byId("present")}
                index={6}
                registerRef={registerRef}
                centered
                progress={scrollYProgress}
                revealStep={11}
                totalSteps={totalSteps}
              />
            </div>
          </div>
        </div>

        {/* Mobile: reflow to a single vertical grid (no canvas graph) */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {NODE_ORDER.map((id, index) => (
            <div key={id}>
              {id === "creative" && (
                <p className="mb-2">
                  <span className="inline-flex items-center gap-2  border border-violet-100/25 bg-violet-100/[0.06] px-3 py-1 font-mono text-[11px] tracking-wide text-violet-100">
                    <span className="h-1.5 w-1.5  bg-violet-100" />
                    feat/creative
                  </span>
                </p>
              )}
              {id === "programming" && (
                <p className="mb-2">
                  <span className="inline-flex items-center gap-2  border border-pink-300/25 bg-pink-300/[0.06] px-3 py-1 font-mono text-[11px] tracking-wide text-pink-300">
                    <span className="h-1.5 w-1.5  bg-pink-300" />
                    feat/technical
                  </span>
                </p>
              )}
              {id === "engineering" && (
                <p className="mb-2 flex justify-center">
                  <span className="inline-flex items-center gap-2  border border-white/15 bg-white/[0.04] px-3 py-1 font-mono text-[11px] tracking-wide text-white/70">
                    <span className="h-1.5 w-1.5  bg-white/60" />
                    git merge feat/creative feat/technical
                  </span>
                </p>
              )}
              <NodeCard node={byId(id)} index={index} registerRef={() => { }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

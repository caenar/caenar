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
    label: "Origin",
    headline: "A Digital Playground",
    supporting:
      "Games, online communities & friends, and just playing around in the internet",
  },
  {
    id: "creative",
    label: "Creative",
    headline: "Expressing Taste",
    supporting:
      "Freelancing, banners, branding, graphics, video production, and experimenting with 3D",
  },
  {
    id: "web",
    label: "Web",
    headline: "Learning Interest",
    supporting:
      "Early websites, HTML, and baby steps into the programming world",
  },
  {
    id: "programming",
    label: "Programming",
    headline: "Showcasing Taste",
    supporting:
      "Algorithms, frameworks, tools, and understanding how things work beyond basics",
  },
  {
    id: "linux",
    label: "Linux",
    headline: "Beyond Learning",
    supporting:
      "Linux, customization, tiling managers, and exploring things closer to the system",
  },
  {
    id: "engineering",
    label: "Engineering",
    headline: "Integrating Concepts",
    supporting:
      "Architecture, abstractions, optimizations, and working towards substantial software",
  },
  {
    id: "present",
    label: "Present",
    headline: "???",
    supporting:
      "Building platforms that are designed around real people and real workflows",
  },
];

const NODE_ORDER: NodeId[] = [
  "origin",
  "creative",
  "web",
  "programming",
  "linux",
  "engineering",
  "present",
];

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

  const midYBand3 = (programming.y + programming.y + programming.h) / 2; // vertical center of band 3
  const splitY = origin.y + origin.h + (creative.y - (origin.y + origin.h)) / 2;
  const o = anchor.bottom(origin);
  const cTop = anchor.top(creative);
  const wTop = anchor.top(web);
  const cBot = anchor.bottom(creative);
  const wBot = anchor.bottom(web);
  const pTop = anchor.top(programming);
  const lTop = anchor.top(linux);
  const eTop = anchor.top(engineering);
  const eBot = anchor.bottom(engineering);
  const prTop = anchor.top(present);

  const pRight: Point = { x: anchor.right(programming).x, y: midYBand3 };
  const lLeft: Point = { x: anchor.left(linux).x, y: midYBand3 };

  switch (id) {
    case "origin-down":
      return { d: line(o, { x: o.x, y: splitY }), points: [o] };
    case "origin-split-h":
      return {
        d: line({ x: cTop.x, y: splitY }, { x: wTop.x, y: splitY }),
        points: [],
      };
    case "origin-to-creative":
      return { d: line({ x: cTop.x, y: splitY }, cTop), points: [cTop] };
    case "origin-to-web":
      return { d: line({ x: wTop.x, y: splitY }, wTop), points: [wTop] };
    case "creative-programming":
      return { d: line(cBot, pTop), points: [cBot, pTop] };
    case "web-linux":
      return { d: line(wBot, lTop), points: [wBot, lTop] };
    case "programming-linux-h":
      return { d: line(pRight, lLeft), points: [pRight, lLeft] };
    case "programming-linux-v":
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
  { id: "origin-down", from: "origin", to: "creative", kind: "forward", step: 0 },
  { id: "origin-split-h", from: "origin", to: "web", kind: "forward", step: 1 },
  { id: "origin-to-creative", from: "origin", to: "creative", kind: "forward", step: 2 },
  { id: "origin-to-web", from: "origin", to: "web", kind: "forward", step: 2 },
  { id: "creative-programming", from: "creative", to: "programming", kind: "forward", step: 3 },
  { id: "web-linux", from: "web", to: "linux", kind: "forward", step: 3 },
  { id: "programming-linux-h", from: "programming", to: "linux", kind: "bidirectional", step: 4 },
  { id: "programming-linux-v", from: "programming", to: "engineering", kind: "forward", step: 5 },
  { id: "engineering-present", from: "engineering", to: "present", kind: "forward", step: 6 },
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
  const start = revealStep !== undefined && totalSteps ? revealStep / totalSteps : 0;
  const end = start + (totalSteps ? 0.8 / totalSteps : 0.1);
  const scrollOpacity = useTransform(p, [start, end], [0, 1]);
  const scrollY = useTransform(p, [start, end], [12, 0]);
  const scrollBlur = useTransform(p, [start, end], [3, 0]);
  const scrollFilter = useTransform(scrollBlur, (v) => `blur(${v}px)`);
  const scrollDriven = !!progress && !useReducedMotion();

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
          scrollDriven
            ? undefined
            : { opacity: 1, y: 0, filter: "blur(0px)" }
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
        <p className="font-mono text-xs uppercase tracking-wider w-fit px-1.5 py-0.5 bg-foreground-300/5 text-violet-100 mb-2">
          {node.label}
        </p>
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
  const dotOpacity = useTransform(progress, [end - 0.05, end], [0, 1]);

  return (
    <g>
      <motion.path
        d={path.d}
        fill="none"
        stroke="rgba(136, 74, 255, 0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={
          reduceMotion
            ? undefined
            : { pathLength, opacity }
        }
        initial={reduceMotion ? { pathLength: 1, opacity: 1 } : undefined}
      />
      {(path.points ?? []).map((p, j) => (
        <motion.rect
          key={`${path.id}-${j}`}
          x={p.x - 3}
          y={p.y - 3}
          width={6}
          height={6}
          fill="#7e45cd"
          style={reduceMotion ? undefined : { opacity: dotOpacity }}
          initial={reduceMotion ? { opacity: 1 } : undefined}
        />
      ))}
    </g>
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
    offset: ["start 0.7", "end 0.6"],
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
  const totalSteps = Math.max(7, ...paths.map((p) => p.step + 1));

  return (
    <section className="relative overflow-hidden py-36">
      <div aria-hidden className="pointer-events-none absolute inset-0" />
      <div className="relative w-full px-4 sm:px-6 md:px-[8vw] lg:px-[15vw]">
        <motion.div
          className="grid gap-2 mb-14 md:mb-20 items-center justify-items-center text-center"
          initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-sm uppercase tracking-wider text-violet-100">
            What led to what?
          </p>
          <h2>A Journey of Spontaneity</h2>
          <p className="max-w-[46ch] text-background-200">
            The shift from Minecraft and tomfoolery in Windows eventually led
            to Linux and software development.
          </p>
        </motion.div>

        {/* Desktop: centered canvas with SVG connectors */}
        <div ref={containerRef} className="relative hidden md:block">
          <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
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

            <div className="grid grid-cols-2 gap-12 lg:gap-16 items-start justify-items-center">
              <NodeCard
                node={byId("creative")}
                index={1}
                registerRef={registerRef}
                progress={scrollYProgress}
                revealStep={2}
                totalSteps={totalSteps}
              />
              <NodeCard
                node={byId("web")}
                index={2}
                registerRef={registerRef}
                progress={scrollYProgress}
                revealStep={2}
                totalSteps={totalSteps}
              />
            </div>

            <div className="grid grid-cols-2 gap-12 lg:gap-16 items-start justify-items-center">
              <NodeCard
                node={byId("programming")}
                index={3}
                registerRef={registerRef}
                progress={scrollYProgress}
                revealStep={3}
                totalSteps={totalSteps}
              />
              <NodeCard
                node={byId("linux")}
                index={4}
                registerRef={registerRef}
                progress={scrollYProgress}
                revealStep={3}
                totalSteps={totalSteps}
              />
            </div>

            <div className="flex justify-center">
              <NodeCard
                node={byId("engineering")}
                index={5}
                registerRef={registerRef}
                centered
                progress={scrollYProgress}
                revealStep={5}
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
                revealStep={6}
                totalSteps={totalSteps}
              />
            </div>
          </div>
        </div>

        {/* Mobile: reflow to a single vertical grid (no canvas graph) */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {NODE_ORDER.map((id, index) => (
            <NodeCard
              key={id}
              node={byId(id)}
              index={index}
              registerRef={() => { }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

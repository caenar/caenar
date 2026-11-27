"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Facebook, Github, Linkedin } from "lucide-react";
import { useRouter } from "next/navigation";

import { GlyphBackground } from "@/components/ui/backgrounds-glyph";
import CuriosityFlow from "@/components/curiosity-flow";
import HomeCTA from "@/components/home-cta";
import FadeIn from "@/components/fade-in";
import FadeInLines from "@/components/fade-in-lines";
import ScrambleText from "@/components/scramble-text";
import Terminal, { type TerminalHandle } from "@/components/terminal";
import WorkTerminalSection from "@/components/work-terminal-section";
import { WorkSplitPane } from "@/components/work-split-pane";
import { IconSizes } from "@/lib/constants";
import type { Project } from "@/lib/types/project";
import type { TerminalCommand } from "@/shared/terminal/commands";

export default function HomeClient({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const heroRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroTerminalSlotRef = useRef<HTMLDivElement>(null);
  const workDockRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<TerminalHandle>(null);
  const hasPlayedWorkRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });
  const { scrollY } = useScroll();

  const [viewportHeight, setViewportHeight] = useState(2000);
  const [layout, setLayout] = useState({
    heroTop: 0,
    heroLeft: 0,
    heroHeight: 360,
    heroWidth: 0,
    heroViewportTop: 0,
    heroViewportLeft: 0,
    workTop: 0,
    workLeft: 0,
    workHeight: 600,
    workWidth: 0,
  });
  const [docked, setDocked] = useState(false);
  const [measured, setMeasured] = useState(false);

  useLayoutEffect(() => {
    const update = () => setViewportHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current;
    const heroSlot = heroTerminalSlotRef.current;
    const workDock = workDockRef.current;
    if (!wrapper || !heroSlot || !workDock) return;

    const offsetIn = (el: HTMLElement, ancestor: HTMLElement) => {
      let top = 0;
      let left = 0;
      let node: HTMLElement | null = el;
      while (node && node !== ancestor) {
        const style = window.getComputedStyle(node);
        if (style.position === "sticky") {
          const prev = node.style.position;
          node.style.position = "relative";
          top += node.offsetTop;
          left += node.offsetLeft;
          node.style.position = prev;
        } else {
          top += node.offsetTop;
          left += node.offsetLeft;
        }
        node = node.offsetParent as HTMLElement | null;
      }
      return { top, left };
    };

    const hero = offsetIn(heroSlot, wrapper);
    const work = offsetIn(workDock, wrapper);
    const wrapperDocTop = wrapper.getBoundingClientRect().top + window.scrollY;
    const wrapperDocLeft =
      wrapper.getBoundingClientRect().left + window.scrollX;
    const next = {
      heroTop: hero.top,
      heroLeft: hero.left,
      heroHeight: heroSlot.offsetHeight,
      heroWidth: heroSlot.offsetWidth,
      heroViewportTop: hero.top + wrapperDocTop,
      heroViewportLeft: hero.left + wrapperDocLeft,
      workTop: work.top,
      workLeft: work.left,
      workHeight: workDock.offsetHeight,
      workWidth: workDock.offsetWidth,
    };
    setLayout(next);
    setMeasured(true);
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    if (heroTerminalSlotRef.current) ro.observe(heroTerminalSlotRef.current);
    if (workDockRef.current) ro.observe(workDockRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const headlineY = useTransform(scrollYProgress, [0, 0.4], [200, 0]);
  const terminalY = useTransform(
    scrollYProgress,
    [0, 0.4],
    [viewportHeight, 0],
  );
  const bgY = useTransform(scrollY, [0, viewportHeight], [0, 300]);
  const bgFade = useTransform(
    scrollY,
    [viewportHeight * 0.25, viewportHeight * 1.1],
    [1, 0],
  );
  const glowFade = useTransform(scrollY, [0, viewportHeight * 0.4], [1, 0]);

  // Docking: keep terminal fixed; after dock it scrolls away naturally
  const NAV_OFFSET = 72;
  const workDockViewportY = Math.max(
    0,
    (viewportHeight - (layout.workHeight || viewportHeight * 0.74)) / 2 + NAV_OFFSET / 4,
  );
  const dockEnd = Math.max(1.2, layout.workTop - workDockViewportY);
  const dockStart = Math.max(0, dockEnd - viewportHeight * 0.55);
  const dockRelease = dockEnd + viewportHeight * 0.15;

  const fixedY = useTransform(scrollY, (v) => {
    if (v <= dockStart) return layout.heroViewportTop;
    if (v >= dockEnd && v <= dockRelease) return workDockViewportY;
    if (v > dockRelease) return workDockViewportY - (v - dockRelease);
    const t = (v - dockStart) / (dockEnd - dockStart);
    return (
      layout.heroViewportTop + (workDockViewportY - layout.heroViewportTop) * t
    );
  });
  const fixedX = useTransform(scrollY, (v) => {
    if (v <= dockStart) return layout.heroViewportLeft;
    if (v >= dockEnd) return layout.workLeft;
    const t = (v - dockStart) / (dockEnd - dockStart);
    return (
      layout.heroViewportLeft + (layout.workLeft - layout.heroViewportLeft) * t
    );
  });
  const terminalHeight = useTransform(scrollY, (v) => {
    if (v <= dockStart) return layout.heroHeight;
    if (v >= dockEnd) return layout.workHeight;
    const t = (v - dockStart) / (dockEnd - dockStart);
    return layout.heroHeight + (layout.workHeight - layout.heroHeight) * t;
  });
  const terminalWidth = useTransform(scrollY, (v) => {
    if (v <= dockStart) return layout.heroWidth;
    if (v >= dockEnd) return layout.workWidth;
    const t = (v - dockStart) / (dockEnd - dockStart);
    return layout.heroWidth + (layout.workWidth - layout.heroWidth) * t;
  });
  const terminalFixedY = useTransform(
    [fixedY, terminalY],
    ([d, e]: number[]) => d + e,
  );

  useMotionValueEvent(scrollY, "change", (v) => {
    const isDocked = v >= dockStart + (dockEnd - dockStart) * 0.6;
    if (isDocked !== docked) setDocked(isDocked);
  });

  const socials = [
    {
      name: "Github",
      url: "https://www.github.com/caenar",
      icon: <Github size={IconSizes.MEDIUM} />,
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/bobo.o.ng.bulaklak",
      icon: <Facebook size={IconSizes.MEDIUM} />,
    },
    {
      name: "Linkedin",
      url: "https://www.linkedin.com/in/stephaniearteta",
      icon: <Linkedin size={IconSizes.MEDIUM} />,
    },
  ];

  const reduceMotion = useReducedMotion() ?? false;
  const [bootDone, setBootDone] = useState(reduceMotion);
  const [terminalReady, setTerminalReady] = useState(reduceMotion);

  const BOOT_S = 1.8;
  const headlineDelay = reduceMotion ? 0 : BOOT_S;
  const headlineDone = headlineDelay + 1.4;
  const subtitleDelay = reduceMotion ? 0 : headlineDone + 0.1;
  const actionsDelay = reduceMotion ? 0 : subtitleDelay + 0.3;

  useEffect(() => {
    if (reduceMotion) {
      setBootDone(true);
      setTerminalReady(true);
      return;
    }
    const terminalDelayMs = (actionsDelay + 0.7) * 1000;
    const timers = [
      setTimeout(() => setBootDone(true), 1400),
      setTimeout(() => setTerminalReady(true), terminalDelayMs),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion, actionsDelay]);

  const featured = useMemo(() => projects.slice(0, 4), [projects]);
  const openProject = useCallback(
    (slug: string) => router.push(`/work/${slug}`),
    [router],
  );

  const extraCommands = useMemo<TerminalCommand[]>(
    () => [
      {
        name: "ls",
        description: "List featured projects",
        flags: [
          { alias: "", desc: "List available sections" },
          { alias: "work", desc: "List featured projects" },
        ],
        run(args) {
          const target = args[0]?.toLowerCase();
          if (!target) {
            return {
              type: "output",
              node: (
                <p className="text-white/80">
                  <span className="text-violet-100">work/</span> about/ contact/
                </p>
              ),
            };
          }
          if (target === "work") {
            return {
              type: "output",
              node: <WorkSplitPane projects={featured} onOpen={openProject} />,
            };
          }
          return {
            type: "output",
            node: (
              <p className="text-pink-500">
                ls: cannot access '{target}': No such file or directory
              </p>
            ),
          };
        },
      },
    ],
    [featured, openProject],
  );

  useEffect(() => {
    if (!docked || hasPlayedWorkRef.current) return;
    hasPlayedWorkRef.current = true;
    if (reduceMotion) {
      terminalRef.current?.run("ls work");
      return;
    }
    const t = setTimeout(() => {
      if (terminalRef.current?.hasUserInteracted()) return;
      void terminalRef.current?.typeAndRun("ls work");
    }, 500);
    return () => clearTimeout(t);
  }, [docked, reduceMotion]);

  return (
    <div ref={wrapperRef} className="relative">
      <motion.div
        className="absolute inset-x-0 top-0 h-[150vh] z-[-1]"
        style={{ y: bgY, opacity: bgFade }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-200/10 via-[25%] to-violet-200"
          style={{ opacity: glowFade }}
        />
        <GlyphBackground
          className="absolute inset-0"
          maskSrc="/images/bg-assets/raw.png"
          glowColor="#8d49ed"
        />
        <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-background-100 to-transparent pointer-events-none" />
        <motion.div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-background-100 via-background-100/80 to-transparent" />
      </motion.div>

      <section ref={heroRef} className="relative h-[200dvh]">
        <div className="sticky top-0 h-[100dvh] flex flex-col items-center justify-center overflow-visible px-4 sm:px-6">
          <div className="flex flex-col items-center gap-[3rem] z-10">
            <motion.div
              className="relative flex flex-col max-w-[45ch] gap-6"
              style={{ y: headlineY }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[24rem] w-[min(56rem,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background-100/80 blur-[90px]"
              />
              <div className="grid gap-5">
                <div className="relative">
                  <motion.div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-start sm:items-center sm:justify-center pointer-events-none"
                    initial={false}
                    animate={{
                      opacity: bootDone ? 0 : 1,
                      filter: bootDone ? "blur(3px)" : "blur(0px)",
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <div className="font-mono text-center text-sm text-white/70 space-y-2">
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                      >
                        <span className="text-violet-200">&gt;</span> loading
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: 0.4,
                          ease: "easeOut",
                        }}
                      >
                        <span className="text-violet-200">&gt;</span> cooking up
                        the screen
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: 0.8,
                          ease: "easeOut",
                        }}
                      >
                        <span className="text-violet-200">&gt;</span> ready
                      </motion.p>
                    </div>
                  </motion.div>
                  <h1 className="font-display font-semibold text-4xl text-left sm:text-5xl sm:text-center leading-[1.15] tracking-tight">
                    <ScrambleText
                      text="A creative designer that fell in love with programming"
                      delay={headlineDelay}
                      highlight={{ from: 25, to: 37 }}
                    />
                  </h1>
                </div>
                <p className="text-left sm:text-center text-muted-foreground">
                  <FadeInLines
                    delay={subtitleDelay}
                    lines={[
                      "From designing banners, posters, brands and media",
                      "production, now creating full-fledged platforms.",
                    ]}
                  />
                </p>
              </div>
              <FadeIn
                delay={actionsDelay}
                className="flex gap-5 justify-start sm:justify-center items-center"
              >
                <button type="button" className="primary-button">
                  View resume
                </button>
                <div className="flex gap-3">
                  {socials.map((social, index) => (
                    <motion.div
                      key={social.name}
                      initial={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        delay: actionsDelay + 0.08 + index * 0.06,
                        duration: 1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition hover:brightness-[0.8] cursor-pointer"
                      >
                        {social.icon}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </FadeIn>
            </motion.div>

            <div
              ref={heroTerminalSlotRef}
              className="z-10 w-[95vw] sm:w-[70vw] md:w-[55vw] max-w-full h-[45vh]"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <WorkTerminalSection dockRef={workDockRef} />

      <CuriosityFlow />
      <HomeCTA />

      <motion.div
        className="z-20"
        style={{
          position: "fixed",
          top: 0,
          left: fixedX,
          y: terminalFixedY,
          width: terminalWidth,
          height: terminalHeight,
          opacity: measured ? 1 : 0,
        }}
      >
        <Terminal
          ref={terminalRef}
          autoRunEnabled={terminalReady}
          extraCommands={extraCommands}
          className="w-full h-full max-w-full sm:w-full md:w-full"
        />
      </motion.div>
    </div>
  );
}

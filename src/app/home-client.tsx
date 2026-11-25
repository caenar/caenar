"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Component, Facebook, Github, Linkedin } from "lucide-react";

import { GlyphBackground } from "@/components/ui/backgrounds-glyph";
import CuriosityFlow from "@/components/curiosity-flow";
import FadeIn from "@/components/fade-in";
import FadeInLines from "@/components/fade-in-lines";
import ProjectCard from "@/components/project-card";
import ScrambleText from "@/components/scramble-text";
import Terminal from "@/components/terminal";
import { IconSizes } from "@/lib/constants";
import type { Project } from "@/lib/types/project";

export default function HomeClient({ projects }: { projects: Project[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });
  const { scrollY } = useScroll();

  const [viewportHeight, setViewportHeight] = useState(2000);

  useLayoutEffect(() => {
    const update = () => setViewportHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
  const headlineDone = headlineDelay + 1.5;
  const subtitleDelay = reduceMotion ? 0 : headlineDone + 0.1;
  const actionsDelay = reduceMotion ? 0 : subtitleDelay + 0.55;

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

  return (
    <>
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

      {/* backdrop gradient lives inside the hero, on top of the background glyphs */}
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
                      filter: bootDone ? "blur(6px)" : "blur(0px)",
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <div className="font-mono text-sm text-white/70 space-y-1">
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                      >
                        <span className="text-violet-200">&gt;</span> loading portfolio...
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.4, ease: "easeOut" }}
                      >
                        <span className="text-violet-200">&gt;</span> cooking up the screen...
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.8, ease: "easeOut" }}
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

            <motion.div className="z-10" style={{ y: terminalY }}>
              <Terminal autoRunEnabled={terminalReady} />
            </motion.div>
          </div>
        </div>
      </section>

      <CuriosityFlow />

      <section className="content grid gap-10">
        <div className="grid gap-2">
          <div className="icon-label">
            <Component size={IconSizes.XL} />
            <h2>Projects</h2>
          </div>
          <p className="max-w-[30ch] text-background-200">
            Take a look at some of highlight projects that I&apos;ve done
            before.
          </p>
        </div>
        <div className="grid gap-4">
          {projects.slice(0, 3).map((project) => (
            <Link key={project.id} href={`/work/${project.slug}`}>
              <ProjectCard
                title={project.title}
                desc={project.desc}
                tags={project.tags}
                images={project.project_image}
              />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

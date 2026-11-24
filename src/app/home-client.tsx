"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  const terminalY = useTransform(scrollYProgress, [0, 0.4], [viewportHeight, 0]);
  const bgY = useTransform(scrollY, [0, viewportHeight], [0, 300]);
  const bgFade = useTransform(scrollY, [viewportHeight * 0.25, viewportHeight * 1.1], [1, 0]);

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

  const subtitleDelay = 1.5;
  const actionsDelay = 1.65;

  return (
    <>
      <motion.div
        className="absolute inset-x-0 top-0 h-[150vh] z-[-1]"
        style={{ y: bgY, opacity: bgFade }}
      >
        <GlyphBackground
          className="absolute inset-0"
          maskSrc="/images/bg-assets/raw.png"
        />
      </motion.div>

      <section ref={heroRef} className="relative h-[200dvh]">
        <div className="sticky top-0 h-[100dvh] flex flex-col items-center justify-center overflow-visible">
          <div className="flex flex-col items-center gap-[3.5rem] z-10">
            <motion.div
              className="flex flex-col max-w-[42ch] gap-6"
              style={{ y: headlineY }}
            >
              <div className="grid gap-5">
                <h1 className="text-center font-display font-semibold leading-[1.15] tracking-tight">
                  <ScrambleText
                    text="A creative designer that fell in love with programming"
                    delay={0}
                    highlight={{ from: 25, to: 37 }}
                  />
                </h1>
                <p className="text-center text-muted-foreground">
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
                className="flex gap-5 justify-center items-center"
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
              <Terminal />
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
            Take a look at some of highlight projects that I&apos;ve done before.
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

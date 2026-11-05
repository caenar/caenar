"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useProject } from "@/lib/stores/use-project";
import { fetchProjects } from "./projects/action";
import { slugify } from "@/lib/utils/slugify";
import type { Project } from "@/lib/types/project";

import Background from "@/components/background";
import Terminal from "@/components/terminal";
import ProjectCard from "@/components/project-card";
import ScrambleText from "@/components/scramble-text";
import FadeInLines from "@/components/fade-in-lines";
import FadeIn from "@/components/fade-in";
import { IconSizes } from "@/lib/constants";
import { Component, Facebook, Github, Linkedin } from "lucide-react";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>(
    useProject.getState().projects || [],
  );
  const [loading, setLoading] = useState(false);

  // Tall wrapper that "pins" the hero. Progress runs from when the wrapper
  // hits the top of the viewport until its bottom reaches the viewport bottom.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

  // Final state: headline + terminal centered together, terminal just below headline.
  // Initial: shifted down; as the section is pinned, they rise independently to y:0.
  const headlineY = useTransform(scrollYProgress, [0, 0.4], [200, 0]);
  const terminalY = useTransform(scrollYProgress, [0, 0.4], [600, 0]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchProjects();
        setProjects(data);
        useProject.getState().setProjects(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (!useProject.getState().projects) load();
  }, []);

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

  // Headline scramble runs ~0s -> ~1.1s; subtitle/buttons follow after
  const subtitleDelay = 1.5;
  const actionsDelay = 1.65;

  return (
    <>
      <Background />

      <section ref={heroRef} className="relative h-[200vh]">
        {/* Pinned viewport: stays fixed while the tall section scrolls past */}
        <div className="sticky top-0 h-[100vh] flex flex-col items-center justify-center overflow-visible">
          {/* Final state: headline (upper) + terminal (just below) centered as a group.
              On scroll, both rise independently from shifted-down initial positions. */}
          <div className="flex flex-col items-center gap-[4rem] z-10">
            <motion.div
              className="flex flex-col max-w-[49ch] gap-6"
              style={{ y: headlineY }}
            >
              <div className="grid gap-5">
                <h1 className="text-center font-body leading-[1.15] tracking-tight">
                  <ScrambleText
                    text="A creative designer that fell in love with programming"
                    delay={0}
                    highlight={{ from: 25, to: 37 }}
                  />
                </h1>
                <p className="text-center text-background-200">
                  <FadeInLines
                    delay={subtitleDelay}
                    lines={[
                      "From designing banners, posters, brands and post-media",
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
                  See my resume
                </button>
                <div className="flex gap-3">
                  {socials.map((social, i) => (
                    <motion.div
                      key={social.name}
                      initial={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        delay: actionsDelay + 0.08 + i * 0.06,
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

      <section className="content grid gap-10">
        <div className="grid gap-2">
          <div className="icon-label">
            <Component size={IconSizes.XL} />
            <h2>Projects</h2>
          </div>
          <p className="max-w-[30ch] text-background-200">
            Take a look at some of highlight projects that I've done before.
          </p>
        </div>
        <div className="grid gap-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            projects.slice(0, 3).map((project: Project) => {
              return (
                <Link
                  key={`project-${project.id}`}
                  href={`/projects/${slugify(project.title)}`}
                >
                  <ProjectCard
                    title={project.title}
                    desc={project.desc}
                    tags={project.tags}
                    images={project.project_image}
                  />
                </Link>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}

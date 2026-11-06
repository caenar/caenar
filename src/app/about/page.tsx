"use client";

import Image from "next/image";
import React, { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, Code, Slice } from "lucide-react";

const EXPERIENCE_ITEMS = [
  "Worked with a New Zealand-based creative agency, producing visual content, brand identities, and promotional materials for both internal and external projects.",
  "Created logo animations, social media graphics, and video reels for campaigns and product launches.",
  "Assisted in developing visual guidelines and moodboards for client pitches and branding decks.",
  "Designed timetables, illustration-based ads, and promotional posters for events and digital use.",
  "Communicated directly with supervisors to revise and iterate designs quickly based on feedback.",
];

function ExperienceItem({
  text,
  index,
  total,
  progress,
}: {
  text: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const step = 0.7 / Math.max(total - 1, 1);
  const start = index * step;
  const end = Math.min(start + 0.45, 1);
  const y = useTransform(progress, [start, end], [90 * index, 0]);
  const opacity = useTransform(progress, [start, end], [0, 1]);

  return (
    <motion.li style={{ y, opacity }}>
      {text}
    </motion.li>
  );
}

export default function AboutPage() {
  const experienceRef = useRef<HTMLDivElement | null>(null);
  const educationRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress: experienceProgress } = useScroll({
    target: experienceRef,
    offset: ["start 0.8", "0.8 end"],
  });
  const experienceY = useTransform(experienceProgress, [0, 1], [100, 0]);
  const experienceOpacity = useTransform(experienceProgress, [0, 1], [0, 1]);

  const { scrollYProgress: experienceItemsProgress } = useScroll({
    target: experienceRef,
    offset: ["start end", "start start"],
  });

  const { scrollYProgress: educationProgress } = useScroll({
    target: educationRef,
    offset: ["start 0.9", "end end"],
  });
  const educationY = useTransform(educationProgress, [0, 1], [100, 0]);
  const educationOpacity = useTransform(educationProgress, [0, 1], [0, 1]);

  return (
    <>
      <section className="content">
        <div className="mb-16">
          <span className="page-title">About</span>
        </div>
        <div className="grid w-full gap-10 lg:gap-16 lg:grid-rows-[repeat(3,_fit-content(100%))] lg:grid-cols-[1fr_fit-content(100%)_1fr]">
          <div className="lg:row-span-3">
            <h2 className="leading-[1.1] max-w-[20ch] mb-8">
              An architect through design and systems
            </h2>
            <p className="opacity-60 mb-5">
              I’m a creative designer turned full-stack developer, though I
              don’t really draw a line between the two. I love structure,
              systems, and design with intention.
            </p>
            <p className="opacity-60 mb-5">
              Most of what I know came from tinkering, rarely from tutorials,
              mostly from curiosity, trial and error. I’ve always been that kind
              of geek. Not into hardware, but I knew my way around software:
              messing with YouTube, scripting random stuff in VBS, eventually
              building tools for myself.
            </p>
            <p className="opacity-60 mb-5">
              I started on Windows, jumped through distros like Arch and Alpine,
              and eventually settled into Fedora with Hyprland, all configured
              to my liking through Neovim (btw). Tiling window managers and
              custom dotfiles scared me at first, but I figured it out - and
              loved it.
            </p>
            <p className="opacity-60 mb-5">
              That’s how I work. Not always pretty, but always functional,
              intentional, and driven by whatever’s sparking my brain at the
              moment.
            </p>
          </div>
          <div className="w-full max-w-[530px] mx-auto lg:mx-0 lg:row-span-3 lg:w-[530px] aspect-[53/75] lg:h-[750px] lg:aspect-auto rounded-lg overflow-hidden">
            <Image
              priority
              alt="Picture of myself"
              width={1500}
              height={1500}
              src="/images/self.jpg"
              style={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
                borderRadius: "7px",
              }}
            />
          </div>
          <div className="lg:col-start-3 lg:row-start-2">
            <h5 className="leading-[1.1] max-w-[20ch] mb-5 icon-label">
              <Code /> PROGRAMMING
            </h5>
            <p className="opacity-60 max-w-[500px]">
              I find deep fulfillment in programming, it’s a mental playground.
              It makes me think, map out problems, and build things from scratch
              like my own kind of architect. When I work on a project, even the
              smallest features start to pop in my head, suddenly I’m thinking
              about scalability, collaboration, depth. Even if it’s just a
              simple to-do app, I can’t help but imagine what it could be.
            </p>
          </div>
          <div className="lg:col-start-3 lg:row-start-3">
            <h5 className="leading-[1.1] max-w-[20ch] mb-5 icon-label">
              <Slice /> DESIGN
            </h5>
            <p className="opacity-60 max-w-[500px]">
              My design work came first, driven by intuition, inspiration, and
              bursts of creative energy. When the vision clicks, I’ll polish it
              endlessly. But if it doesn’t, I tend to move on. That kind of
              spark-and-sprint mentality shaped how I approach problems
              creatively, but it also taught me the importance of structure.
            </p>
          </div>
          <div className="flex justify-center lg:row-start-4 lg:col-span-3">
            <span className="icon-label text-lg opacity-30">
              <ArrowDown /> scroll for more
            </span>
          </div>
        </div>
      </section>

      <section className="content flex flex-col items-center justify-center gap-10">
        <motion.div
          ref={experienceRef}
          className="grid grid-cols-1 md:grid-cols-[40%_1fr] gap-6 md:gap-0 py-12 md:py-20"
          style={{ y: experienceY, opacity: experienceOpacity }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Experience</h2>
          <div className="grid gap-8 md:gap-14">
            <div>
              <h3>Creative Designer at Visual Collections</h3>
              <h4 className="opacity-60">Remote · August 2023 — July 2024</h4>
            </div>
            <ul className="list-border grid gap-5 w-full max-w-[700px] text-base md:text-lg">
              {EXPERIENCE_ITEMS.map((text, index) => (
                <ExperienceItem
                  key={text}
                  text={text}
                  index={index}
                  total={EXPERIENCE_ITEMS.length}
                  progress={experienceItemsProgress}
                />
              ))}
            </ul>
          </div>
        </motion.div>
        <motion.div
          ref={educationRef}
          className="grid grid-cols-1 md:grid-cols-[40%_1fr] gap-6 md:gap-0 py-12 md:py-20"
          style={{ y: educationY, opacity: educationOpacity }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Education</h2>
          <ul className="grid gap-7 w-full max-w-[700px] text-base md:text-lg">
            <li>
              Divine Word College of Legazpi <br />
              <span className="opacity-60">
                Bachelor of Science in Information Technology <br />
                2023 — Present · Albay, PH
              </span>
              <div className="line my-5"></div>
              <span> Consistent Deans Lister, Academic Achiever</span>
              <br />
              <span>External Vice President in CSIT</span>
            </li>
          </ul>
        </motion.div>
      </section>
    </>
  );
}

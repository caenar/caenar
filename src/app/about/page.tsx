"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Code, Slice } from "lucide-react";
gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const sectionRefExperience = useRef(null);
  const sectionRefEducation = useRef(null);

  const listRef = useRef<HTMLLIElement[]>([]);

  const itemsRef = (el: HTMLLIElement) => {
    if (el && !listRef.current.includes(el)) {
      listRef.current.push(el);
    }
  };

  useEffect(() => {
    listRef.current.forEach((item, index) => {
      gsap.fromTo(
        item,
        { y: 90 * index, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRefExperience.current,
            start: "top bottom",
            end: "top top",
            scrub: 1.5,
          },
          delay: 0.7 * index,
        },
      );
    });

    gsap.fromTo(
      sectionRefExperience.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: sectionRefExperience.current,
          start: "top 80%",
          end: "80% bottom",
          scrub: 1.5,
        },
      },
    );

    gsap.fromTo(
      sectionRefEducation.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: sectionRefEducation.current,
          start: "-80% 80%",
          end: "bottom bottom",
          scrub: 1.5,
        },
      },
    );
  }, []);

  return (
    <>
      <section className="pt-36 pb-32 mx-[10vw]">
        <div className="mb-16">
          <span className="page-title">/ About</span>
        </div>
        <div className="grid grid-rows-[repeat(3,_fit-content(100%))] grid-cols-[1fr_fit-content(100%)_1fr] w-full gap-16">
          <div className="row-span-3">
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
          <div className="row-span-3 w-[530px] h-[750px] rounded-lg">
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
          <div className="col-start-3 row-start-2">
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
          <div className="col-start-3 row-start-3">
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
          <div className="flex justify-center row-start-4 col-span-3">
            <span className="icon-label text-lg opacity-30">
              <ArrowDown /> scroll for more
            </span>
          </div>
        </div>
      </section>

      <section className="content flex flex-col items-center justify-center gap-10">
        <div
          ref={sectionRefExperience}
          className="grid grid-cols-[40%_1fr] py-20"
        >
          <h2 className="text-5xl font-bold mb-2">Experience</h2>
          <div className="grid gap-14">
            <div>
              <h3>Creative Designer at Visual Collections</h3>
              <h4 className="opacity-60">Remote · August 2023 — July 2024</h4>
            </div>
            <ul className="list-border grid gap-5 w-[700px] text-lg">
              {[
                "Worked with a New Zealand-based creative agency, producing visual content, brand identities, and promotional materials for both internal and external projects.",
                "Created logo animations, social media graphics, and video reels for campaigns and product launches.",
                "Assisted in developing visual guidelines and moodboards for client pitches and branding decks.",
                "Designed timetables, illustration-based ads, and promotional posters for events and digital use.",
                "Communicated directly with supervisors to revise and iterate designs quickly based on feedback.",
              ].map((text, index) => (
                <li key={index} ref={itemsRef}>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          ref={sectionRefEducation}
          className="grid grid-cols-[40%_1fr] py-20"
        >
          <h2 className="text-5xl font-bold mb-2">Education</h2>
          <ul className="grid gap-7 w-[700px] text-lg">
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
        </div>
      </section>
    </>
  );
}

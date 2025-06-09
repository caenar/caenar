"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
      <section className="content">
        <div className="mb-20">
          <span className="page-title mb-20">/ About</span>
        </div>
        <div className="grid grid-cols-3 grid-rows-3">
          <div className="w-[400px] h-[500px] rounded-lg">
            <Image
              priority
              alt="Picture of myself"
              width={1000}
              height={1000}
              src="/self.jpg"
              style={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
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
            <ul className="list-border grid gap-5 w-[700px] text-xl">
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
          <ul className="grid gap-7 w-[700px] text-2xl">
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

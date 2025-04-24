"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import selfPortrait from "@/assets/self-portrait-2.jpg";

import selfComputer from "@/assets/self-portrait-3.jpg";
import selfFriends from "@/assets/self-with-friends.jpg";
import selfBike from "@/assets/self-bike.jpg";

export default function AboutPage() {
  const sectionRef = useRef(null);
  const sectionRefPictures = useRef(null);
  const sectionRefExperience = useRef(null);
  const sectionRefEducation = useRef(null);
  const pictures = [selfComputer, selfBike, selfFriends];

  const textRef = useRef(null);
  const listRef = useRef<HTMLLIElement[]>([]);
  const picturesRef = useRef<HTMLElement[]>([]);

  const addToPicturesRef = (el: HTMLImageElement) => {
    if (el && !picturesRef.current.includes(el)) {
      picturesRef.current.push(el);
    }
  };

  const itemsRef = (el: HTMLLIElement) => {
    if (el && !listRef.current.includes(el)) {
      listRef.current.push(el);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "30% 80%",
            end: "80% 80%",
            scrub: 1.5,
          },
        },
      );
    }, sectionRef);

    picturesRef.current.forEach((item, index) => {
      gsap.fromTo(
        item,
        { y: 0, x: -1600, rotate: -6 * index },
        {
          x: 1600 + 40 * index,
          rotate: Math.random() * (10 - -10) + -10,
          scrollTrigger: {
            trigger: sectionRefPictures.current,
            start: "top 80%",
            end: "110% -80%",
            scrub: 1.5,
          },
        },
      );
    });

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

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section className="content h-screen flex flex-col justify-between">
        <h5 className="page-title">/ About</h5>
        <div className="flex gap-14 items-end justify-between">
          <div className="flex flex-col gap-10 w-[65ch]">
            <h2 className="!text-5xl">
              A bit wild to think I was supposed to be a geodetic engineer, yet
              here I am now—building websites instead
            </h2>
            <p className="text-2xl">
              I’m Caenar (pronounced “kay-nar”) Arteta. I’m a self-taught
              graphic designer and a college student taking up Information
              Technology. Over the years, I’ve built up a skillset that blends
              frontend and backend development, branding, video editing, and
              graphic design.
            </p>
          </div>
          <div>
            <Image
              priority
              width={900}
              height={900}
              src={selfPortrait}
              alt="A picture of myself"
              className="rounded-xl"
            />
          </div>
        </div>
      </section>

      <section
        ref={sectionRef}
        className="content h-screen flex items-center justify-center"
      >
        <h1 ref={textRef} className="w-[35ch] text-center text-balance">
          Back in senior high, I started freelancing—taking on projects from
          logos to banners, posters, and even video editing gigs. That hustle
          eventually led me to work with a creative agency based in Auckland,
          New Zealand. There, I was in charge of crafting promotional content
          for another company, as well as developing brand identities for
          various clients.
        </h1>
      </section>

      <section
        ref={sectionRefPictures}
        className="content relative overflow-hidden flex h-screen items-center justify-center"
      >
        <h1>Queue carousel</h1>
        {pictures.map((img, index) => {
          return (
            <Image
              key={index}
              className="max-w-[35%] absolute rounded-lg top-50 rotate-[-3deg]"
              ref={addToPicturesRef}
              src={img}
              width={0}
              height={0}
              style={{
                zIndex: `${10 - 3 * index}`,
                left: `${30 * index}%`,
              }}
              alt={`Picture ${index}`}
            />
          );
        })}
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
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}

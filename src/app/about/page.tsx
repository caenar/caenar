"use client";

import Image from "next/image";
import React from "react";

import selfPortrait from "@/assets/self-portrait-2.jpg";

export default function AboutPage() {
  return (
    <>
      <section className="content h-screen flex flex-col justify-between">
        <h5 className="page-title">/ About</h5>
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-10 w-[66ch]">
            <h2>
              Kinda wild to think I was supposed to be a geodetic engineer, and
              now I’m here—building websites instead.
            </h2>
            <p>
              I’m Caenar (pronounced “kay-nar”) Arteta. I’m a self-taught
              graphic designer and a college student taking up Information
              Technology. Over the years, I’ve built up a skillset that blends
              frontend and backend development, branding, video editing, and
              graphic design.
            </p>
            <p>
              Back in senior high, I started freelancing—taking on projects from
              logos to banners, posters, and even video editing gigs. That
              hustle eventually led me to work with a creative agency based in
              Auckland, New Zealand. There, I was in charge of crafting
              promotional content for another company, as well as developing
              brand identities for various clients.
            </p>
          </div>
          <div>
            <Image
              priority
              width={900}
              height={900}
              src={selfPortrait}
              alt="A picture of myself"
              className="rounded"
            />
          </div>
        </div>
      </section>
      <section className="content">
        <h2>Experience</h2>
      </section>
    </>
  );
}

"use client";

import React from "react";

export default function AboutPage() {
  return (
    <section className="content h-screen flex flex-col justify-between">
      <h1 className="text-9xl">About Me</h1>
      <div className="grid gap-5 w-[60ch]">
        <h2>
          Kinda wild to think I was supposed to be a geodetic engineer, and now
          I’m here—building websites instead.
        </h2>
        <p>
          I’m Stephanie Arteta—but you can call me Caenar (pronounced
          “kay-nar”). I’m a self-taught graphic designer and a college student
          taking up Information Technology. Over the years, I’ve built up a
          skillset that blends frontend and backend development, branding, video
          editing, and graphic design.
        </p>
        <p>
          Back in senior high, I started freelancing—taking on projects from
          logos to banners, posters, and even video editing gigs. That hustle
          eventually led me to work with a creative agency based in Auckland,
          New Zealand. There, I was in charge of crafting promotional content
          for another company, as well as developing brand identities for
          various clients.
        </p>
      </div>
    </section>
  );
}

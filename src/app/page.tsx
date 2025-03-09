"use client";

import React from "react";
import {
  TbBrandFacebook,
  TbBrandGithub,
  TbBrandLinkedin,
  TbComponents,
} from "react-icons/tb";
import { IconSizes } from "@/constants/IconSizes";
import Terminal from "@/components/terminal";
import { PROJECTS } from "@/data/FeaturedProjects";
import ProjectCard, { ProjectCardProps } from "@/components/projectCard";

export default function Home() {
  return (
    <>
      <section className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col gap-10 w-[650px]">
          <div className="grid gap-5">
            <h1 className="font-body">
              A creative designer that{" "}
              <span className="text-violet-200">fell in love</span> with
              programming
            </h1>
            <p className="text-background-200">
              From designing banners, posters, brands and even post-media
              production, now creating fully-fledged websites that can span
              across different operating systems.
            </p>
          </div>
          <div className="flex gap-5 items-center">
            <button type="button" className="primary-button">
              See my resume
            </button>
            <div className="flex gap-2">
              <a href="https://www.github.com/notansjwmember" target="_blank">
                <TbBrandGithub size={IconSizes.MEDIUM} />
              </a>
              <a
                href="https://www.facebook.com/bobo.o.ng.bulaklak"
                target="_blank"
              >
                <TbBrandFacebook size={IconSizes.MEDIUM} />
              </a>
              <a href="https://www.linkedin.com/in/caenarguen" target="_blank">
                <TbBrandLinkedin size={IconSizes.MEDIUM} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="flex justify-center">
        <Terminal />
      </section>

      <section className="content grid gap-10">
        <div className="grid gap-2">
          <div className="icon-label">
            <TbComponents size={IconSizes.XL} />
            <h2>Projects</h2>
          </div>
          <p className="max-w-[30ch] text-background-200">
            Take a look at some of highlight projects that I've done before.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {PROJECTS.sort((a, b) => a.title.localeCompare(b.title)).map(
            (project: ProjectCardProps, index: number) => {
              return (
                <React.Fragment key={`${project}-${index}`}>
                  <ProjectCard
                    title={project.title}
                    desc={project.desc}
                    tags={project.tags}
                  />
                </React.Fragment>
              );
            },
          )}
        </div>
      </section>
    </>
  );
}

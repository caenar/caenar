"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useProject } from "@/lib/stores/use-project";
import { fetchProjects } from "./projects/action";
import { slugify } from "@/lib/utils/slugify";
import type { Project } from "@/lib/types/project";

import Terminal from "@/components/terminal";
import ProjectCard from "@/components/project-card";
import { IconSizes } from "@/lib/constants";
import { Component, Facebook, Github, Linkedin } from "lucide-react";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>(
    useProject.getState().projects || [],
  );
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      <section className="h-[100vh] flex flex-col gap-[3rem] items-center justify-center">
        <div className="flex flex-col gap-6 max-w-[50ch]">
          <div className="grid gap-5">
            <h1 className="font-body leading-[1.15]">
              A creative designer that{" "}
              <span className="text-violet-200">fell in love</span> with
              programming
            </h1>
            <p className="text-background-200">
              From designing banners, posters, brands and even post-media
              production, now creating full-fledged platforms.
            </p>
          </div>
          <div className="flex gap-5 items-center">
            <button type="button" className="primary-button">
              See my resume
            </button>
            <div className="flex gap-3">
              {socials.map((social) => (
                <Link
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:brightness-[0.8] cursor-pointer"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Terminal />
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
        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            projects.map((project: Project) => {
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

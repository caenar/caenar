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

  // FIX: just remove this later, commit streak

  return (
    <>
      <section className="pt-18 h-[100vh] flex flex-col gap-[5rem] items-center justify-center">
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
                <Github size={IconSizes.MEDIUM} />
              </a>
              <a
                href="https://www.facebook.com/bobo.o.ng.bulaklak"
                target="_blank"
              >
                <Facebook size={IconSizes.MEDIUM} />
              </a>
              <a href="https://www.linkedin.com/in/caenarguen" target="_blank">
                <Linkedin size={IconSizes.MEDIUM} />
              </a>
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
        <div className="grid grid-cols-4 gap-4">
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

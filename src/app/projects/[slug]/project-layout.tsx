"use client";

import Image from "next/image";
import Link from "next/link";

import type { Project, ProjectLayout, Tag } from "@/lib/types";
import { IconSizes } from "@/lib/constants";
import { RenderLayout } from "@/components/project/render-layout";
import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react";

export default function ProjectLayout({ project }: { project: Project }) {
  return (
    <>
      <section className="pt-32 pb-16 mx-[25vw]">
        <Link
          href="/projects"
          className="icon-label uppercase text-sm font-mono"
        >
          <ArrowLeft size={IconSizes.SMALL} className="mb-1" />
          Back to projects
        </Link>
        <div className="line mt-5 mb-12"></div>
        <div className="grid gap-5">
          <div className="flex gap-2">
            {project.tags.map((tag: Tag) => (
              <div
                key={tag.id}
                className="text-xs badge w-fit border-background-200 text-background-200"
              >
                {tag.name}
              </div>
            ))}
          </div>
          <h1 className="font-bold">{project.title}</h1>
          <p className="text-lg opacity-60">{project.desc}</p>
          <div className="button-container !gap-5">
            <button type="button" className="primary-button icon-label">
              <ExternalLink size={IconSizes.SMALL} />
              Live demo
            </button>
            <button type="button" className="icon-label">
              <Github size={IconSizes.SMALL} />
              View code
            </button>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-[55vw] rounded-lg">
          <Image
            priority
            src={
              project.project_image.find((p) => p.order === 0)?.image_url ??
              "placeholder.jpg"
            }
            alt={`Hero image of project ${project.title}`}
            width={2000}
            height={2000}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            className="rounded-lg"
          />
        </div>
      </section>

      {/* render the dynamic JSON layout */}
      <RenderLayout
        images={project.project_image}
        layout={project.layout as ProjectLayout}
      />

      <section className="flex justify-center py-32 mx-[25vw]">
        <Link className="icon-label font-mono uppercase text-3xl" href="/">
          Next project
          <ArrowRight size={IconSizes.XL} />
        </Link>
      </section>
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react";

import { RenderLayout } from "@/components/project/render-layout";
import { IconSizes } from "@/lib/constants";
import type { Project, Tag } from "@/lib/types";

export default function ProjectLayout({
  project,
  nextProject,
}: {
  project: Project;
  nextProject?: Pick<Project, "slug" | "title">;
}) {
  const externalLinks = [
    project.live_link
      ? {
          href: project.live_link,
          label: "Live demo",
          icon: <ExternalLink size={IconSizes.SMALL} />,
        }
      : null,
    project.code_link
      ? {
          href: project.code_link,
          label: "View code",
          icon: <Github size={IconSizes.SMALL} />,
        }
      : null,
  ].filter((link): link is NonNullable<typeof link> => link !== null);

  return (
    <>
      <section className="pt-32 pb-16 mx-[25vw]">
        <Link
          href="/work"
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
          {externalLinks.length > 0 && (
            <div className="button-container !gap-5">
              {externalLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-button icon-label"
                >
                  {link.icon}
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-[55vw] rounded-lg">
          <Image
            priority
            src={
              project.project_image.find((image) => image.role === "cover")
                ?.image_url ??
              project.project_image.find((image) => image.order === 0)
                ?.image_url ??
              project.project_image[0]?.image_url ??
              "/placeholder.svg"
            }
            alt={`Hero image of project ${project.title}`}
            width={2000}
            height={2000}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            className="rounded-lg"
          />
        </div>
      </section>

      <RenderLayout images={project.project_image} layout={project.layout} />

      <section className="flex justify-center py-32 mx-[25vw]">
        <Link
          className="icon-label font-mono uppercase text-3xl"
          href={nextProject ? `/work/${nextProject.slug}` : "/work"}
        >
          Next project{nextProject ? `: ${nextProject.title}` : ""}
          <ArrowRight size={IconSizes.XL} />
        </Link>
      </section>
    </>
  );
}

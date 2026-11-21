import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPublicProjectBySlug,
  getPublicProjects,
  getPublicProjectSlugs,
} from "@/lib/projects/public-content";

import ProjectLayout from "./project-layout";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublicProjectSlugs();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getPublicProjectBySlug(slug);

  if (!project) return {};

  return {
    title: project.title,
    description: project.desc,
    alternates: {
      canonical: `/work/${project.slug}`,
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getPublicProjectBySlug(slug);

  if (!project) notFound();

  const projects = getPublicProjects();
  const projectIndex = projects.findIndex((item) => item.slug === project.slug);
  const nextProject =
    projects.length > 0 ? projects[(projectIndex + 1) % projects.length] : undefined;

  return <ProjectLayout project={project} nextProject={nextProject} />;
}

import { getProjectBySlug } from "@/lib/db/get-project-by-slug";
import React from "react";
import ProjectLayout from "./project-layout";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return <div>Not found</div>;
  }

  return <ProjectLayout project={project} />;
}

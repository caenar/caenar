import { getProjectBySlug } from "@/lib/db/get-project-by-slug";
import React from "react";
import ProjectLayout from "./project-layout";

// TODO: Must fix the error on params slug, it's annoying
interface PageProps {
  params: {
    slug: string;
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    return <div>Not found</div>;
  }

  return <ProjectLayout project={project} />;
}

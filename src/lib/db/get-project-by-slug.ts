import prisma from "../prisma";
import { Project } from "../types";

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const rawProject = await prisma.project.findUnique({
    where: { slug },
    include: {
      project_tag: {
        include: {
          tag: true,
        },
      },
      project_image: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!rawProject) {
    return null;
  }

  const { project_tag, ...rest } = rawProject;

  const project = {
    ...rest,
    id: rawProject.id.toString(),
    created_at: rawProject.created_at.toISOString(),
    live_link: rawProject.live_link ?? undefined,
    code_link: rawProject.code_link ?? undefined,
    figma_link: rawProject.figma_link ?? undefined,
    layout: rawProject.layout ?? undefined,
    tags: project_tag.map((pt) => ({
      id: pt.tag.id.toString(),
      name: pt.tag.name,
    })),
    project_image: rawProject.project_image.map((img) => ({
      id: img.id.toString(),
      image_url: img.image_url,
      order: img.order,
    })),
  };

  return project as Project;
}

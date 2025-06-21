import prisma from "../prisma";

export async function getProjectBySlug(slug: string) {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      project_tag: {
        include: {
          tag: true,
        },
      },
      project_image: true,
    },
  });

  if (!project) {
    return null;
  }

  const serializedProject = {
    ...project,
    id: project.id.toString(),
    created_at: project.created_at.toISOString(),
    project_tag: undefined,
    tags: project.project_tag.map((pt) => ({
      id: pt.tag.id.toString(),
      name: pt.tag.name,
    })),
    project_image: project.project_image.map((img) => ({
      id: img.id.toString(),
      image_url: img.image_url,
      order: img.order,
    })),
  };

  return serializedProject;
}

import prisma from "../prisma";

export async function getProjectBySlug(slug: string) {
  const project = await prisma.project.findUnique({
    where: { slug },
  });
  return project;
}

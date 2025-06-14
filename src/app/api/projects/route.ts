import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        project_tag: {
          include: {
            tag: true,
          },
        },
        project_image: true,
      },
    });

    if (!projects) {
      return NextResponse.json({ message: "No projects", status: 404 });
    }

    const serializedProjects = projects.map((project) => ({
      ...project,
      id: project.id.toString(),
      created_at: project.created_at.toISOString(),
      project_tag: undefined,
      tags: project.project_tag.map((pt) => ({
        ...pt.tag,
        id: pt.tag.id.toString(),
      })),
      project_image: project.project_image.map((img) => ({
        image_url: img.image_url,
        order: img.order,
      })),
    }));

    return NextResponse.json(serializedProjects, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch projects: ${error}` },
      { status: 500 },
    );
  }
}

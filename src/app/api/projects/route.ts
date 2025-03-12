import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const projects = await prisma.projects.findMany();

    if (!projects) {
      return NextResponse.json({ message: "No projects", status: 404 });
    }

    const serializedProjects = projects.map((project) => ({
      ...project,
      id: project.id.toString(),
    }));

    return NextResponse.json(serializedProjects, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch projects: ${error}` },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, desc } = body;

    const project = await prisma.projects.create({
      data: { title, desc },
    });

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create project: ${error}` },
      { status: 500 },
    );
  }
}

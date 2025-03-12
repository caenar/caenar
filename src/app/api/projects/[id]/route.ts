import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch project: ${error}` },
      { status: 500 },
    );
  }
}
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { title, desc } = body;

    const project = await prisma.project.update({
      where: { id: params.id },
      data: { title, desc },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found", status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update project: ${error}` },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Project deleted", status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete project: ${error}` },
      { status: 500 },
    );
  }
}

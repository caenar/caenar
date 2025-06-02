import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = (await params).id;

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();
    const { title, desc } = body;
    const id = (await params).id;

    const project = await prisma.project.update({
      where: { id: Number(id) },
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
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = (await params).id;

    await prisma.project.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Project deleted", status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete project: ${error}` },
      { status: 500 },
    );
  }
}

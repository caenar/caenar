import prisma from "@/utils/prisma";
import { supabase } from "@/utils/supabase/client";
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
        ...img,
        id: img.id.toString(),
        project_id: img.project_id.toString(),
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

export async function POST(req: Request) {
  try {
    const body = await req.formData();

    const title = body.get("title")?.toString();
    const desc = body.get("desc")?.toString();
    const tagsValue = body.get("tags")?.toString();
    const tags = tagsValue?.split(",").map((t) => t.trim());
    const images = body.getAll("images") as File[];

    if (!title || !tags || !images.length) {
      return NextResponse.json(
        { error: "Missing title, tags, or images" },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        desc,
      },
    });

    for (const tag of tags) {
      const existingTag = await prisma.tag.upsert({
        where: { name: tag },
        update: {},
        create: { name: tag },
      });

      await prisma.project_tag.create({
        data: {
          project_id: project.id,
          tag_id: existingTag.id,
        },
      });
    }

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const filePath = `projects/${project.id}/${Date.now()}_${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, image);

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      await prisma.project_image.create({
        data: {
          project_id: project.id,
          image_url: imageUrl,
        },
      });
    }

    return NextResponse.json(
      {
        ...project,
        id: project.id.toString(),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: `Failed to create project: ${error.message}` },
      { status: 500 },
    );
  }
}

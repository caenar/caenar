"use server";

import { prisma } from "@/lib/prisma";
import { fail, ok, Result } from "@/lib/utils/result";
import { revalidatePath } from "next/cache";
import { addProjectSchema } from "@/lib/schemas/project.schema";
import type { ErrorType } from "@/lib/types";
import { supabase } from "@/lib/supabase";

// read
export async function fetchProjects(): Promise<any> {
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
      throw new Error("No projects");
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

    return serializedProjects;
  } catch (error) {
    throw new Error(`Failed to fetch proejcts: ${error}`);
  }
}

// create
export async function addProject(
  formData: FormData,
): Promise<Result<string, ErrorType, any>> {
  try {
    const rawTitle = formData.get("title")?.toString() ?? "";
    const rawDesc = formData.get("desc")?.toString() ?? "";
    const rawTags = formData.getAll("tags").map((tag) => tag.toString());
    const images = formData.getAll("images") as File[];

    const parsed = addProjectSchema.safeParse({
      title: rawTitle,
      desc: rawDesc,
    });

    if (!parsed.success) return fail("validation", parsed.error.format());

    const { title, desc } = parsed.data;

    const normalizedTags = rawTags.map((t: string) => t.trim().toLowerCase());

    if (!images.length)
      return fail("validation", "At least one image is required");

    const project = await prisma.project.create({
      data: {
        title,
        desc,
      },
    });

    for (const tag of normalizedTags) {
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

    revalidatePath("/admin", "page");
    return ok(`Added project "${title}" successfully`);
  } catch (err) {
    console.error("Project creation error: ", err);
    return fail("server", {
      message: "Something went wrong. Please try again.",
    });
  }
}

// put
export async function editProject(
  formData: FormData,
): Promise<Result<string, ErrorType, any>> {
  try {
    const projectId = formData.get("projectId")?.toString() ?? "";
    const title = formData.get("title")?.toString() ?? "";
    const desc = formData.get("desc")?.toString() ?? "";
    const tags = (formData.getAll("tags") as string[])
      .map((t) => t.trim())
      .filter(Boolean);
    const images = formData.getAll("images") as File[];

    const parsedProjectId = parseInt(projectId, 10);

    await prisma.project.update({
      where: { id: parsedProjectId },
      data: {
        title,
        desc,
      },
    });

    await prisma.project_tag.deleteMany({
      where: { project_id: parsedProjectId },
    });

    for (const tag of tags) {
      const existingTag = await prisma.tag.upsert({
        where: { name: tag },
        update: {},
        create: { name: tag },
      });

      await prisma.project_tag.create({
        data: {
          project_id: parsedProjectId,
          tag_id: existingTag.id,
        },
      });
    }

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const filePath = `projects/${projectId}/${Date.now()}_${image.name}`;

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
          project_id: parsedProjectId,
          image_url: imageUrl,
        },
      });
    }

    revalidatePath("/admin", "page");
    return ok(`Project ${title} updated`);
  } catch (err) {
    console.error("Project update error: ", err);
    return fail("server", {
      message: "Something went wrong. Please try again.",
    });
  }
}

// delete
export async function deleteProject(
  projectId: string,
): Promise<Result<string, ErrorType, any>> {
  try {
    const parsedProjectId = parseInt(projectId, 10);

    if (isNaN(parsedProjectId)) {
      return fail("validation", "Invalid project ID");
    }

    const project = await prisma.project.findUnique({
      where: { id: parsedProjectId },
    });

    if (!project) {
      return fail("not_found", "Project not found");
    }

    await prisma.project.delete({
      where: { id: parsedProjectId },
    });

    return ok(`Project deleted`);
  } catch (err) {
    console.error("Project deletion error: ", err);
    return fail("server", {
      message: "Something went wrong. Please try again",
    });
  }
}

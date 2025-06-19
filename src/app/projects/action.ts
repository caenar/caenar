"use server";

import { prisma } from "@/lib/prisma";
import { fail, ok, Result } from "@/lib/utils/result";
import { revalidatePath } from "next/cache";
import { addProjectSchema } from "@/lib/schemas/project.schema";
import type { ErrorType } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export async function fetchProjects(): Promise<any[]> {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ order: "asc" }, { created_at: "desc" }],
      include: {
        project_tag: {
          include: {
            tag: true,
          },
        },
        project_image: true,
      },
    });

    if (projects.length === 0) {
      return [];
    }

    return projects.map((project) => {
      const { id, created_at, project_tag, project_image, ...rest } = project;

      return {
        ...rest,
        id: id.toString(),
        created_at: created_at.toISOString(),
        tags: project_tag.map((pt) => ({
          id: pt.tag.id.toString(),
          name: pt.tag.name,
        })),
        project_image: project_image.map((img) => ({
          id: img.id.toString(),
          image_url: img.image_url,
          order: img.order,
        })),
      };
    });
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
      const filePath = `projects/${project.id}/${Date.now()}_${image.name.replace(" ", "-").toLowerCase()}`;

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
    const removedImagesRaw = formData.getAll("removedImages") as string[];
    const removedImages = removedImagesRaw.map((r) => JSON.parse(r));

    let parsedProjectId: bigint;
    try {
      parsedProjectId = BigInt(projectId);
    } catch {
      return fail("validation", "Invalid project ID");
    }

    const tagUpserts = await Promise.all(
      tags.map((tag) =>
        prisma.tag.upsert({
          where: { name: tag },
          update: {},
          create: { name: tag },
        }),
      ),
    );

    const imagePaths = removedImages
      .map((img) => img.image_url.split("/").pop())
      .filter(Boolean)
      .map((filename) => `projects/${parsedProjectId}/${filename}`);

    if (imagePaths.length > 0) {
      const { error: supabaseError } = await supabase.storage
        .from("images")
        .remove(imagePaths);
      if (supabaseError) {
        console.error("Supabase delete error:", supabaseError);
        return fail("storage", "Error deleting project image files");
      }

      await prisma.project_image.deleteMany({
        where: {
          id: {
            in: removedImages.map((img) => BigInt(img.id)),
          },
        },
      });

      console.log("Deleted image files:", imagePaths);
    }

    const uploadedImages = await Promise.all(
      images.map(async (image) => {
        const filePath = `projects/${projectId}/${Date.now()}_${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, image);

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      }),
    );

    await prisma.$transaction([
      prisma.project.update({
        where: { id: parsedProjectId },
        data: {
          title,
          desc,
        },
      }),

      prisma.project_tag.deleteMany({
        where: { project_id: parsedProjectId },
      }),

      ...tagUpserts.map((tag) =>
        prisma.project_tag.create({
          data: {
            project_id: parsedProjectId,
            tag_id: tag.id,
          },
        }),
      ),

      ...uploadedImages.map((url) =>
        prisma.project_image.create({
          data: {
            project_id: parsedProjectId,
            image_url: url,
          },
        }),
      ),
    ]);

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

    const images = await prisma.project_image.findMany({
      where: { project_id: parsedProjectId },
    });

    const imagePaths = images
      .map((img) => img.image_url.split("/").pop())
      .filter(Boolean)
      .map((filename) => `projects/${parsedProjectId}/${filename}`);

    if (imagePaths.length > 0) {
      const { error: supabaseError } = await supabase.storage
        .from("images")
        .remove(imagePaths);

      if (supabaseError) {
        console.error("Supabase delete error:", supabaseError);
        return fail("storage", "Error deleting project image files");
      }

      console.log("Deleted image files:", imagePaths);
    }

    await prisma.$transaction([
      prisma.project.delete({
        where: { id: parsedProjectId },
      }),
    ]);

    return ok(`Project deleted`);
  } catch (err) {
    console.error("Project deletion error: ", err);
    return fail("server", {
      message: "Something went wrong. Please try again",
    });
  }
}

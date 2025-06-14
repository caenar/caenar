"use server";

import { prisma } from "@/lib/prisma";
import { fail, ok, Result } from "@/lib/utils/result";
import { revalidatePath } from "next/cache";
import { addProjectSchema } from "@/lib/schemas/project.schema";
import type { ErrorType } from "@/lib/types";
import { supabase } from "@/lib/supabase";

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
      tags: rawTags,
    });

    if (!parsed.success) return fail("validation", parsed.error.format());

    const { title, desc, tags } = parsed.data;

    if (!images.length)
      return fail("validation", "At least one image is required");

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

    revalidatePath("/admin", "page");
    return ok(`Added project "${title}" successfully`);
  } catch (err) {
    console.error("Project creation error: ", err);
    return fail("server", {
      message: "Something went wrong. Please try again.",
    });
  }
}

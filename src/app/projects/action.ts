"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, Result } from "@/lib/utils/result";
import { revalidatePath } from "next/cache";
import { addProjectSchema } from "@/lib/schemas/project.schema";
import type { ErrorType } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export async function addProject(
  values: z.infer<typeof addProjectSchema>,
): Promise<Result<string, ErrorType, any>> {
  try {
    const parsed = addProjectSchema.safeParse(values);
    if (!parsed.success) return fail("validation", parsed.error.format());

    const { title, desc, tags, images } = parsed.data;

    if (!title || !tags || !images.length)
      return fail("validation", "Missing required fields");

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
    return ok(`Added project ${title} successfully`);
  } catch (err) {
    console.log("Note creation eror: ", err);
    return fail("server", {
      message: "Something went wrong. Please try again.",
    });
  }
}

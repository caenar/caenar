import { z } from "zod";

export const addProjectSchema = z.object({
  title: z.string().min(1),
  desc: z.string().min(1),
  tags: z.custom<string[]>().refine((tags) => tags && tags.length > 0, {
    message: "At least one tag is required",
  }),
  images: z.custom<File[]>().refine((files) => files && files.length > 0, {
    message: "At least one image is required",
  }),
});

export const editProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  desc: z.string().optional(),
  tags: z.custom<string[]>().optional(),
  images: z.custom<File[]>().optional(),
});

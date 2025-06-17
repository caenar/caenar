import { z } from "zod";

export const addProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  desc: z.string().min(1, "Description is required"),
});

export const editProjectSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
  title: z.string().optional(),
  desc: z.string().optional(),
});

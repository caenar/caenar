import { z } from "zod";
import { ProjectLayoutSchema } from "./project-layout.schema";

const layoutJsonSchema = z.string().superRefine((value, ctx) => {
  if (!value.trim()) return;

  try {
    const parsed = JSON.parse(value);
    ProjectLayoutSchema.parse(parsed);
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid layout JSON structure",
    });
  }
});

export const addProjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  desc: z.string().trim().min(1, "Description is required"),
});

export const editProjectSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
  title: z.string().trim().min(1, "Title is required"),
  desc: z.string().trim().min(1, "Description is required"),
  layout: layoutJsonSchema,
});

import { z } from "zod";
import { ProjectLayoutSchema } from "./project-layout.schema";

export const addProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  desc: z.string().min(1, "Description is required"),
  layout: z.string().refine(
    (value) => {
      try {
        const parsed = JSON.parse(value);
        ProjectLayoutSchema.parse(parsed);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid layout JSON structure" },
  ),
});

export const editProjectSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
  title: z.string().optional(),
  desc: z.string().optional(),
  layout: z.string().refine(
    (value) => {
      try {
        const parsed = JSON.parse(value);
        ProjectLayoutSchema.parse(parsed);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid layout JSON structure" },
  ),
});

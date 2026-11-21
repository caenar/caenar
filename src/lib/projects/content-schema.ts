import { z } from "zod";
import { ProjectLayoutSchema } from "@/lib/schemas/project-layout.schema";

export const PROJECT_CONTENT_SCHEMA_VERSION = 1 as const;
export const PROJECT_CONTENT_DIRECTORY = "public/projects/v1" as const;
export const PROJECT_CONTENT_FILE = `${PROJECT_CONTENT_DIRECTORY}/projects.json` as const;
export const PROJECT_CONTENT_PUBLIC_ROOT = "/projects/v1" as const;
export const PROJECT_ASSET_PUBLIC_ROOT = `${PROJECT_CONTENT_PUBLIC_ROOT}/assets` as const;
export const PROJECT_ASSET_REPOSITORY_ROOT = "public/projects/v1/assets" as const;

export const ProjectImageRoleSchema = z.enum(["cover", "gallery"]);

export const StaticProjectImageSchema = z
  .object({
    id: z.string().min(1),
    path: z
      .string()
      .min(1)
      .startsWith("assets/")
      .refine(
        (path) =>
          !path.includes("\\") &&
          path.split("/").every((segment) => segment && segment !== "." && segment !== ".."),
        "Asset path must not contain traversal segments",
      ),
    image_url: z.string().min(1).startsWith(`${PROJECT_ASSET_PUBLIC_ROOT}/`),
    alt: z.string().nullable(),
    role: ProjectImageRoleSchema,
    order: z.number().int().nonnegative(),
  })
  .strict()
  .refine(
    (image) => image.image_url === `${PROJECT_CONTENT_PUBLIC_ROOT}/${image.path}`,
    "Image URL must match the versioned asset path",
  );

export const StaticTagSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
  })
  .strict();

export const StaticProjectSchema = z
  .object({
    id: z.string().min(1),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and URL-safe"),
    title: z.string().min(1),
    desc: z.string(),
    is_archived: z.boolean().default(false),
    created_at: z.string().datetime({ offset: true }),
    order: z.number().int().optional(),
    live_link: z.string().url().optional(),
    code_link: z.string().url().optional(),
    figma_link: z.string().url().optional(),
    industry: z.string().optional(),
    year: z.number().int().min(1900).max(2200).optional(),
    layout: ProjectLayoutSchema.default([]),
    project_image: z.array(StaticProjectImageSchema),
    tags: z.array(StaticTagSchema),
  })
  .strict();

export const ProjectContentSchema = z
  .object({
    schema_version: z.literal(PROJECT_CONTENT_SCHEMA_VERSION),
    generated_at: z.string().datetime({ offset: true }),
    projects: z.array(StaticProjectSchema),
  })
  .strict()
  .superRefine((content, ctx) => {
    const projectIds = new Set<string>();
    const projectSlugs = new Set<string>();
    const assetPaths = new Set<string>();

    content.projects.forEach((project, projectIndex) => {
      if (projectIds.has(project.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate project id: ${project.id}`,
          path: ["projects", projectIndex, "id"],
        });
      }
      projectIds.add(project.id);

      if (projectSlugs.has(project.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate project slug: ${project.slug}`,
          path: ["projects", projectIndex, "slug"],
        });
      }
      projectSlugs.add(project.slug);

      const imageIds = new Set<string>();
      const imageOrders = new Set<number>();
      let coverCount = 0;

      project.project_image.forEach((image, imageIndex) => {
        if (!image.path.startsWith(`assets/${project.slug}/`)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Image asset must belong to project slug ${project.slug}`,
            path: ["projects", projectIndex, "project_image", imageIndex, "path"],
          });
        }

        if (imageIds.has(image.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate image id: ${image.id}`,
            path: ["projects", projectIndex, "project_image", imageIndex, "id"],
          });
        }
        imageIds.add(image.id);

        if (imageOrders.has(image.order)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate image order: ${image.order}`,
            path: ["projects", projectIndex, "project_image", imageIndex, "order"],
          });
        }
        imageOrders.add(image.order);

        if (assetPaths.has(image.path)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate asset path: ${image.path}`,
            path: ["projects", projectIndex, "project_image", imageIndex, "path"],
          });
        }
        assetPaths.add(image.path);

        if (image.role === "cover") coverCount += 1;
      });

      if (project.project_image.length > 0 && coverCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A project with images must have exactly one cover image",
          path: ["projects", projectIndex, "project_image"],
        });
      }

      const tagIds = new Set<string>();
      const tagNames = new Set<string>();
      project.tags.forEach((tag, tagIndex) => {
        if (tagIds.has(tag.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate tag id: ${tag.id}`,
            path: ["projects", projectIndex, "tags", tagIndex, "id"],
          });
        }
        if (tagNames.has(tag.name.toLowerCase())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate tag name: ${tag.name}`,
            path: ["projects", projectIndex, "tags", tagIndex, "name"],
          });
        }
        tagIds.add(tag.id);
        tagNames.add(tag.name.toLowerCase());
      });

      validateLayoutImageReferences(
        project.layout,
        imageOrders,
        ctx,
        ["projects", projectIndex, "layout"],
      );
    });
  });

function validateLayoutImageReferences(
  blocks: unknown[],
  imageOrders: Set<number>,
  ctx: z.RefinementCtx,
  path: (string | number)[],
) {
  blocks.forEach((block, blockIndex) => {
    if (!block || typeof block !== "object") return;

    const value = block as Record<string, unknown>;
    const blockPath = [...path, blockIndex];

    if (value.type === "gallery" && Array.isArray(value.items)) {
      value.items.forEach((item, itemIndex) => {
        if (!item || typeof item !== "object") return;
        const index = (item as Record<string, unknown>).index;
        if (typeof index === "number" && !imageOrders.has(index)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Gallery item references missing image order ${index}`,
            path: [...blockPath, "items", itemIndex, "index"],
          });
        }
      });
    }

    if (value.type === "image" && typeof value.order === "number") {
      if (!imageOrders.has(value.order)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Image block references missing image order ${value.order}`,
          path: [...blockPath, "order"],
        });
      }
    }

    if (Array.isArray(value.items)) {
      validateLayoutImageReferences(value.items, imageOrders, ctx, [...blockPath, "items"]);
    }
  });
}

export type StaticProject = z.infer<typeof StaticProjectSchema>;
export type StaticProjectImage = z.infer<typeof StaticProjectImageSchema>;
export type StaticTag = z.infer<typeof StaticTagSchema>;
export type ProjectContent = z.infer<typeof ProjectContentSchema>;

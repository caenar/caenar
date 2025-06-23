import { z } from "zod";
import { LayoutBlock, LayoutGroup } from "../types/project-layout";

// Block types
const TextBlockSchema = z.object({
  type: z.literal("text"),
  content: z.string(),
});

const ImageBlockSchema = z.object({
  type: z.literal("image"),
  from: z.string(),
  order: z.number(),
});

const LinkBlockSchema = z.object({
  type: z.literal("link"),
  href: z.string().url(),
  label: z.string(),
});

const HeadingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  content: z.string(),
});

const IconBlockSchema = z.object({
  type: z.literal("icon"),
  name: z.string(),
  size: z.number().optional(),
});

const IconLabelBlockSchema = z.object({
  type: z.literal("icon-label"),
  icon: z.string(),
  label: z.string(),
  href: z.string().url().optional(),
});

const LayoutGroupSchema: z.ZodType<LayoutGroup> = z.lazy(() =>
  z.object({
    type: z.union([
      z.literal("section"),
      z.literal("grid"),
      z.literal("stack"),
    ]),
    items: z.array(LayoutBlockSchema),
  }),
);

const LayoutBlockSchema: z.ZodType<LayoutBlock> = z.lazy(() =>
  z.union([
    TextBlockSchema,
    ImageBlockSchema,
    LinkBlockSchema,
    HeadingBlockSchema,
    IconBlockSchema,
    IconLabelBlockSchema,
    LayoutGroupSchema, // recursive
  ]),
);

export const ProjectLayoutSchema = z.array(LayoutBlockSchema);

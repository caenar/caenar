import { z } from "zod";
import { LayoutBlock } from "../types/project-layout";

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
  icon: z.string().optional(),
});

const HeadingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  content: z.string(),
  icon: z.string().optional(),
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

const BaseBlockSchema = z.discriminatedUnion("type", [
  TextBlockSchema,
  ImageBlockSchema,
  LinkBlockSchema,
  HeadingBlockSchema,
  IconBlockSchema,
  IconLabelBlockSchema,
]);

export const LayoutBlockSchema: z.ZodType<LayoutBlock> = z.lazy(() =>
  z.union([
    BaseBlockSchema,
    z.object({
      type: z.union([
        z.literal("grid"),
        z.literal("stack"),
        z.literal("section"),
      ]),
      items: z.array(LayoutBlockSchema),
    }),
  ]),
);

export const ProjectLayoutSchema = z.array(LayoutBlockSchema);

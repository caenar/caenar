import { z } from "zod";
import type { LayoutBlock } from "../types";

const IconOptionsSchema = z.object({
  name: z.string(),
  color: z.string(),
  size: z.number().optional(),
});

const GridOptionsSchema = z.object({
  columns: z.string().optional(),
  gap: z.string().optional(),
  align: z.enum(["start", "center", "end", "stretch"]).optional(),
});

const GalleryItemSchema = z.object({
  from: z.string(),
  alt: z.string(),
  desc: z.string().optional(),
});

const AccordionItemSchema = z.object({
  heading: z.object({
    content: z.string(),
    icon: IconOptionsSchema.optional(),
  }),
  body: z.object({
    content: z.string(),
  }),
});

const GalleryBlockSchema = z.object({
  type: z.literal("gallery"),
  style: z.enum(["default", "masonry", "featured"]),
  gridOptions: GridOptionsSchema.optional(),
  items: z.lazy(() => z.array(GalleryItemSchema)),
});

const AccordionBlockSchema = z.object({
  type: z.literal("accordion"),
  items: z.lazy(() => z.array(AccordionItemSchema)),
});

const SeparatorBlockSchema = z.object({
  type: z.literal("separator"),
  direction: z.enum(["x", "y"]),
  spacing: z.number().optional(),
});

const TextBlockSchema = z.object({
  type: z.literal("text"),
  content: z.string(),
  card: z.boolean().optional(),
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
  icon: IconOptionsSchema.optional(),
});

const HeadingLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

const HeadingBlockSchema = z.object({
  type: z.literal("heading"),
  level: HeadingLevelSchema,
  content: z.string(),
  icon: IconOptionsSchema.optional(),
});

const IconLabelBlockSchema = z.object({
  type: z.literal("icon-label"),
  icon: IconOptionsSchema,
  label: z.string(),
  href: z.string().url().optional(),
});

let LayoutBlockSchema: z.ZodType<LayoutBlock>;

const LayoutGroupSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("grid"),
    items: z.lazy(() => z.array(LayoutBlockSchema)),
    card: z.boolean().optional(),
    gridOptions: GridOptionsSchema.optional(),
    minHeight: z.string().optional(),
    minWidth: z.string().optional(),
  }),
  z.object({
    type: z.literal("stack"),
    items: z.lazy(() => z.array(LayoutBlockSchema)),
    card: z.boolean().optional(),
    minHeight: z.string().optional(),
    minWidth: z.string().optional(),
  }),
  z.object({
    type: z.literal("section"),
    items: z.lazy(() => z.array(LayoutBlockSchema)),
    card: z.boolean().optional(),
    minHeight: z.string().optional(),
    minWidth: z.string().optional(),
  }),
]);

const BaseBlockSchema = z.discriminatedUnion("type", [
  GalleryBlockSchema,
  AccordionBlockSchema,
  SeparatorBlockSchema,
  TextBlockSchema,
  ImageBlockSchema,
  LinkBlockSchema,
  IconLabelBlockSchema,
  HeadingBlockSchema,
]);

LayoutBlockSchema = z.lazy(() => z.union([BaseBlockSchema, LayoutGroupSchema]));

export { LayoutBlockSchema };

export const ProjectLayoutSchema = z.array(LayoutBlockSchema);

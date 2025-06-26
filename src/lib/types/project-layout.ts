export type LayoutType = "section" | "grid" | "stack";

export type ProjectLayout = LayoutBlock[];

export type GridOptions = {
  columns?: string;
  gap?: string;
  align?: "start" | "center" | "end" | "stretch";
};

export type IconOptions = {
  name: string;
  color: string;
  size?: number;
};

export type LayoutGroup = {
  type: LayoutType;
  items: LayoutBlock[];
  card?: boolean;
  gridOptions?: GridOptions;
  minHeight?: string;
  minWidth?: string;
};

export type GalleryItem = {
  from: string;
  alt: string;
  desc?: string;
};

export type AccordionItem = {
  heading: {
    content: string;
    icon?: IconOptions;
  };
  body: {
    content: string;
  };
};

export type LayoutBlock =
  | LayoutGroup
  | GalleryBlock
  | AccordionBlock
  | SeparatorBlock
  | HeadingBlock
  | IconLabelBlock
  | TextBlock
  | ImageBlock
  | LinkBlock;

export type GalleryBlock = {
  type: "gallery";
  style: "default" | "masonry" | "featured";
  gridOptions?: GridOptions;
  items: GalleryItem[];
};

export type AccordionBlock = {
  type: "accordion";
  items: AccordionItem[];
};

export type SeparatorBlock = {
  type: "separator";
  direction: "x" | "y";
  spacing?: number;
};

export type TextBlock = {
  type: "text";
  content: string;
};

export type ImageBlock = {
  type: "image";
  from: string;
  order: number;
};

export type LinkBlock = {
  type: "link";
  href: string;
  label: string;
  icon?: IconOptions;
};

export type HeadingBlock = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
  icon?: IconOptions;
};

export type IconLabelBlock = {
  type: "icon-label";
  icon: IconOptions;
  label: string;
  href?: string;
};

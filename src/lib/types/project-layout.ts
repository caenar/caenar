export type LayoutType = "section" | "grid" | "stack";

export type ProjectLayout = LayoutBlock[];

export type LayoutGroup = {
  type: LayoutType;
  items: LayoutBlock[];
};

export type LayoutBlock =
  | LayoutGroup
  | HeadingBlock
  | IconBlock
  | IconLabelBlock
  | TextBlock
  | ImageBlock
  | LinkBlock;

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
  icon?: string;
};

export type HeadingBlock = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5;
  content: string;
  icon?: string;
};

export type IconBlock = {
  type: "icon";
  name: string;
  size?: number;
};

export type IconLabelBlock = {
  type: "icon-label";
  icon: string;
  label: string;
  href?: string;
};

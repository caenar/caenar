export type LayoutType = "section" | "grid" | "stack";

export type ProjectLayout = {
  type: LayoutType;
  items: LayoutBlock[];
};

export type LayoutBlock = TextBlock | ImageBlock | LinkBlock | ProjectLayout;

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
};

type ProjectLayout = {
  type: "section" | "grid" | "stack";
  items: LayoutBlock[];
};

type LayoutBlock =
  | { type: "text"; content: string }
  | { type: "image"; from: string; order: number }
  | { type: "link"; href: string; label: string }
  | ProjectLayout;

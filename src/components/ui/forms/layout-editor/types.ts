import type { LayoutBlock, ProjectLayout } from "@/lib/types/project-layout";

export type EditorImage = {
  id: string;
  image_url: string;
  order: number;
  alt?: string | null;
  label: string;
};

export type BlockPath = number[];
export type EditorBlock = LayoutBlock & { __id: string };

export type LayoutEditorProps = {
  value: ProjectLayout;
  onChange: (next: ProjectLayout) => void;
  images: EditorImage[];
  onUploadFiles?: (files: File[]) => void;
  onRemoveImage?: (id: string) => void;
  onSetCover?: (id: string) => void;
};

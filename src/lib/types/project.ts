import { ProjectImage } from "./project-image";
import { ProjectLayout } from "./project-layout";
import { Tag } from "./tag";

export type Project = {
  id: string;
  slug: string;
  title: string;
  desc: string;
  is_archived: boolean;
  created_at: string;
  order?: number;
  live_link?: string | undefined;
  code_link?: string | undefined;
  figma_link?: string | undefined;
  layout?: ProjectLayout | undefined;
  project_image: ProjectImage[];
  tags: Tag[];
};

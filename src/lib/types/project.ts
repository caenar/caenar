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
  live_link?: string;
  code_link?: string;
  figma_link?: string;
  industry?: string;
  year?: number;
  layout?: ProjectLayout;
  project_image: ProjectImage[];
  tags: Tag[];
};

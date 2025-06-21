import { ProjectImage } from "./project-image";
import { Tag } from "./tag";

export type Project = {
  id: string;
  slug: string;
  title: string;
  desc: string;
  live_link?: string;
  code_link?: string;
  figma_link?: string;
  order: number;
  is_archived: boolean;
  layout?: ProjectLayout;
  project_image: ProjectImage[];
  tags: Tag[];
};

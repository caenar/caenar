import { ProjectImage } from "./project-image";
import { Tag } from "./tag";

export type Project = {
  title: string;
  desc: string;
  project_image: ProjectImage[];
  tags: Tag[];
};

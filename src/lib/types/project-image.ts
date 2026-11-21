export type ProjectImageRole = "cover" | "gallery";

export type ProjectImage = {
  id: string;
  path: string;
  image_url: string;
  alt: string | null;
  role: ProjectImageRole;
  order: number;
};

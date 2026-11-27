import { existsSync } from "node:fs";
import { join } from "node:path";

import rawProjectContent from "../../../public/projects/v1/projects.json";
import { isRemoteAssetUrl } from "./asset-url";
import {
  PROJECT_CONTENT_DIRECTORY,
  ProjectContentSchema,
  type ProjectContent,
  type StaticProject,
} from "./content-schema";

const parsedProjectContent = ProjectContentSchema.parse(rawProjectContent);

function validateBundledAssets(content: ProjectContent) {
  for (const project of content.projects) {
    for (const image of project.project_image) {
      if (isRemoteAssetUrl(image.image_url)) continue;

      const assetPath = join(
        process.cwd(),
        PROJECT_CONTENT_DIRECTORY,
        image.path,
      );

      if (!existsSync(assetPath)) {
        throw new Error(
          `Project ${project.slug} references a missing bundled asset: ${image.path}`,
        );
      }
    }
  }
}

validateBundledAssets(parsedProjectContent);

function sortProjects(projects: StaticProject[]) {
  return [...projects].sort((a, b) => {
    const orderDifference = (a.order ?? Number.MAX_SAFE_INTEGER) -
      (b.order ?? Number.MAX_SAFE_INTEGER);

    if (orderDifference !== 0) return orderDifference;

    const dateDifference =
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (dateDifference !== 0) return dateDifference;

    return a.slug.localeCompare(b.slug);
  });
}

export function getProjectContent(): ProjectContent {
  return parsedProjectContent;
}

export function getPublicProjects(): StaticProject[] {
  return sortProjects(
    parsedProjectContent.projects.filter((project) => !project.is_archived),
  );
}

export function getPublicProjectBySlug(slug: string): StaticProject | undefined {
  return getPublicProjects().find((project) => project.slug === slug);
}

export function getPublicProjectSlugs(): { slug: string }[] {
  return getPublicProjects().map((project) => ({ slug: project.slug }));
}

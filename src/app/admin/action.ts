"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isR2Configured, isRemoteAssetUrl } from "@/lib/projects/asset-url";
import {
  ProjectContentSchema,
  type ProjectContent,
  type StaticProject,
  type StaticProjectImage,
  type StaticTag,
} from "@/lib/projects/content-schema";
import {
  fetchPublishedProjectContent,
  ProjectPublishError,
  publishProjectContent,
  triggerVercelDeploy,
} from "@/lib/projects/github-publisher";
import { deleteAssetFromR2, uploadAssetToR2 } from "@/lib/projects/r2-storage";
import { addProjectSchema, editProjectSchema } from "@/lib/schemas/project.schema";
import type { ErrorType, LayoutBlock, ProjectLayout } from "@/lib/types";
import { fail, ok, type Result } from "@/lib/utils/result";
import { slugify } from "@/lib/utils/slugify";

const PROJECT_CONTENT_PUBLIC_PREFIX = "/projects/v1/";

async function requireAdmin(): Promise<
  Result<never, ErrorType, string> | null
> {
  if (!(await isAdminAuthenticated())) {
    return fail("unauthorized", "Unauthorized");
  }
  return null;
}

async function getPublishedContent() {
  return fetchPublishedProjectContent();
}

function normalizeTagNames(names: string[]) {
  return [...new Set(names.map((name) => name.trim().toLowerCase()).filter(Boolean))];
}

function mergeTags(existingTags: StaticTag[], names: string[]): StaticTag[] {
  const normalizedNames = normalizeTagNames(names);

  return normalizedNames.map((name) => {
    const existing = existingTags.find(
      (tag) => tag.name.trim().toLowerCase() === name,
    );
    return existing ?? { id: slugify(name) || name, name };
  });
}

function uniqueSlug(title: string, projects: StaticProject[]) {
  const base = slugify(title) || "project";
  const slugs = new Set(projects.map((project) => project.slug));
  let slug = base;
  let suffix = 2;

  while (slugs.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function safeFileName(name: string) {
  const normalized = name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .toLowerCase();

  return normalized || `asset-${randomUUID()}`;
}

function imageFiles(formData: FormData) {
  return formData
    .getAll("images")
    .filter(
      (value): value is File =>
        typeof value !== "string" &&
        value !== null &&
        typeof value.arrayBuffer === "function",
    )
    .filter((file) => file.size > 0);
}

function isSupportedImage(file: File) {
  return /\.(avif|gif|jpe?g|png|webp)$/i.test(file.name);
}

function parseLayout(value: FormDataEntryValue | null): ProjectLayout {
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as ProjectLayout) : [];
  } catch {
    return [];
  }
}

function remapLayoutImageReferences(
  layout: ProjectLayout,
  orderMap: Map<number, number>,
  preservedOrders: Set<number>,
): ProjectLayout {
  function remapBlock(block: LayoutBlock): LayoutBlock | null {
    if (block.type === "section" || block.type === "grid" || block.type === "stack") {
      const items = block.items.flatMap((child) => {
        const remapped = remapBlock(child);
        return remapped ? [remapped] : [];
      });
      return { ...block, items };
    }

    if (block.type === "gallery") {
      const items = block.items.flatMap((item) => {
        const nextOrder = orderMap.get(item.index);
        if (nextOrder !== undefined) return [{ ...item, index: nextOrder }];
        return preservedOrders.has(item.index) ? [item] : [];
      });
      return { ...block, items };
    }

    if (block.type === "image") {
      const nextOrder = orderMap.get(block.order);
      if (nextOrder !== undefined) return { ...block, order: nextOrder };
      return preservedOrders.has(block.order) ? block : null;
    }

    return block;
  }

  return layout.flatMap((block) => {
    const remapped = remapBlock(block);
    return remapped ? [remapped] : [];
  });
}

function appendNewImagesToLayout(
  layout: ProjectLayout,
  images: StaticProjectImage[],
): ProjectLayout {
  if (images.length === 0) return layout;

  const referencedOrders = new Set<number>();
  function collect(blocks: ProjectLayout) {
    for (const block of blocks) {
      if (block.type === "gallery") {
        block.items.forEach((item) => referencedOrders.add(item.index));
      } else if (block.type === "image") {
        referencedOrders.add(block.order);
      } else if (
        block.type === "section" ||
        block.type === "grid" ||
        block.type === "stack"
      ) {
        collect(block.items);
      }
    }
  }
  collect(layout);

  const unreferenced = images.filter(
    (image) => !referencedOrders.has(image.order),
  );
  if (unreferenced.length === 0) return layout;

  const newItems = unreferenced.map((image) => ({
    index: image.order,
    alt: image.alt ?? "Project image",
  }));

  function appendToGallery(blocks: ProjectLayout): boolean {
    for (const block of blocks) {
      if (block.type === "gallery") {
        block.items.push(...newItems);
        return true;
      }

      if (
        (block.type === "section" ||
          block.type === "grid" ||
          block.type === "stack") &&
        appendToGallery(block.items)
      ) {
        return true;
      }
    }
    return false;
  }

  if (!appendToGallery(layout)) {
    layout.push({ type: "gallery", style: "default", items: newItems });
  }

  return layout;
}

function isRenderableImage(filename: string) {
  return /\.(avif|gif|jpe?g|png|webp)$/i.test(filename);
}

function defaultLayout(
  project: Pick<StaticProject, "title" | "desc">,
  images: StaticProjectImage[],
): ProjectLayout {
  return [
    {
      type: "text",
      content: project.desc,
    },
    {
      type: "gallery",
      style: "default",
      items: images
        .filter((image) => isRenderableImage(image.path))
        .map((image) => ({
          index: image.order,
          alt: image.alt ?? `${project.title} project image`,
        })),
    },
  ];
}

function normalizeImageRoles(images: StaticProjectImage[]) {
  return images.map((image, index) => ({
    ...image,
    order: index,
    role: index === 0 ? ("cover" as const) : ("gallery" as const),
  }));
}

async function createAsset(
  projectSlug: string,
  file: File,
  order: number,
): Promise<{
  image: StaticProjectImage;
  gitAsset?: { path: string; content: Uint8Array };
}> {
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeFileName(
    file.name,
  )}`;
  const relativePath = `assets/${projectSlug}/${filename}`;
  const content = new Uint8Array(await file.arrayBuffer());

  if (isR2Configured()) {
    const imageUrl = await uploadAssetToR2(
      relativePath,
      content,
      file.type || "application/octet-stream",
    );

    return {
      image: {
        id: randomUUID(),
        path: relativePath,
        image_url: imageUrl,
        alt: null,
        role: order === 0 ? "cover" : "gallery",
        order,
      },
    };
  }

  return {
    image: {
      id: randomUUID(),
      path: relativePath,
      image_url: `${PROJECT_CONTENT_PUBLIC_PREFIX}${relativePath}`,
      alt: null,
      role: order === 0 ? "cover" : "gallery",
      order,
    },
    gitAsset: {
      path: `public/projects/v1/${relativePath}`,
      content,
    },
  };
}

function withUpdatedTimestamp(content: ProjectContent): ProjectContent {
  return {
    ...content,
    generated_at: new Date().toISOString(),
  };
}

async function publish(
  content: ProjectContent,
  assets: { path: string; content: Uint8Array }[],
  deletedAssetPaths: string[],
  message: string,
  expectedCommitSha: string,
) {
  const validatedContent = ProjectContentSchema.parse(content);
  const commitSha = await publishProjectContent({
    content: validatedContent,
    assets,
    deletedAssetPaths,
    message,
    expectedCommitSha,
  });
  const deploy = await triggerVercelDeploy();

  revalidatePath("/admin", "page");

  return {
    commitSha,
    warning: deploy.warning,
  };
}

function publicationFailure(
  error: unknown,
  fallbackMessage: string,
): Result<never, ErrorType, string> {
  if (error instanceof ProjectPublishError && error.status === 409) {
    return fail(
      "conflict",
      "Published content changed while this edit was open. Reload and try again.",
    );
  }

  if (error instanceof ProjectPublishError && error.status === 404) {
    return fail(
      "server",
      "Published project content is missing from the configured GitHub branch.",
    );
  }

  if (error instanceof ProjectPublishError && error.status === 422) {
    return fail("validation", error.message);
  }

  if (error instanceof ProjectPublishError && !error.status) {
    return fail("server", error.message);
  }

  return fail("server", fallbackMessage);
}

export async function fetchAdminProjects(): Promise<
  Result<StaticProject[], ErrorType, string>
> {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const snapshot = await getPublishedContent();
    return ok(snapshot.content.projects);
  } catch (error) {
    console.error("Failed to fetch admin projects:", error);
    if (
      error instanceof ProjectPublishError &&
      (error.status === 404 || !error.status)
    ) {
      return fail("server", error.message);
    }
    return fail("server", "Failed to load published projects");
  }
}

export async function addProject(
  formData: FormData,
): Promise<Result<string, ErrorType, string>> {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const parsed = addProjectSchema.safeParse({
      title: formData.get("title")?.toString() ?? "",
      desc: formData.get("desc")?.toString() ?? "",
    });
    if (!parsed.success) {
      return fail(
        "validation",
        parsed.error.issues[0]?.message ?? "Invalid project data",
      );
    }

    const files = imageFiles(formData);
    if (files.some((file) => !isSupportedImage(file))) {
      return fail("validation", "Only PNG, JPEG, GIF, AVIF, and WebP images are supported");
    }
    if (files.length === 0) {
      return fail("validation", "At least one image is required");
    }

    const snapshot = await getPublishedContent();
    const content = snapshot.content;
    const slug = uniqueSlug(parsed.data.title, content.projects);
    const uploaded = [];
    for (let index = 0; index < files.length; index += 1) {
      uploaded.push(await createAsset(slug, files[index], index));
    }

    const images = normalizeImageRoles(uploaded.map((asset) => asset.image));
    const tags = mergeTags(
      content.projects.flatMap((item) => item.tags),
      formData.getAll("tags").map(String),
    );
    const submittedLayout = parseLayout(formData.get("layout"));
    const layout =
      submittedLayout.length > 0
        ? appendNewImagesToLayout(submittedLayout, images)
        : defaultLayout(parsed.data, images);
    const project: StaticProject = {
      id: randomUUID(),
      slug,
      title: parsed.data.title,
      desc: parsed.data.desc,
      is_archived: false,
      created_at: new Date().toISOString(),
      order:
        content.projects.length === 0
          ? 0
          : Math.max(...content.projects.map((item) => item.order ?? -1)) + 1,
      layout,
      project_image: images,
      tags,
    };

    const nextContent = withUpdatedTimestamp({
      ...content,
      projects: [...content.projects, project],
    });

    const result = await publish(
      nextContent,
      uploaded.flatMap((asset) => (asset.gitAsset ? [asset.gitAsset] : [])),
      [],
      `content: add project ${slug}`,
      snapshot.commitSha,
    );

    return ok(
      `Added project "${project.title}" (${result.commitSha.slice(0, 7)})${
        result.warning ? ` — ${result.warning}` : ""
      }`,
    );
  } catch (error) {
    console.error("Project creation error:", error);
    return publicationFailure(error, "Failed to publish project");
  }
}

export async function editProject(
  formData: FormData,
): Promise<Result<string, ErrorType, string>> {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const parsed = editProjectSchema.safeParse({
      id: formData.get("projectId")?.toString() ?? "",
      title: formData.get("title")?.toString() ?? "",
      desc: formData.get("desc")?.toString() ?? "",
      layout: formData.get("layout")?.toString() ?? "",
    });
    if (!parsed.success) {
      return fail(
        "validation",
        parsed.error.issues[0]?.message ?? "Invalid project data",
      );
    }

    const snapshot = await getPublishedContent();
    const content = snapshot.content;
    const projectIndex = content.projects.findIndex(
      (project) => project.id === parsed.data.id,
    );
    if (projectIndex === -1) {
      return fail("not_found", "Project not found");
    }

    const currentProject = content.projects[projectIndex];
    const orderedExistingIds = formData.getAll("existingImages").map(String);
    const uniqueExistingIds = [...new Set(orderedExistingIds)];
    const currentImages = new Map(
      currentProject.project_image.map((image) => [image.id, image]),
    );

    if (
      uniqueExistingIds.length !== orderedExistingIds.length ||
      uniqueExistingIds.some((id) => !currentImages.has(id))
    ) {
      return fail("validation", "Invalid existing image selection");
    }

    const retainedImages = uniqueExistingIds.map((id) => currentImages.get(id)!);
    const removedImages = currentProject.project_image.filter(
      (image) => !uniqueExistingIds.includes(image.id),
    );
    const files = imageFiles(formData);
    if (files.some((file) => !isSupportedImage(file))) {
      return fail("validation", "Only PNG, JPEG, GIF, AVIF, and WebP images are supported");
    }
    const uploaded = [];
    for (let index = 0; index < files.length; index += 1) {
      uploaded.push(
        await createAsset(currentProject.slug, files[index], retainedImages.length + index),
      );
    }

    const orderMap = new Map(
      retainedImages.map((image, index) => [image.order, index]),
    );
    const uploadedImages = uploaded.map((asset) => asset.image);
    const preservedOrders = new Set(
      uploadedImages.map((image) => image.order),
    );
    const remappedLayout = remapLayoutImageReferences(
      parseLayout(parsed.data.layout),
      orderMap,
      preservedOrders,
    );
    const images = normalizeImageRoles([
      ...retainedImages,
      ...uploadedImages,
    ]);
    const updatedProject: StaticProject = {
      ...currentProject,
      title: parsed.data.title,
      desc: parsed.data.desc,
      layout: appendNewImagesToLayout(remappedLayout, uploadedImages),
      project_image: images,
      tags: mergeTags(
        content.projects.flatMap((item) => item.tags),
        formData.getAll("tags").map(String),
      ),
    };

    const nextProjects = [...content.projects];
    nextProjects[projectIndex] = updatedProject;
    const nextContent = withUpdatedTimestamp({
      ...content,
      projects: nextProjects,
    });

    for (const image of removedImages) {
      if (isRemoteAssetUrl(image.image_url)) {
        await deleteAssetFromR2(image.path);
      }
    }

    const result = await publish(
      nextContent,
      uploaded.flatMap((asset) => (asset.gitAsset ? [asset.gitAsset] : [])),
      removedImages
        .filter((image) => !isRemoteAssetUrl(image.image_url))
        .map((image) => `public/projects/v1/${image.path}`),
      `content: update project ${currentProject.slug}`,
      snapshot.commitSha,
    );

    return ok(
      `Updated project "${updatedProject.title}" (${result.commitSha.slice(
        0,
        7,
      )})${result.warning ? ` — ${result.warning}` : ""}`,
    );
  } catch (error) {
    console.error("Project update error:", error);
    return publicationFailure(error, "Failed to publish project changes");
  }
}

export async function deleteProject(
  projectId: string,
): Promise<Result<string, ErrorType, string>> {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const snapshot = await getPublishedContent();
    const content = snapshot.content;
    const project = content.projects.find((item) => item.id === projectId);
    if (!project) {
      return fail("not_found", "Project not found");
    }

    const referencedPaths = new Set(
      content.projects
        .filter((item) => item.id !== projectId)
        .flatMap((item) => item.project_image.map((image) => image.path)),
    );
    const removedImages = project.project_image.filter(
      (image) => !referencedPaths.has(image.path),
    );

    for (const image of removedImages) {
      if (isRemoteAssetUrl(image.image_url)) {
        await deleteAssetFromR2(image.path);
      }
    }

    const deletedAssetPaths = removedImages
      .filter((image) => !isRemoteAssetUrl(image.image_url))
      .map((image) => `public/projects/v1/${image.path}`);

    const nextContent = withUpdatedTimestamp({
      ...content,
      projects: content.projects.filter((item) => item.id !== projectId),
    });

    const result = await publish(
      nextContent,
      [],
      deletedAssetPaths,
      `content: delete project ${project.slug}`,
      snapshot.commitSha,
    );

    return ok(
      `Deleted project "${project.title}" (${result.commitSha.slice(
        0,
        7,
      )})${result.warning ? ` — ${result.warning}` : ""}`,
    );
  } catch (error) {
    console.error("Project deletion error:", error);
    return publicationFailure(error, "Failed to delete project");
  }
}

import { Buffer } from "node:buffer";

import {
  PROJECT_ASSET_REPOSITORY_ROOT,
  PROJECT_CONTENT_DIRECTORY,
  PROJECT_CONTENT_FILE,
  ProjectContentSchema,
  type ProjectContent,
} from "./content-schema";

const DEFAULT_OWNER = "caenar";
const DEFAULT_REPOSITORY = "caenar";
const DEFAULT_BRANCH = "master";
const GITHUB_API_BASE = "https://api.github.com";

type GithubRepositoryConfig = {
  owner: string;
  repository: string;
  branch: string;
  token: string;
};

type GithubFileContent = {
  path: string;
  content: Uint8Array;
};

type GithubTreeEntry = {
  path: string;
  mode: "100644";
  type: "blob";
  sha: string | null;
};

type GithubTreeResponse = {
  tree: { path: string; type: string }[];
  truncated?: boolean;
};

export type PublishedProjectContent = {
  content: ProjectContent;
  commitSha: string;
  contentSha: string;
};

export class ProjectPublishError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ProjectPublishError";
  }
}

function getRepositoryConfig(): GithubRepositoryConfig {
  const [defaultOwner, defaultRepository] = (
    process.env.GITHUB_REPOSITORY ?? `${DEFAULT_OWNER}/${DEFAULT_REPOSITORY}`
  ).split("/");

  const owner = process.env.GITHUB_OWNER?.trim() || defaultOwner;
  const repository =
    process.env.GITHUB_REPO?.trim() || defaultRepository || DEFAULT_REPOSITORY;
  const branch = process.env.GITHUB_BRANCH?.trim() || DEFAULT_BRANCH;
  const token = process.env.GITHUB_TOKEN?.trim() || "";

  if (!owner || !repository || !branch) {
    throw new ProjectPublishError("GitHub repository configuration is incomplete");
  }

  return { owner, repository, branch, token };
}

export function isGithubPublishingConfigured() {
  return Boolean(process.env.GITHUB_TOKEN?.trim());
}

function encodeRepositoryPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function githubRequest<T>(
  config: GithubRepositoryConfig,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  headers.set("User-Agent", "caenar-project-publisher");

  if (config.token) {
    headers.set("Authorization", `Bearer ${config.token}`);
  }

  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `GitHub request failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // GitHub occasionally returns a non-JSON error body. Keep the safe status message.
    }
    throw new ProjectPublishError(message, response.status);
  }

  return (await response.json()) as T;
}

export async function fetchPublishedProjectContent(): Promise<PublishedProjectContent> {
  const config = getRepositoryConfig();
  const { commitSha } = await getBranchCommit(config);
  const path = `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
    config.repository,
  )}/contents/${encodeRepositoryPath(PROJECT_CONTENT_FILE)}?ref=${encodeURIComponent(
    commitSha,
  )}`;

  try {
    const response = await githubRequest<{
      content?: string;
      encoding?: string;
      sha?: string;
    }>(config, path);

    if (!response.content || response.encoding !== "base64") {
      throw new ProjectPublishError(
        "The published project content response was not base64 encoded",
      );
    }

    const decoded = Buffer.from(response.content.replace(/\n/g, ""), "base64");
    const parsed = ProjectContentSchema.parse(
      JSON.parse(decoded.toString("utf8")) as unknown,
    );
    return {
      content: parsed,
      commitSha,
      contentSha: response.sha ?? "",
    };
  } catch (error) {
    if (error instanceof ProjectPublishError && error.status === 404) {
      throw new ProjectPublishError(
        `Published project content is missing from branch "${config.branch}". Push the static catalog before editing in admin.`,
        404,
      );
    }
    throw error;
  }
}

async function createBlob(
  config: GithubRepositoryConfig,
  content: Uint8Array,
): Promise<string> {
  const response = await githubRequest<{ sha: string }>(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
      config.repository,
    )}/git/blobs`,
    {
      method: "POST",
      body: JSON.stringify({
        content: Buffer.from(content).toString("base64"),
        encoding: "base64",
      }),
    },
  );

  return response.sha;
}

async function getBranchCommit(config: GithubRepositoryConfig) {
  const ref = await githubRequest<{ object: { sha: string } }>(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
      config.repository,
    )}/git/ref/heads/${encodeURIComponent(config.branch)}`,
  );
  const commit = await githubRequest<{ tree: { sha: string } }>(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
      config.repository,
    )}/git/commits/${ref.object.sha}`,
  );

  return { commitSha: ref.object.sha, baseTreeSha: commit.tree.sha };
}

async function getRepositoryBlobPaths(
  config: GithubRepositoryConfig,
  treeSha: string,
) {
  const response = await githubRequest<GithubTreeResponse>(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
      config.repository,
    )}/git/trees/${encodeURIComponent(treeSha)}?recursive=1`,
  );

  if (response.truncated) {
    throw new ProjectPublishError(
      "The GitHub repository tree is too large to verify project assets",
    );
  }

  return new Set(
    response.tree
      .filter((entry) => entry.type === "blob")
      .map((entry) => entry.path),
  );
}

function validateRepositoryAssetPath(path: string) {
  const prefix = `${PROJECT_ASSET_REPOSITORY_ROOT}/`;
  const segments = path.split("/");

  if (
    !path.startsWith(prefix) ||
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new ProjectPublishError(`Invalid project asset path: ${path}`);
  }
}

export async function publishProjectContent({
  content,
  assets,
  deletedAssetPaths = [],
  message,
  expectedCommitSha,
}: {
  content: ProjectContent;
  assets: GithubFileContent[];
  deletedAssetPaths?: string[];
  message: string;
  expectedCommitSha: string;
}) {
  if (!isGithubPublishingConfigured()) {
    throw new ProjectPublishError(
      "GITHUB_TOKEN is required to publish project content",
    );
  }

  if (!expectedCommitSha) {
    throw new ProjectPublishError(
      "The base commit is required to publish project content",
    );
  }

  const validatedContent = ProjectContentSchema.parse(content);
  const config = getRepositoryConfig();
  const assetPaths = new Set<string>();
  const deletedPaths = new Set<string>();

  for (const asset of assets) {
    validateRepositoryAssetPath(asset.path);
    if (asset.content.byteLength === 0) {
      throw new ProjectPublishError(`Project asset is empty: ${asset.path}`);
    }
    if (assetPaths.has(asset.path)) {
      throw new ProjectPublishError(`Duplicate project asset: ${asset.path}`);
    }
    assetPaths.add(asset.path);
  }

  for (const deletedPath of deletedAssetPaths) {
    validateRepositoryAssetPath(deletedPath);
    if (deletedPaths.has(deletedPath)) {
      throw new ProjectPublishError(`Duplicate deleted asset: ${deletedPath}`);
    }
    if (assetPaths.has(deletedPath)) {
      throw new ProjectPublishError(
        `Cannot upload and delete the same asset: ${deletedPath}`,
      );
    }
    deletedPaths.add(deletedPath);
  }

  const { commitSha, baseTreeSha } = await getBranchCommit(config);
  if (commitSha !== expectedCommitSha) {
    throw new ProjectPublishError(
      "Published project content changed while this edit was open. Reload and try again.",
      409,
    );
  }

  const existingPaths = await getRepositoryBlobPaths(config, baseTreeSha);
  const finalPaths = new Set(existingPaths);
  for (const assetPath of assetPaths) finalPaths.add(assetPath);
  for (const deletedPath of deletedPaths) finalPaths.delete(deletedPath);

  for (const project of validatedContent.projects) {
    for (const image of project.project_image) {
      const repositoryPath = `${PROJECT_CONTENT_DIRECTORY}/${image.path}`;
      if (deletedPaths.has(repositoryPath)) {
        throw new ProjectPublishError(
          `Published content still references a deleted asset: ${image.path}`,
          422,
        );
      }
      if (!finalPaths.has(repositoryPath)) {
        throw new ProjectPublishError(
          `Published content references a missing asset: ${image.path}. Push the asset before publishing the catalog.`,
          422,
        );
      }
    }
  }

  const contentBytes = Buffer.from(
    `${JSON.stringify(validatedContent, null, 2)}\n`,
    "utf8",
  );
  const contentBlobSha = await createBlob(config, contentBytes);

  const treeEntries: GithubTreeEntry[] = [
    {
      path: PROJECT_CONTENT_FILE,
      mode: "100644",
      type: "blob",
      sha: contentBlobSha,
    },
  ];

  for (const asset of assets) {
    const blobSha = await createBlob(config, asset.content);
    treeEntries.push({
      path: asset.path,
      mode: "100644",
      type: "blob",
      sha: blobSha,
    });
  }

  for (const deletedPath of deletedPaths) {
    if (!existingPaths.has(deletedPath)) continue;

    treeEntries.push({
      path: deletedPath,
      mode: "100644",
      type: "blob",
      sha: null,
    });
  }

  const tree = await githubRequest<{ sha: string }>(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
      config.repository,
    )}/git/trees`,
    {
      method: "POST",
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
    },
  );

  const commit = await githubRequest<{ sha: string }>(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
      config.repository,
    )}/git/commits`,
    {
      method: "POST",
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [commitSha],
      }),
    },
  );

  try {
    await githubRequest<{
      object: { sha: string };
    }>(
      config,
      `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
        config.repository,
      )}/git/refs/heads/${encodeURIComponent(config.branch)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      },
    );
  } catch (error) {
    if (
      error instanceof ProjectPublishError &&
      (error.status === 409 || error.status === 422)
    ) {
      throw new ProjectPublishError(
        "Published project content changed before the commit could be applied. Reload and try again.",
        409,
      );
    }
    throw error;
  }

  return commit.sha;
}

export async function triggerVercelDeploy() {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL?.trim();
  if (!hookUrl) return { triggered: false, warning: null };

  try {
    const response = await fetch(hookUrl, { method: "POST" });
    if (!response.ok) {
      return {
        triggered: false,
        warning: `Vercel deploy hook returned ${response.status}`,
      };
    }

    return { triggered: true, warning: null };
  } catch {
    return {
      triggered: false,
      warning: "Vercel deploy hook could not be reached",
    };
  }
}

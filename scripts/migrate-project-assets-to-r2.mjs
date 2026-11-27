import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const ROOT = process.cwd();
const PROJECTS_JSON = join(ROOT, "public/projects/v1/projects.json");
const PUBLIC_ROOT = join(ROOT, "public");

function env(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function contentTypeFor(file) {
  if (file.endsWith(".webp")) return "image/webp";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".gif")) return "image/gif";
  if (file.endsWith(".avif")) return "image/avif";
  if (file.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

async function existsInR2(client, bucket, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const baseUrl = env("NEXT_PUBLIC_ASSET_BASE_URL").replace(/\/+$/, "");
  const bucket = env("R2_BUCKET_NAME");
  const accountId = env("R2_ACCOUNT_ID");
  const accessKeyId = env("R2_ACCESS_KEY_ID");
  const secretAccessKey = env("R2_SECRET_ACCESS_KEY");

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const raw = JSON.parse(await readFile(PROJECTS_JSON, "utf8"));
  let uploaded = 0;
  let skipped = 0;
  let missing = 0;

  for (const project of raw.projects ?? []) {
    for (const image of project.project_image ?? []) {
      if (/^https?:\/\//i.test(image.image_url)) {
        skipped += 1;
        continue;
      }

      const localPath = join(PUBLIC_ROOT, "projects/v1", image.path);
      if (!existsSync(localPath)) {
        console.warn(`MISSING ${localPath}`);
        missing += 1;
        continue;
      }

      const key = `projects/v1/${image.path}`.replace(/^\/+/, "");
      const already = await existsInR2(client, bucket, key);
      if (!already) {
        const body = await readFile(localPath);
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentTypeFor(localPath),
            CacheControl: "public, max-age=31536000, immutable",
          }),
        );
        uploaded += 1;
        console.log(`UPLOADED ${key}`);
      } else {
        skipped += 1;
        console.log(`EXISTS   ${key}`);
      }

      image.image_url = `${baseUrl}/${key}`;
    }
  }

  raw.generated_at = new Date().toISOString();
  await writeFile(PROJECTS_JSON, JSON.stringify(raw, null, 2) + "\n");
  console.log(`\nDone. uploaded=${uploaded} skipped=${skipped} missing=${missing}`);
  console.log(`Updated ${PROJECTS_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

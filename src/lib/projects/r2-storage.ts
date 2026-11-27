import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getAssetBaseUrl, isR2Configured } from "./asset-url";

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials are not configured");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucketName() {
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  if (!bucket) throw new Error("R2_BUCKET_NAME is not configured");
  return bucket;
}

export function getR2ObjectKey(assetPath: string) {
  return `projects/v1/${assetPath}`.replace(/^\/+/, "");
}

export async function uploadAssetToR2(assetPath: string, content: Uint8Array, contentType: string) {
  if (!isR2Configured()) {
    throw new Error("R2 storage is not configured");
  }

  const client = getR2Client();
  const bucket = getBucketName();
  const key = getR2ObjectKey(assetPath);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: content,
      ContentType: contentType || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${getAssetBaseUrl()}/${key}`;
}

export async function deleteAssetFromR2(assetPath: string) {
  if (!isR2Configured()) return;

  const client = getR2Client();
  const bucket = getBucketName();
  const key = getR2ObjectKey(assetPath);

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

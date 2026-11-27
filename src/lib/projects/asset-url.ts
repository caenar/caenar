const ABSOLUTE_URL_RE = /^https?:\/\//i;

export function getAssetBaseUrl() {
  const base = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.trim();
  if (!base) return "";
  return base.replace(/\/+$/, "");
}

export function isRemoteAssetUrl(value: string) {
  return ABSOLUTE_URL_RE.test(value);
}

export function isR2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      process.env.R2_BUCKET_NAME?.trim() &&
      getAssetBaseUrl(),
  );
}

export function resolveAssetUrl(pathOrUrl: string) {
  if (!pathOrUrl) return pathOrUrl;
  if (isRemoteAssetUrl(pathOrUrl)) return pathOrUrl;

  const base = getAssetBaseUrl();
  if (!base) return pathOrUrl;

  const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${normalized}`;
}

export function buildProjectAssetUrl(assetPath: string) {
  const publicPath = assetPath.startsWith("/") ? assetPath : `/projects/v1/${assetPath}`;
  return resolveAssetUrl(publicPath);
}

export function getProjectAssetPublicPath(assetPath: string) {
  return assetPath.startsWith("/") ? assetPath : `/projects/v1/${assetPath}`;
}

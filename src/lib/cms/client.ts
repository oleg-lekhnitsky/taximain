import "server-only";
import { readPreview } from "./preview";
import { previewCollections } from "./preview-token";

export function cmsConfigured() {
  return Boolean(process.env.STRAPI_URL);
}

export function cmsMediaUrl(path: string) {
  const url = new URL(path, process.env.STRAPI_URL);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Invalid CMS media URL");
  return url.href;
}

async function fetchCollection<T>(
  collection: string,
  query: Record<string, string> = {},
  status: "published" | "draft" = "published",
): Promise<T[]> {
  const origin = process.env.STRAPI_URL;
  const token = process.env.STRAPI_API_TOKEN;
  if (!origin || !token)
    throw new Error("Set STRAPI_URL and STRAPI_API_TOKEN in .env.local");
  const results: T[] = [];
  for (let page = 1; ; page++) {
    const url = new URL(`/api/${collection}`, origin);
    url.search = new URLSearchParams({
      ...query,
      status,
      "pagination[pageSize]": "100",
      "pagination[page]": String(page),
    }).toString();
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      throw new Error(`Strapi ${collection} returned HTTP ${response.status}`);
    const json = await response.json();
    if (!Array.isArray(json.data))
      throw new Error(`Invalid Strapi ${collection} response`);
    results.push(...json.data);
    if (page >= (json.meta?.pagination?.pageCount ?? 1)) return results;
  }
}

export async function cmsCollection<T>(
  collection: string,
  query: Record<string, string> = {},
): Promise<T[]> {
  const published = await fetchCollection<T>(collection, query);
  const preview = await readPreview();
  if (!preview || previewCollections[preview.uid] !== collection)
    return published;
  const drafts = await fetchCollection<T>(
    collection,
    { ...query, "filters[documentId][$eq]": preview.documentId },
    "draft",
  );
  const draft = drafts[0];
  type Identity = {
    documentId?: string;
    country?: string;
    language?: string;
    storyId?: string;
  };
  return [
    ...published.filter((item) => {
      const record = item as Identity;
      if (record.documentId === preview.documentId) return false;
      if (
        record.country === preview.country &&
        record.language === preview.language
      ) {
        if (collection !== "news-stories") return false;
        if (draft && record.storyId === (draft as Identity).storyId)
          return false;
      }
      return true;
    }),
    ...drafts,
  ];
}

export async function previewRevision() {
  const preview = await readPreview();
  if (!preview) return null;
  const [record] = await fetchCollection<{ updatedAt: string }>(
    previewCollections[preview.uid],
    {
      "filters[documentId][$eq]": preview.documentId,
      "fields[0]": "updatedAt",
    },
    "draft",
  );
  return record
    ? { updatedAt: record.updatedAt, expiresAt: preview.expiresAt }
    : null;
}

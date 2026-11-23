import { createHmac, timingSafeEqual } from "node:crypto";
import { isCountryCode } from "../countries";
import { isCountryLanguage } from "../languages";

export const previewCollections = {
  "api::shared-setting.shared-setting": "shared-settings",
  "api::site-page.site-page": "site-pages",
  "api::news-story.news-story": "news-stories",
  "api::tariff-document.tariff-document": "tariff-documents",
} as const;
export type PreviewContext = {
  version: 1;
  uid: keyof typeof previewCollections;
  documentId: string;
  country: string;
  language: string;
  pathname: string;
  cmsOrigin: string;
  expiresAt: number;
  revision: string;
};
export function verifyPreviewToken(
  token: string,
  secret: string,
): PreviewContext | null {
  if (!secret || token.length > 4096) return null;
  const [data, signature, extra] = token.split(".");
  if (!data || !signature || extra) return null;
  const expected = createHmac("sha256", secret).update(data).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    return null;
  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString(),
    ) as PreviewContext;
    if (
      payload.version !== 1 ||
      typeof payload.revision !== "string" ||
      payload.revision.length > 100 ||
      !Object.hasOwn(previewCollections, payload.uid) ||
      typeof payload.documentId !== "string" ||
      !/^[a-zA-Z0-9_-]{1,100}$/.test(payload.documentId) ||
      !isCountryCode(payload.country) ||
      !isCountryLanguage(payload.country, payload.language) ||
      !Number.isFinite(payload.expiresAt) ||
      payload.expiresAt <= Date.now() ||
      payload.expiresAt > Date.now() + 31 * 60 * 1000
    )
      return null;
    const path = new URL(payload.pathname, "https://preview.invalid");
    if (
      path.origin !== "https://preview.invalid" ||
      !/^\/$|^\/tariffs$|^\/news\/[a-zA-Z0-9_%.-]+$/.test(path.pathname) ||
      path.searchParams.get("country") !== payload.country ||
      path.searchParams.get("lang") !== payload.language
    )
      return null;
    const origin = new URL(payload.cmsOrigin);
    if (
      !["http:", "https:"].includes(origin.protocol) ||
      origin.origin !== payload.cmsOrigin
    )
      return null;
    return payload;
  } catch {
    return null;
  }
}

import "server-only";
import { cache } from "react";
import { cookies, draftMode } from "next/headers";
import { verifyPreviewToken } from "./preview-token";

export const previewCookie = "wb_cms_preview";
export const readPreview = cache(async () => {
  if (!(await draftMode()).isEnabled) return null;
  const token = (await cookies()).get(previewCookie)?.value;
  return token
    ? verifyPreviewToken(token, process.env.CMS_PREVIEW_SECRET || "")
    : null;
});

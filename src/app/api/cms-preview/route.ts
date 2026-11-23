import { cookies, draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyPreviewToken } from "@/lib/cms/preview-token";
import { previewCookie } from "@/lib/cms/preview";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const preview = verifyPreviewToken(
    token,
    process.env.CMS_PREVIEW_SECRET || "",
  );
  if (!preview)
    return NextResponse.json(
      { error: "Preview link is invalid or expired. Reopen it from the CMS." },
      { status: 401 },
    );
  (await draftMode()).enable();
  const jar = await cookies();
  const secure = request.nextUrl.protocol === "https:";
  // Keep draft cookies scoped to the CMS's embedded preview on HTTPS hosts.
  const bypass = jar.get("__prerender_bypass");
  if (secure && bypass) jar.set("__prerender_bypass", bypass.value, { httpOnly: true, secure: true, sameSite: "none", partitioned: true, path: "/" });
  jar.set(previewCookie, token, {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    partitioned: secure,
    path: "/",
    expires: new Date(preview.expiresAt),
  });
  const response = NextResponse.redirect(
    new URL(preview.pathname, request.nextUrl.origin),
  );
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

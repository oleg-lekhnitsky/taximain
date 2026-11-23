import { cookies, draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { previewCookie, readPreview } from "@/lib/cms/preview";

export async function GET(request: NextRequest) {
  const preview = await readPreview();
  (await draftMode()).disable();
  const jar = await cookies();
  jar.delete(previewCookie);
  if (request.nextUrl.protocol === "https:") {
    for (const name of [previewCookie, "__prerender_bypass"]) jar.set(name, "", { httpOnly: true, secure: true, sameSite: "none", partitioned: true, path: "/", maxAge: 0 });
  }
  return NextResponse.redirect(
    new URL(preview?.pathname || "/", request.nextUrl.origin),
  );
}

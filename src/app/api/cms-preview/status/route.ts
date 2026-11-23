import { NextResponse } from "next/server";
import { previewRevision } from "@/lib/cms/client";

export async function GET() {
  const revision = await previewRevision();
  return NextResponse.json(
    revision || { error: "Preview expired or entry unavailable" },
    {
      status: revision ? 200 : 401,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}

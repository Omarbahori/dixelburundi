import { NextResponse } from "next/server";
import { readSiteContent, writeSiteContent } from "@/lib/contentStore";
import { requireAdmin } from "@/lib/adminAuth";
import type { SiteContent } from "@/lib/siteContent";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const content = await readSiteContent();
  return NextResponse.json({ ok: true, content });
}

export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as null | { content?: SiteContent };
  if (!body?.content) {
    return NextResponse.json({ ok: false, error: "Missing content" }, { status: 400 });
  }

  await writeSiteContent(body.content);
  return NextResponse.json({ ok: true });
}


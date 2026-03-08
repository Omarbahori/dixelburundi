import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const MAX_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".mp4",
  ".webm",
  ".ogg",
  ".mov",
]);

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File too large (max 50MB)" },
      { status: 400 },
    );
  }

  const ext = path.extname(file.name || "").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json(
      { ok: false, error: "Unsupported file type" },
      { status: 400 },
    );
  }

  const originalBytes = Buffer.from(await file.arrayBuffer());
  const bytes = originalBytes;
  const compressed = false;

  const id = crypto.randomBytes(8).toString("hex");
  const safeName = `${Date.now()}-${id}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, safeName), bytes);

  return NextResponse.json({
    ok: true,
    url: `/uploads/${safeName}`,
    compressed,
    originalBytes: originalBytes.length,
    outputBytes: bytes.length,
  });
}

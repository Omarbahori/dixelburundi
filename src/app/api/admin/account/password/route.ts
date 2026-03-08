import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin, updateAdminPassword } from "@/lib/adminAuth";

type Body = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  const currentPassword = body?.currentPassword?.trim() || "";
  const newPassword = body?.newPassword?.trim() || "";
  const confirmPassword = body?.confirmPassword?.trim() || "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      { ok: false, error: "Current password, new password, and confirm password are required." },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { ok: false, error: "New password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { ok: false, error: "New password and confirmation do not match." },
      { status: 400 },
    );
  }

  const result = await updateAdminPassword(currentPassword, newPassword);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

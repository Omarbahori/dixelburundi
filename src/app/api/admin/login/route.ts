import { NextResponse } from "next/server";
import {
  setAdminCookie,
  verifyAdminCredentials,
  getAdminEnv,
  resolveAdminCredential,
} from "@/lib/adminAuth";

export async function POST(req: Request) {
  const env = getAdminEnv();
  const credential = await resolveAdminCredential();
  if (!env.secret || !credential.email || !credential.passwordHash) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Admin credentials are not configured. Set ADMIN_EMAIL, ADMIN_SECRET, ADMIN_PASSWORD_HASH_B64.",
      },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => null)) as null | {
    email?: string;
    password?: string;
  };

  const email = body?.email || "";
  const password = body?.password || "";
  const ok = await verifyAdminCredentials(email, password);

  if (!ok) {
    return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
  }

  await setAdminCookie(email);
  return NextResponse.json({ ok: true });
}

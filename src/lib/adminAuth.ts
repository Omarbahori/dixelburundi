import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import {
  readRuntimeAdminCredential,
  writeRuntimeAdminCredential,
} from "@/lib/adminCredentialStore";

const COOKIE_NAME = "dixel_admin";
const DEFAULT_ADMIN_EMAIL = "admin@dixel.com";
const DEFAULT_ADMIN_SECRET = "dixel-default-secret-change-now";
const DEFAULT_ADMIN_PASSWORD_HASH_B64 =
  "JDJiJDEwJE5lZjlqZFgvNWNYNGFwZkVoRTRERGVqWUU3NVkyaVNMWUUwSG9PQzAzWXdseVFRcEtNS2tL";

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function unbase64url(input: string) {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, "base64").toString("utf8");
}

function sign(payload: object, secret: string) {
  const body = base64url(JSON.stringify(payload));
  const sig = base64url(crypto.createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

function verify(token: string, secret: string) {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = base64url(crypto.createHmac("sha256", secret).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(unbase64url(body)) as { email: string; exp: number };
  } catch {
    return null;
  }
}

export function getAdminEnv() {
  const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const secret = process.env.ADMIN_SECRET || DEFAULT_ADMIN_SECRET;
  // Next.js expands $VARS in .env files; bcrypt hashes start with "$2b$..."
  // which gets mangled. Use ADMIN_PASSWORD_HASH_B64 to avoid that.
  const passwordHashB64 =
    process.env.ADMIN_PASSWORD_HASH_B64 || DEFAULT_ADMIN_PASSWORD_HASH_B64;
  let passwordHash = process.env.ADMIN_PASSWORD_HASH || "";
  if (passwordHashB64) {
    try {
      passwordHash = Buffer.from(passwordHashB64, "base64").toString("utf8");
    } catch {
      // fall back to ADMIN_PASSWORD_HASH
    }
  }
  return { email, secret, passwordHash };
}

export async function resolveAdminCredential() {
  const runtime = await readRuntimeAdminCredential();
  if (runtime?.email && runtime?.passwordHash) {
    return runtime;
  }

  const env = getAdminEnv();
  return {
    email: env.email.trim().toLowerCase(),
    passwordHash: env.passwordHash,
  };
}

export async function verifyAdminCredentials(email: string, password: string) {
  const env = getAdminEnv();
  if (!env.secret) return false;

  const credential = await resolveAdminCredential();
  if (!credential.email || !credential.passwordHash) return false;
  if (email.trim().toLowerCase() !== credential.email.trim().toLowerCase()) return false;
  return bcrypt.compare(password, credential.passwordHash);
}

export async function updateAdminPassword(currentPassword: string, nextPassword: string) {
  const credential = await resolveAdminCredential();
  if (!credential.email || !credential.passwordHash) {
    return { ok: false as const, error: "Admin credentials are not configured." };
  }

  const currentOk = await bcrypt.compare(currentPassword, credential.passwordHash);
  if (!currentOk) {
    return { ok: false as const, error: "Current password is incorrect." };
  }

  const nextHash = await bcrypt.hash(nextPassword, 10);
  await writeRuntimeAdminCredential({
    email: credential.email,
    passwordHash: nextHash,
  });
  return { ok: true as const, email: credential.email };
}

export async function setAdminCookie(email: string) {
  const { secret } = getAdminEnv();
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 60 * 24 * 7; // 7 days
  const token = sign({ email, exp }, secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminAuthedFromNextHeaders() {
  const { secret } = getAdminEnv();
  if (!secret) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = verify(token, secret);
  if (!payload) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

export function requireAdmin(req: NextRequest) {
  const { secret } = getAdminEnv();
  if (!secret) return false;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = verify(token, secret);
  if (!payload) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

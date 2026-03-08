import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const CREDENTIAL_PATH = path.join(DATA_DIR, "admin-credential.json");

export type RuntimeAdminCredential = {
  email: string;
  passwordHash: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function readRuntimeAdminCredential(): Promise<RuntimeAdminCredential | null> {
  try {
    const raw = await fs.readFile(CREDENTIAL_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<RuntimeAdminCredential>;
    if (!parsed.email || !parsed.passwordHash) return null;
    return {
      email: normalizeEmail(parsed.email),
      passwordHash: parsed.passwordHash,
    };
  } catch {
    return null;
  }
}

export async function writeRuntimeAdminCredential(next: RuntimeAdminCredential): Promise<void> {
  const payload = {
    email: normalizeEmail(next.email),
    passwordHash: next.passwordHash,
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${CREDENTIAL_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(payload, null, 2), "utf8");
  await fs.rename(tmp, CREDENTIAL_PATH);
}

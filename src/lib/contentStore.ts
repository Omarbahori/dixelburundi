import fs from "node:fs/promises";
import path from "node:path";
import type { SiteContent } from "@/lib/siteContent";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_PATH = path.join(DATA_DIR, "site.json");
const CONTENT_CACHE_TTL_MS = Math.max(
  0,
  Number.parseInt(process.env.CONTENT_CACHE_TTL_MS || "60000", 10) || 0,
);

type SiteContentCache = {
  value: SiteContent;
  expiresAt: number;
};

let siteContentCache: SiteContentCache | null = null;
let siteContentReadInFlight: Promise<SiteContent> | null = null;

function whatsappLink(number: string, prefill: string) {
  const text = encodeURIComponent(prefill || "");
  const n = (number || "").replace(/[^\d]/g, "");
  return `https://wa.me/${n}?text=${text}`;
}

export function buildWhatsappHrefWithMessage(content: SiteContent, message: string) {
  return whatsappLink(content.settings.contact.whatsappNumber, message);
}

function cloneSiteContent(content: SiteContent): SiteContent {
  if (typeof structuredClone === "function") {
    return structuredClone(content);
  }
  return JSON.parse(JSON.stringify(content)) as SiteContent;
}

function readCachedSiteContent(): SiteContent | null {
  if (!siteContentCache) return null;
  if (Date.now() >= siteContentCache.expiresAt) {
    siteContentCache = null;
    return null;
  }
  return cloneSiteContent(siteContentCache.value);
}

function writeCachedSiteContent(content: SiteContent) {
  if (CONTENT_CACHE_TTL_MS <= 0) {
    siteContentCache = null;
    return;
  }

  siteContentCache = {
    value: cloneSiteContent(content),
    expiresAt: Date.now() + CONTENT_CACHE_TTL_MS,
  };
}

function normalizeContent(parsed: SiteContent): SiteContent {
  // Replace any placeholders with derived values
  if (parsed?.home?.hero?.ctaSecondary?.href === "__WHATSAPP__") {
    parsed.home.hero.ctaSecondary.href = whatsappLink(
      parsed.settings.contact.whatsappNumber,
      parsed.settings.contact.whatsappPrefill,
    );
  }

  // Ensure team section exists for pages/admin controls.
  if (!parsed.team) {
    parsed.team = {
      eyebrow: "THE TEAM",
      title: "The minds behind DIXEL.",
      subtitle: "A friendly team helping brands look better and grow.",
      backgroundImage: "",
      members: [],
    };
  }

  if (!Array.isArray(parsed.home.sharedBackgroundPool)) {
    parsed.home.sharedBackgroundPool = [];
  }

  return parsed;
}

async function readFromFile(): Promise<SiteContent> {
  const raw = await fs.readFile(CONTENT_PATH, "utf8");
  // Some editors/tools write UTF-8 with BOM; JSON.parse will fail unless we strip it.
  const cleaned = raw.replace(/^\uFEFF/, "");
  const parsed = JSON.parse(cleaned) as SiteContent;
  return normalizeContent(parsed);
}

async function writeToFile(next: SiteContent): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${CONTENT_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await fs.rename(tmp, CONTENT_PATH);
}

export async function readSiteContent(): Promise<SiteContent> {
  const cached = readCachedSiteContent();
  if (cached) return cached;

  if (!siteContentReadInFlight) {
    siteContentReadInFlight = readFromFile()
      .then((content) => {
        writeCachedSiteContent(content);
        return content;
      })
      .finally(() => {
        siteContentReadInFlight = null;
      });
  }

  const fresh = await siteContentReadInFlight;
  return cloneSiteContent(fresh);
}

export async function writeSiteContent(next: SiteContent): Promise<void> {
  await writeToFile(next);
  writeCachedSiteContent(next);
}

export function buildWhatsappHref(content: SiteContent) {
  return buildWhatsappHrefWithMessage(content, content.settings.contact.whatsappPrefill);
}

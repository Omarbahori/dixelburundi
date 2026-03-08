import { groq } from "next-sanity";
import type { Image } from "sanity";
import type { Project } from "@/lib/siteContent";
import { isSanityConfigured, sanityClient } from "@/sanity/lib/client";

type SanityImageWithMeta = Image & {
  caption?: string;
  asset?: {
    _ref?: string;
    _type?: string;
    url?: string;
    metadata?: {
      lqip?: string;
      dimensions?: {
        width?: number;
        height?: number;
      };
    };
  };
};

type SanityVideoFileWithMeta = {
  asset?: {
    url?: string;
    mimeType?: string;
    originalFilename?: string;
    size?: number;
    metadata?: {
      dimensions?: {
        width?: number;
        height?: number;
      };
    };
  };
};

type SanityImageItem = SanityImageWithMeta & {
  _key?: string;
  order?: number;
  showOnWork?: boolean;
  showOnHomeFeatured?: boolean;
  workTitle?: string;
  workCategory?: string;
};

type SanityVideoUploadItem = {
  _key?: string;
  caption?: string;
  order?: number;
  showOnWork?: boolean;
  showOnHomeFeatured?: boolean;
  workTitle?: string;
  workCategory?: string;
  poster?: SanityImageWithMeta;
  videoFile?: SanityVideoFileWithMeta;
};

type SanityVideoUrlItem = {
  _key?: string;
  caption?: string;
  order?: number;
  showOnWork?: boolean;
  showOnHomeFeatured?: boolean;
  workTitle?: string;
  workCategory?: string;
  poster?: SanityImageWithMeta;
  videoUrl?: string;
};

type SanityMediaItem = {
  _key?: string;
  mediaType?: "image" | "videoUpload" | "videoUrl";
  caption?: string;
  order?: number;
  showOnWork?: boolean;
  showOnHomeFeatured?: boolean;
  workTitle?: string;
  workCategory?: string;
  image?: SanityImageWithMeta;
  poster?: SanityImageWithMeta;
  videoFile?: SanityVideoFileWithMeta;
  videoUrl?: string;
};

export type CaseStudyClient = {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  services: string[];
  logo?: SanityImageWithMeta;
};

export type CaseStudyBlockType = "galleryGrid" | "twoUp" | "fullWidth" | "text";

export type CaseStudyBlock = {
  _key: string;
  type: CaseStudyBlockType;
  title: string;
  description: string;
  tags: string[];
  images: SanityImageWithMeta[];
  imageItems: SanityImageItem[];
  videoItems: SanityVideoUploadItem[];
  videoUrlItems: SanityVideoUrlItem[];
  mediaItems: SanityMediaItem[];
  order: number;
};

export type CaseStudyEntry = {
  _id: string;
  title: string;
  slug: string;
  introHeadline: string;
  introText: string;
  coverImages: SanityImageWithMeta[];
  blocks: CaseStudyBlock[];
  client: CaseStudyClient;
};

export type NextCaseStudyLink = {
  title: string;
  slug: string;
};

type CaseStudyListItem = NextCaseStudyLink & { _id: string };

export type CaseStudyData = {
  entry: CaseStudyEntry;
  nextProject: NextCaseStudyLink | null;
};

const SANITY_CASE_STUDY_CACHE_TTL_MS = Math.max(
  0,
  Number.parseInt(process.env.SANITY_CASE_STUDY_CACHE_TTL_MS || "120000", 10) || 0,
);
const SANITY_PORTFOLIO_CACHE_TTL_MS = Math.max(
  0,
  Number.parseInt(process.env.SANITY_PORTFOLIO_CACHE_TTL_MS || "120000", 10) || 0,
);

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

let portfolioProjectsCache: CacheEntry<Project[]> | null = null;
const caseStudyBySlugCache = new Map<string, CacheEntry<CaseStudyData | null>>();

type WorkItemRow = {
  title: string;
  slug: string;
  categories?: string[];
  coverImage?: string;
  clientSlug?: string;
  caseStudySlug?: string;
  clientName?: string;
};

type BlockWorkContentRow = {
  caseStudyTitle: string;
  caseStudySlug: string;
  clientSlug?: string;
  clientName?: string;
  blocks?: Array<{
    blockTitle?: string;
    mediaItems?: Array<{
      _key?: string;
      caption?: string;
      mediaType?: "image" | "videoUpload" | "videoUrl";
      order?: number;
      showOnWork?: boolean;
      showOnHomeFeatured?: boolean;
      workTitle?: string;
      workCategory?: string;
      imageUrl?: string;
      posterUrl?: string;
      videoFileUrl?: string;
      videoWidth?: number;
      videoHeight?: number;
      videoUrl?: string;
    }>;
    imageItems?: Array<{
      _key?: string;
      caption?: string;
      order?: number;
      showOnWork?: boolean;
      showOnHomeFeatured?: boolean;
      workTitle?: string;
      workCategory?: string;
      imageUrl?: string;
    }>;
    videoItems?: Array<{
      _key?: string;
      caption?: string;
      order?: number;
      showOnWork?: boolean;
      showOnHomeFeatured?: boolean;
      workTitle?: string;
      workCategory?: string;
      posterUrl?: string;
      videoFileUrl?: string;
      videoWidth?: number;
      videoHeight?: number;
    }>;
    videoUrlItems?: Array<{
      _key?: string;
      caption?: string;
      order?: number;
      showOnWork?: boolean;
      showOnHomeFeatured?: boolean;
      workTitle?: string;
      workCategory?: string;
      posterUrl?: string;
      videoUrl?: string;
    }>;
    images?: Array<{
      caption?: string;
      imageUrl?: string;
      showOnWork?: boolean;
      showOnHomeFeatured?: boolean;
      workTitle?: string;
      workCategory?: string;
    }>;
  }>;
};

type BlockWorkContentBlock = NonNullable<BlockWorkContentRow["blocks"]>[number];
type NormalizedBlockWorkMediaItem = {
  _key?: string;
  caption?: string;
  mediaType?: "image" | "videoUpload" | "videoUrl";
  order?: number;
  showOnWork?: boolean;
  showOnHomeFeatured?: boolean;
  workTitle?: string;
  workCategory?: string;
  imageUrl?: string;
  posterUrl?: string;
  videoFileUrl?: string;
  videoWidth?: number;
  videoHeight?: number;
  videoUrl?: string;
};

const imageProjection = `{
  ...,
  caption,
  asset->{
    _id,
    url,
    metadata{
      lqip,
      dimensions{
        width,
        height
      }
    }
  }
}`;

const imageItemProjection = `{
  ...,
  caption,
  order,
  showOnWork,
  showOnHomeFeatured,
  workTitle,
  "workCategory": coalesce(workCategoryRef->title, workCategory),
  asset->{
    _id,
    url,
    metadata{
      lqip,
      dimensions{
        width,
        height
      }
    }
  }
}`;

const mediaItemProjection = `{
  _key,
  mediaType,
  caption,
  order,
  showOnWork,
  showOnHomeFeatured,
  workTitle,
  "workCategory": coalesce(workCategoryRef->title, workCategory),
  image${imageProjection},
  poster${imageProjection},
  videoFile{
    asset->{
      url,
      mimeType,
      originalFilename,
      size,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  },
  videoUrl
}`;

const videoUploadItemProjection = `{
  _key,
  caption,
  order,
  showOnWork,
  showOnHomeFeatured,
  workTitle,
  "workCategory": coalesce(workCategoryRef->title, workCategory),
  poster${imageProjection},
  "videoFile": {
    "asset": asset->{
      url,
      mimeType,
      originalFilename,
      size,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  }
}`;

const videoUrlItemProjection = `{
  _key,
  caption,
  order,
  showOnWork,
  showOnHomeFeatured,
  workTitle,
  "workCategory": coalesce(workCategoryRef->title, workCategory),
  poster${imageProjection},
  videoUrl
}`;

const caseStudyBySlugQuery = groq`
  *[_type == "caseStudy" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    introHeadline,
    introText,
    coverImages[]${imageProjection},
    blocks[]{
      _key,
      type,
      title,
      description,
      tags,
      order,
      mediaItems[]${mediaItemProjection},
      imageItems[]${imageItemProjection},
      videoItems[]${videoUploadItemProjection},
      videoUrlItems[]${videoUrlItemProjection},
      images[]${imageProjection}
    },
    client->{
      _id,
      name,
      "slug": slug.current,
      "shortDescription": coalesce(shortDescription, description, ""),
      "services": coalesce(services, serviceTags, []),
      logo${imageProjection}
    }
  }
`;

const caseStudyByClientSlugQuery = groq`
  *[_type == "caseStudy" && client->slug.current == $slug]
    | order(_updatedAt desc)[0]{
      _id,
      title,
      "slug": slug.current,
      introHeadline,
      introText,
      coverImages[]${imageProjection},
      blocks[]{
        _key,
        type,
        title,
        description,
        tags,
        order,
        mediaItems[]${mediaItemProjection},
        imageItems[]${imageItemProjection},
        videoItems[]${videoUploadItemProjection},
        videoUrlItems[]${videoUrlItemProjection},
        images[]${imageProjection}
      },
      client->{
        _id,
        name,
        "slug": slug.current,
        "shortDescription": coalesce(shortDescription, description, ""),
        "services": coalesce(services, serviceTags, []),
        logo${imageProjection}
      }
    }
`;

const caseStudyListQuery = groq`
  *[_type == "caseStudy" && defined(slug.current)]
    | order(_createdAt asc){
      _id,
      title,
      "slug": slug.current
    }
`;

const workItemsQuery = groq`
  *[_type == "workItem" && defined(slug.current)]
    | order(_createdAt desc){
      title,
      "slug": slug.current,
      "categories": coalesce(categoryRefs[]->title, categories, []),
      "coverImage": thumbnail.asset->url,
      "clientSlug": client->slug.current,
      "caseStudySlug": caseStudy->slug.current,
      "clientName": client->name
    }
`;

const blockWorkContentQuery = groq`
  *[_type == "caseStudy" && defined(slug.current)]{
    "caseStudyTitle": title,
    "caseStudySlug": slug.current,
    "clientSlug": client->slug.current,
    "clientName": client->name,
    blocks[]{
      "blockTitle": title,
      mediaItems[]{
        _key,
        caption,
        mediaType,
        order,
        showOnWork,
        showOnHomeFeatured,
        workTitle,
        "workCategory": coalesce(workCategoryRef->title, workCategory),
        "imageUrl": image.asset->url,
        "posterUrl": poster.asset->url,
        "videoFileUrl": videoFile.asset->url,
        "videoWidth": videoFile.asset->metadata.dimensions.width,
        "videoHeight": videoFile.asset->metadata.dimensions.height,
        videoUrl
      },
      imageItems[]{
        _key,
        caption,
        order,
        showOnWork,
        showOnHomeFeatured,
        workTitle,
        "workCategory": coalesce(workCategoryRef->title, workCategory),
        "imageUrl": asset->url
      },
      videoItems[]{
        _key,
        caption,
        order,
        showOnWork,
        showOnHomeFeatured,
        workTitle,
        "workCategory": coalesce(workCategoryRef->title, workCategory),
        "posterUrl": poster.asset->url,
        "videoFileUrl": asset->url,
        "videoWidth": asset->metadata.dimensions.width,
        "videoHeight": asset->metadata.dimensions.height
      },
      videoUrlItems[]{
        _key,
        caption,
        order,
        showOnWork,
        showOnHomeFeatured,
        workTitle,
        "workCategory": coalesce(workCategoryRef->title, workCategory),
        "posterUrl": poster.asset->url,
        videoUrl
      },
      images[]{
        caption,
        "imageUrl": asset->url,
        showOnWork,
        showOnHomeFeatured,
        workTitle,
        "workCategory": coalesce(workCategoryRef->title, workCategory)
      }
    }
  }
`;

function normalizeSlug(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function sortBlocks(blocks: CaseStudyBlock[]) {
  return [...blocks].sort((a, b) => {
    const orderA = Number.isFinite(a.order) ? a.order : 0;
    const orderB = Number.isFinite(b.order) ? b.order : 0;
    return orderA - orderB;
  });
}

function sortMediaItems(mediaItems: SanityMediaItem[]) {
  return [...mediaItems].sort((a, b) => {
    const orderA = typeof a.order === "number" && Number.isFinite(a.order) ? a.order : 0;
    const orderB = typeof b.order === "number" && Number.isFinite(b.order) ? b.order : 0;
    return orderA - orderB;
  });
}

function normalizeOrder(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function cleanMediaItems(value: SanityMediaItem[] | null | undefined): SanityMediaItem[] {
  if (!Array.isArray(value)) return [];

  const cleaned = value
    .filter(Boolean)
    .map((item) => {
      const mediaType =
        item.mediaType === "videoUpload" || item.mediaType === "videoUrl"
          ? item.mediaType
          : "image";
      const hasImageAsset = Boolean(item.image?.asset?._ref || item.image?.asset?.url);
      const hasVideoFile = Boolean(item.videoFile?.asset?.url);
      const hasVideoUrl = Boolean(item.videoUrl?.trim());

      if (mediaType === "image" && !hasImageAsset) return null;
      if (mediaType === "videoUpload" && !hasVideoFile) return null;
      if (mediaType === "videoUrl" && !hasVideoUrl) return null;

      return {
        ...item,
        mediaType,
        caption: item.caption || "",
        workTitle: item.workTitle || "",
        workCategory: item.workCategory || "",
        videoUrl: item.videoUrl || "",
        order: Number.isFinite(item.order) ? item.order : 0,
      };
    })
    .filter((item) => Boolean(item)) as SanityMediaItem[];

  return sortMediaItems(cleaned);
}

function mapImageItemsToMedia(value: SanityImageItem[] | null | undefined): SanityMediaItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => Boolean(item?.asset?._ref || item?.asset?.url))
    .map((item) => ({
      _key: item._key,
      mediaType: "image" as const,
      image: item,
      caption: item.caption || "",
      order: normalizeOrder(item.order),
      showOnWork: Boolean(item.showOnWork),
      showOnHomeFeatured: Boolean(item.showOnHomeFeatured),
      workTitle: item.workTitle || "",
      workCategory: item.workCategory || "",
    }));
}

function mapVideoItemsToMedia(value: SanityVideoUploadItem[] | null | undefined): SanityMediaItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => Boolean(item?.videoFile?.asset?.url))
    .map((item) => ({
      _key: item._key,
      mediaType: "videoUpload" as const,
      videoFile: item.videoFile,
      poster: item.poster,
      caption: item.caption || "",
      order: normalizeOrder(item.order),
      showOnWork: Boolean(item.showOnWork),
      showOnHomeFeatured: Boolean(item.showOnHomeFeatured),
      workTitle: item.workTitle || "",
      workCategory: item.workCategory || "",
    }));
}

function mapVideoUrlItemsToMedia(value: SanityVideoUrlItem[] | null | undefined): SanityMediaItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => Boolean(item?.videoUrl?.trim()))
    .map((item) => ({
      _key: item._key,
      mediaType: "videoUrl" as const,
      videoUrl: item.videoUrl || "",
      poster: item.poster,
      caption: item.caption || "",
      order: normalizeOrder(item.order),
      showOnWork: Boolean(item.showOnWork),
      showOnHomeFeatured: Boolean(item.showOnHomeFeatured),
      workTitle: item.workTitle || "",
      workCategory: item.workCategory || "",
    }));
}

function mergeBlockMediaItems(block: {
  mediaItems?: SanityMediaItem[] | null;
  imageItems?: SanityImageItem[] | null;
  videoItems?: SanityVideoUploadItem[] | null;
  videoUrlItems?: SanityVideoUrlItem[] | null;
}) {
  const split = [
    ...mapImageItemsToMedia(block.imageItems),
    ...mapVideoItemsToMedia(block.videoItems),
    ...mapVideoUrlItemsToMedia(block.videoUrlItems),
  ];
  if (split.length > 0) {
    return sortMediaItems(split);
  }
  return cleanMediaItems(block.mediaItems);
}

function cleanBlockArray(value: CaseStudyBlock[] | null | undefined): CaseStudyBlock[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((block): block is CaseStudyBlock => Boolean(block?.type && block?.title))
    .map((block) => ({
      ...block,
      description: block.description || "",
      tags: Array.isArray(block.tags) ? block.tags.filter(Boolean) : [],
      images: Array.isArray(block.images) ? block.images.filter(Boolean) : [],
      imageItems: Array.isArray(block.imageItems) ? block.imageItems.filter(Boolean) : [],
      videoItems: Array.isArray(block.videoItems) ? block.videoItems.filter(Boolean) : [],
      videoUrlItems: Array.isArray(block.videoUrlItems) ? block.videoUrlItems.filter(Boolean) : [],
      mediaItems: mergeBlockMediaItems(block),
      order: Number.isFinite(block.order) ? block.order : 0,
    }));
}

function mapWorkItemToProject(row: WorkItemRow): Project {
  const primaryCategory =
    Array.isArray(row.categories) && row.categories.length > 0
      ? row.categories[0]!
      : "Design";
  const safeSlug = normalizeSlug(row.slug || row.title);
  const coverImage = row.coverImage || "/placeholders/work-01.svg";
  const nowYear = String(new Date().getFullYear());
  const clientName = row.clientName || "Client";

  return {
    slug: safeSlug,
    title: row.title,
    category: primaryCategory,
    year: nowYear,
    tagline: `${clientName} project`,
    brief: `${row.title} case study`,
    deliverables: [],
    tools: [],
    results: [],
    coverImage,
    gallery: [coverImage],
    clientSlug: row.clientSlug ? normalizeSlug(row.clientSlug) : undefined,
    caseStudySlug: row.caseStudySlug ? normalizeSlug(row.caseStudySlug) : undefined,
  };
}

function extractYouTubeThumbnail(url?: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    let id = "";
    if (host === "youtu.be") {
      id = parsed.pathname.replace(/\//g, "").trim();
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      id = parsed.searchParams.get("v") || "";
      if (!id && parsed.pathname.startsWith("/shorts/")) {
        id = parsed.pathname.replace("/shorts/", "").split("/")[0] || "";
      }
      if (!id && parsed.pathname.startsWith("/embed/")) {
        id = parsed.pathname.replace("/embed/", "").split("/")[0] || "";
      }
    }

    if (!id) return "";
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  } catch {
    return "";
  }
}

function extractYouTubeVideoId(url?: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      return parsed.pathname.replace(/\//g, "").trim();
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      let id = parsed.searchParams.get("v") || "";
      if (!id && parsed.pathname.startsWith("/shorts/")) {
        id = parsed.pathname.replace("/shorts/", "").split("/")[0] || "";
      }
      if (!id && parsed.pathname.startsWith("/embed/")) {
        id = parsed.pathname.replace("/embed/", "").split("/")[0] || "";
      }
      return id;
    }
  } catch {
    return "";
  }
  return "";
}

function isYouTubeShortUrl(url?: string) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    return (
      (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") &&
      parsed.pathname.startsWith("/shorts/")
    );
  } catch {
    return false;
  }
}

const EMBED_PREVIEW_CLIP_SECONDS = 8;

function parseLooseTimeToSeconds(value?: string | null) {
  if (!value) return 0;
  const raw = value.trim().toLowerCase();
  if (!raw) return 0;

  if (/^\d+$/.test(raw)) {
    return Math.max(0, Number.parseInt(raw, 10));
  }

  if (raw.includes(":")) {
    const parts = raw
      .split(":")
      .map((part) => Number.parseInt(part, 10))
      .filter((num) => Number.isFinite(num) && num >= 0);
    if (parts.length === 2) {
      return parts[0]! * 60 + parts[1]!;
    }
    if (parts.length === 3) {
      return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
    }
  }

  let total = 0;
  const matches = raw.matchAll(/(\d+)(h|m|s)/g);
  for (const match of matches) {
    const qty = Number.parseInt(match[1] || "0", 10);
    const unit = match[2] || "";
    if (!Number.isFinite(qty)) continue;
    if (unit === "h") total += qty * 3600;
    if (unit === "m") total += qty * 60;
    if (unit === "s") total += qty;
  }
  if (total > 0) return total;

  const fallback = Number.parseInt(raw.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(fallback) ? Math.max(0, fallback) : 0;
}

function toVideoEmbedUrl(url?: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const search = parsed.searchParams;

    const youtubeId = extractYouTubeVideoId(url);
    if (youtubeId) {
      const startSeconds = parseLooseTimeToSeconds(search.get("start") || search.get("t"));
      const endSeconds = startSeconds + EMBED_PREVIEW_CLIP_SECONDS;
      return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&modestbranding=1&rel=0&playlist=${youtubeId}&start=${startSeconds}&end=${endSeconds}`;
    }

    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
      const id = parsed.pathname
        .split("/")
        .map((segment) => segment.trim())
        .filter(Boolean)
        .find((segment) => /^\d+$/.test(segment));
      if (!id) return "";
      return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0`;
    }
  } catch {
    return "";
  }

  return "";
}

function getBlockMediaCover(item: {
  mediaType?: "image" | "videoUpload" | "videoUrl";
  imageUrl?: string;
  posterUrl?: string;
  videoUrl?: string;
}) {
  if (item.mediaType === "image") return item.imageUrl || "";
  if (item.mediaType === "videoUpload") return item.posterUrl || "";
  if (item.mediaType === "videoUrl") return item.posterUrl || extractYouTubeThumbnail(item.videoUrl);
  return item.imageUrl || item.posterUrl || extractYouTubeThumbnail(item.videoUrl);
}

function normalizeBlockWorkMediaItems(
  block?: BlockWorkContentBlock,
): NormalizedBlockWorkMediaItem[] {
  if (!block) return [];

  const splitMedia = [
    ...(Array.isArray(block.imageItems)
      ? block.imageItems.map((item) => ({
          _key: item._key,
          caption: item.caption,
          mediaType: "image" as const,
          order: item.order,
          showOnWork: item.showOnWork,
          showOnHomeFeatured: item.showOnHomeFeatured,
          workTitle: item.workTitle,
          workCategory: item.workCategory,
          imageUrl: item.imageUrl,
        }))
      : []),
    ...(Array.isArray(block.videoItems)
      ? block.videoItems.map((item) => ({
          _key: item._key,
          caption: item.caption,
          mediaType: "videoUpload" as const,
          order: item.order,
          showOnWork: item.showOnWork,
          showOnHomeFeatured: item.showOnHomeFeatured,
          workTitle: item.workTitle,
          workCategory: item.workCategory,
          posterUrl: item.posterUrl,
          videoFileUrl: item.videoFileUrl,
          videoWidth: item.videoWidth,
          videoHeight: item.videoHeight,
        }))
      : []),
    ...(Array.isArray(block.videoUrlItems)
      ? block.videoUrlItems.map((item) => ({
          _key: item._key,
          caption: item.caption,
          mediaType: "videoUrl" as const,
          order: item.order,
          showOnWork: item.showOnWork,
          showOnHomeFeatured: item.showOnHomeFeatured,
          workTitle: item.workTitle,
          workCategory: item.workCategory,
          posterUrl: item.posterUrl,
          videoUrl: item.videoUrl,
        }))
      : []),
  ];

  const source: NormalizedBlockWorkMediaItem[] =
    splitMedia.length > 0
      ? splitMedia
      : Array.isArray(block.mediaItems)
        ? block.mediaItems.map((item) => ({
            _key: item._key,
            caption: item.caption,
            mediaType: item.mediaType,
            order: item.order,
            showOnWork: item.showOnWork,
            showOnHomeFeatured: item.showOnHomeFeatured,
            workTitle: item.workTitle,
            workCategory: item.workCategory,
            imageUrl: item.imageUrl,
            posterUrl: item.posterUrl,
            videoFileUrl: item.videoFileUrl,
            videoWidth: item.videoWidth,
            videoHeight: item.videoHeight,
            videoUrl: item.videoUrl,
          }))
        : [];
  return [...source].sort((a, b) => {
    const orderA = Number.isFinite(a?.order) ? Number(a?.order) : 0;
    const orderB = Number.isFinite(b?.order) ? Number(b?.order) : 0;
    return orderA - orderB;
  });
}

function isDirectVideoUrl(url?: string) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|m4v|mov)(\?.*)?$/i.test(url);
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudyData | null> {
  if (!isSanityConfigured) return null;

  const normalized = normalizeSlug(slug);
  if (!normalized) return null;

  if (SANITY_CASE_STUDY_CACHE_TTL_MS > 0) {
    const now = Date.now();
    for (const [key, entry] of caseStudyBySlugCache) {
      if (entry.expiresAt <= now) caseStudyBySlugCache.delete(key);
    }

    const cached = caseStudyBySlugCache.get(normalized);
    if (cached && cached.expiresAt > now) {
      return cloneValue(cached.value);
    }
  }

  const byCaseStudySlug = await sanityClient.fetch<CaseStudyEntry | null>(caseStudyBySlugQuery, {
    slug: normalized,
  });
  const entry =
    byCaseStudySlug ||
    (await sanityClient.fetch<CaseStudyEntry | null>(caseStudyByClientSlugQuery, {
      slug: normalized,
    }));

  if (!entry?._id) {
    if (SANITY_CASE_STUDY_CACHE_TTL_MS > 0) {
      caseStudyBySlugCache.set(normalized, {
        value: null,
        expiresAt: Date.now() + SANITY_CASE_STUDY_CACHE_TTL_MS,
      });
    }
    return null;
  }

  entry.blocks = sortBlocks(cleanBlockArray(entry.blocks));
  entry.coverImages = Array.isArray(entry.coverImages) ? entry.coverImages.filter(Boolean) : [];
  entry.client.services = Array.isArray(entry.client.services)
    ? entry.client.services.filter(Boolean)
    : [];

  const siblings = await sanityClient.fetch<CaseStudyListItem[]>(caseStudyListQuery);

  const currentIndex = siblings.findIndex((item) => item._id === entry._id);
  const nextProject =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? { title: siblings[currentIndex + 1]!.title, slug: siblings[currentIndex + 1]!.slug }
      : null;

  const result = { entry, nextProject };
  if (SANITY_CASE_STUDY_CACHE_TTL_MS > 0) {
    caseStudyBySlugCache.set(normalized, {
      value: cloneValue(result),
      expiresAt: Date.now() + SANITY_CASE_STUDY_CACHE_TTL_MS,
    });
  }
  return result;
}

export async function getPortfolioProjectsFromSanity(): Promise<Project[]> {
  if (!isSanityConfigured) return [];

  if (SANITY_PORTFOLIO_CACHE_TTL_MS > 0 && portfolioProjectsCache) {
    if (portfolioProjectsCache.expiresAt > Date.now()) {
      return cloneValue(portfolioProjectsCache.value);
    }
    portfolioProjectsCache = null;
  }

  const [workRows, blockRows] = await Promise.all([
    sanityClient.fetch<WorkItemRow[]>(workItemsQuery),
    sanityClient.fetch<BlockWorkContentRow[]>(blockWorkContentQuery),
  ]);

  const fromWorkItems = workRows.map(mapWorkItemToProject);

  const fromBlocks: Project[] = [];
  for (const row of blockRows) {
    const safeCaseStudySlug = normalizeSlug(row.caseStudySlug);
    if (!safeCaseStudySlug) continue;

    const blockList = Array.isArray(row.blocks) ? row.blocks : [];
    for (let blockIndex = 0; blockIndex < blockList.length; blockIndex += 1) {
      const block = blockList[blockIndex];
      if (!block) continue;
      const mediaItems = normalizeBlockWorkMediaItems(block);
      const images = Array.isArray(block.images) ? block.images : [];

      if (mediaItems.length > 0) {
        for (let mediaIndex = 0; mediaIndex < mediaItems.length; mediaIndex += 1) {
          const media = mediaItems[mediaIndex];
          if (!media) continue;

          const showOnWork = Boolean(media.showOnWork);
          const showOnHomeFeatured = Boolean(media.showOnHomeFeatured);
          if (!showOnWork && !showOnHomeFeatured) continue;

          const title =
            media.workTitle?.trim() || media.caption?.trim() || block.blockTitle || row.caseStudyTitle;
          const category = media.workCategory?.trim() || "Design";
          const safeClientSlug = row.clientSlug ? normalizeSlug(row.clientSlug) : undefined;
          const generatedSlug = normalizeSlug(
            `${safeCaseStudySlug}-${block.blockTitle || "block"}-${mediaIndex + 1}`,
          );
          const preferredCoverImage = getBlockMediaCover(media);
          const coverImage = preferredCoverImage || "/placeholders/work-01.svg";
          const shouldFallbackToVideoPreview = !preferredCoverImage;
          const previewEmbedUrl =
            media.mediaType === "videoUrl" ? toVideoEmbedUrl(media.videoUrl) || undefined : undefined;
          const previewVideoUrl =
            shouldFallbackToVideoPreview && media.mediaType === "videoUpload"
              ? media.videoFileUrl
              : shouldFallbackToVideoPreview &&
                  media.mediaType === "videoUrl" &&
                  isDirectVideoUrl(media.videoUrl) &&
                  !previewEmbedUrl
                ? media.videoUrl
                : undefined;
          let previewVideoWidth =
            typeof media.videoWidth === "number" && Number.isFinite(media.videoWidth)
              ? media.videoWidth
              : undefined;
          let previewVideoHeight =
            typeof media.videoHeight === "number" && Number.isFinite(media.videoHeight)
              ? media.videoHeight
              : undefined;
          if (
            media.mediaType === "videoUrl" &&
            previewEmbedUrl &&
            (previewVideoWidth === undefined || previewVideoHeight === undefined)
          ) {
            const isShort = isYouTubeShortUrl(media.videoUrl);
            previewVideoWidth = isShort ? 1080 : 1920;
            previewVideoHeight = isShort ? 1920 : 1080;
          }

          fromBlocks.push({
            slug: generatedSlug,
            title,
            category,
            year: String(new Date().getFullYear()),
            tagline: media.caption?.trim() || `${row.clientName || "Client"} project`,
            brief: `${title} case study`,
            deliverables: [],
            tools: [],
            results: [],
            coverImage,
            gallery: [coverImage],
            previewVideoUrl,
            previewEmbedUrl,
            previewVideoWidth,
            previewVideoHeight,
            clientSlug: safeClientSlug,
            caseStudySlug: safeCaseStudySlug,
            featured: showOnHomeFeatured,
          });
        }
        continue;
      }

      for (let imageIndex = 0; imageIndex < images.length; imageIndex += 1) {
        const image = images[imageIndex];
        if (!image?.imageUrl) continue;

        const showOnWork = Boolean(image.showOnWork);
        const showOnHomeFeatured = Boolean(image.showOnHomeFeatured);
        if (!showOnWork && !showOnHomeFeatured) continue;

        const title = image.workTitle?.trim() || image.caption?.trim() || block.blockTitle || row.caseStudyTitle;
        const category = image.workCategory?.trim() || "Design";
        const safeClientSlug = row.clientSlug ? normalizeSlug(row.clientSlug) : undefined;
        const generatedSlug = normalizeSlug(
          `${safeCaseStudySlug}-${block.blockTitle || "block"}-${imageIndex + 1}`,
        );

        fromBlocks.push({
          slug: generatedSlug,
          title,
          category,
          year: String(new Date().getFullYear()),
          tagline: image.caption?.trim() || `${row.clientName || "Client"} project`,
          brief: `${title} case study`,
          deliverables: [],
          tools: [],
          results: [],
          coverImage: image.imageUrl,
          gallery: [image.imageUrl],
          clientSlug: safeClientSlug,
          caseStudySlug: safeCaseStudySlug,
          featured: showOnHomeFeatured,
        });
      }
    }
  }

  const projects = [...fromWorkItems, ...fromBlocks];
  if (SANITY_PORTFOLIO_CACHE_TTL_MS > 0) {
    portfolioProjectsCache = {
      value: cloneValue(projects),
      expiresAt: Date.now() + SANITY_PORTFOLIO_CACHE_TTL_MS,
    };
  }
  return projects;
}

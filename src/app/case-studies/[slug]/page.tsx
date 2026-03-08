import type { Image as SanityImage } from "sanity";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import CaseStudyHeader from "@/components/case-studies/CaseStudyHeader";
import CaseStudyGallery, {
  type CaseStudyGalleryBlock,
  type CaseStudyGalleryMedia,
} from "@/components/case-studies/CaseStudyGallery";
import { getCaseStudyBySlug } from "@/sanity/lib/caseStudies";
import { urlForImage } from "@/sanity/lib/image";

export const revalidate = 120;

function withSanityImageParams(url: string, width: number) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}auto=format&fit=max&w=${width}&q=75`;
}

type SanityImageInput =
  | (SanityImage & {
      _type?: string;
      _ref?: string;
      asset?: {
        _type?: string;
        _ref?: string;
        url?: string;
        metadata?: { dimensions?: { width?: number; height?: number } };
      };
      caption?: string;
    })
  | null
  | undefined;

function toImageSrc(image: SanityImageInput, width: number) {
  if (!image) return "";
  const directUrl = image.asset?.url || "";
  const hasAssetRef = Boolean(image.asset?._ref);
  if (directUrl) return withSanityImageParams(directUrl, width);
  if (hasAssetRef) return urlForImage(image).width(width).quality(75).url();
  return "";
}

function toImageData(
  image: SanityImageInput,
  fallbackAlt: string,
): CaseStudyGalleryMedia | null {
  if (!image) return null;

  const src = toImageSrc(image, 1400);
  if (!src) return null;

  const dimensions = image.asset?.metadata?.dimensions;
  return {
    type: "image",
    src,
    alt: image.caption || fallbackAlt,
    width: dimensions?.width || 1600,
    height: dimensions?.height || 1100,
    caption: image.caption || "",
  };
}

function buildVideoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/\//g, "").trim();
      return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      let id = parsed.searchParams.get("v") || "";
      if (!id && parsed.pathname.startsWith("/shorts/")) {
        id = parsed.pathname.replace("/shorts/", "").split("/")[0] || "";
      }
      if (!id && parsed.pathname.startsWith("/embed/")) {
        id = parsed.pathname.replace("/embed/", "").split("/")[0] || "";
      }
      return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
    }

    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
      const id = parsed.pathname
        .split("/")
        .map((segment) => segment.trim())
        .filter(Boolean)
        .find((segment) => /^\d+$/.test(segment));
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|m4v|mov)(\?.*)?$/i.test(url);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCaseStudyBySlug(slug);
  if (!data) return { title: "Case Study | DIXEL" };

  return {
    title: `${data.entry.title} | DIXEL`,
    description: data.entry.introText,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCaseStudyBySlug(slug);
  if (!data) return notFound();

  const { entry } = data;

  const logoSrc = entry.client.logo ? toImageSrc(entry.client.logo, 640) : "";
  const logo =
    entry.client.logo && logoSrc
      ? {
          src: logoSrc,
          width: entry.client.logo.asset?.metadata?.dimensions?.width || 360,
          height: entry.client.logo.asset?.metadata?.dimensions?.height || 360,
        }
      : undefined;

  const blocks: CaseStudyGalleryBlock[] = entry.blocks.map((block) => {
    const mediaFromItems = (block.mediaItems || [])
      .map((mediaItem, mediaIndex) => {
        const fallbackAlt = `${entry.title} ${block.title} media ${mediaIndex + 1}`;
        const mediaType =
          mediaItem.mediaType === "videoUpload" || mediaItem.mediaType === "videoUrl"
            ? mediaItem.mediaType
            : "image";

        if (mediaType === "image") {
          const imageMedia = toImageData(mediaItem.image, fallbackAlt);
          if (!imageMedia) return null;
          return {
            ...imageMedia,
            caption: mediaItem.caption || imageMedia.caption,
          } satisfies CaseStudyGalleryMedia;
        }

        if (mediaType === "videoUpload") {
          const videoSrc = mediaItem.videoFile?.asset?.url || "";
          if (!videoSrc) return null;

          const posterSrc = toImageSrc(mediaItem.poster, 1400) || undefined;
          const dimensions = mediaItem.poster?.asset?.metadata?.dimensions;
          return {
            type: "video",
            source: "upload",
            src: videoSrc,
            poster: posterSrc,
            alt: mediaItem.caption || fallbackAlt,
            width: dimensions?.width || 1600,
            height: dimensions?.height || 900,
            caption: mediaItem.caption || "",
          } satisfies CaseStudyGalleryMedia;
        }

        const videoUrl = mediaItem.videoUrl?.trim() || "";
        if (!videoUrl) return null;

        const embedSrc = buildVideoEmbedUrl(videoUrl) || undefined;
        const directVideoSrc = isDirectVideoUrl(videoUrl) ? videoUrl : undefined;
        const posterSrc = toImageSrc(mediaItem.poster, 1400) || undefined;
        const dimensions = mediaItem.poster?.asset?.metadata?.dimensions;

        return {
          type: "video",
          source: "url",
          src: directVideoSrc || videoUrl,
          embedSrc,
          externalUrl: !embedSrc && !directVideoSrc ? videoUrl : undefined,
          poster: posterSrc,
          alt: mediaItem.caption || fallbackAlt,
          width: dimensions?.width || 1600,
          height: dimensions?.height || 900,
          caption: mediaItem.caption || "",
        } satisfies CaseStudyGalleryMedia;
      })
      .filter((media) => media !== null) as CaseStudyGalleryMedia[];

    const legacyImages = (block.images || [])
      .map((image, imageIndex) =>
        toImageData(image, `${entry.title} ${block.title} image ${imageIndex + 1}`),
      )
      .filter((image) => image !== null) as CaseStudyGalleryMedia[];

    return {
      type: block.type,
      title: block.title,
      media: mediaFromItems.length > 0 ? mediaFromItems : legacyImages,
    };
  });

  return (
    <div className="relative py-12 sm:py-16 surface-dark">
      <Container>
        <Reveal>
          <CaseStudyHeader
            client={{
              name: entry.client.name,
              shortDescription: entry.client.shortDescription,
              logo,
            }}
          />
        </Reveal>

        <div className="mt-8 border-t border-white/12" />
        <div className="mt-8 space-y-10 sm:space-y-12">
          {blocks.map((block, idx) => (
            <Reveal key={`${block.title}-${idx}`} delay={0.03 * idx}>
              <CaseStudyGallery block={block} />
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}

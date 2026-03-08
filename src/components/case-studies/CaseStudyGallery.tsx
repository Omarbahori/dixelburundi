"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import Image from "next/image";

export type CaseStudyGalleryMedia = {
  type: "image" | "video";
  source?: "upload" | "url";
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  poster?: string;
  embedSrc?: string;
  externalUrl?: string;
};

export type CaseStudyGalleryBlock = {
  type: "galleryGrid" | "twoUp" | "fullWidth" | "text";
  title: string;
  media: CaseStudyGalleryMedia[];
};

type RatioBucket = "square" | "landscape" | "portrait";

function getRatioBucket(item: CaseStudyGalleryMedia): RatioBucket {
  if (!item.width || !item.height) return "landscape";
  const ratio = item.width / item.height;
  if (ratio > 1.08) return "landscape";
  if (ratio < 0.92) return "portrait";
  return "square";
}

function groupByRatio(mediaItems: CaseStudyGalleryMedia[]) {
  const groups: Record<RatioBucket, CaseStudyGalleryMedia[]> = {
    square: [],
    landscape: [],
    portrait: [],
  };

  for (const mediaItem of mediaItems) {
    groups[getRatioBucket(mediaItem)].push(mediaItem);
  }

  return [
    { bucket: "square" as const, images: groups.square },
    { bucket: "landscape" as const, images: groups.landscape },
    { bucket: "portrait" as const, images: groups.portrait },
  ].filter((group) => group.images.length > 0);
}

function MediaCard({
  media,
  ratioBucket,
  className,
}: {
  media: CaseStudyGalleryMedia;
  ratioBucket: RatioBucket;
  className?: string;
}) {
  const ratioClassName =
    ratioBucket === "square"
      ? "aspect-square"
      : ratioBucket === "portrait"
        ? "aspect-[4/5]"
        : "aspect-[16/10]";
  const hasDimensions =
    Number.isFinite(media.width) &&
    Number.isFinite(media.height) &&
    media.width > 0 &&
    media.height > 0;
  const fallbackRatio =
    ratioClassName === "aspect-square"
      ? "1 / 1"
      : ratioClassName === "aspect-[4/5]"
        ? "4 / 5"
        : "16 / 10";
  const mediaAspectRatio = hasDimensions ? `${media.width} / ${media.height}` : fallbackRatio;
  const [resolvedAspectRatio, setResolvedAspectRatio] = useState(mediaAspectRatio);

  useEffect(() => {
    setResolvedAspectRatio(mediaAspectRatio);
  }, [mediaAspectRatio, media.src, media.type]);

  const handleVideoMetaLoaded = (event: SyntheticEvent<HTMLVideoElement>) => {
    const width = event.currentTarget.videoWidth;
    const height = event.currentTarget.videoHeight;
    if (width > 0 && height > 0) {
      setResolvedAspectRatio(`${width} / ${height}`);
    }
  };

  const mediaSurface = (() => {
    if (media.type === "image") {
      return (
        <Image
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          sizes="(max-width: 1024px) 50vw, 25vw"
          unoptimized
          className="h-full w-full object-contain"
        />
      );
    }

    if (media.embedSrc) {
      return (
        <iframe
          src={media.embedSrc}
          title={media.alt}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full border-0"
        />
      );
    }

    if (media.externalUrl) {
      return (
        <a
          href={media.externalUrl}
          target="_blank"
          rel="noreferrer"
          className="group relative flex h-full w-full items-center justify-center bg-black/25"
          aria-label={`Open ${media.alt} video in new tab`}
        >
          {media.poster ? (
            <Image
              src={media.poster}
              alt={media.alt}
              width={media.width || 1600}
              height={media.height || 900}
              unoptimized
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <span className="text-sm font-semibold text-white/85">Open video</span>
          )}
          <span className="pointer-events-none absolute inset-0 bg-black/25" />
          <span className="pointer-events-none absolute rounded-full border border-white/30 bg-black/55 px-3 py-1 text-xs font-semibold text-white/90">
            Open video
          </span>
        </a>
      );
    }

    return (
      <video
        src={media.src}
        poster={media.poster}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={handleVideoMetaLoaded}
        className="h-full w-full object-contain bg-black"
      />
    );
  })();

  return (
    <figure className={className}>
      <div className="relative overflow-hidden bg-black/20" style={{ aspectRatio: resolvedAspectRatio }}>
        {mediaSurface}
      </div>
      {media.caption ? (
        <figcaption className="border-t border-white/10 px-4 py-3 text-sm text-white/70">
          {media.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export default function CaseStudyGallery({ block }: { block: CaseStudyGalleryBlock }) {
  const shellClassName = "overflow-hidden rounded-xl border border-white/10 bg-white/4";
  const groupedMedia = groupByRatio(block.media);
  const [zoomImage, setZoomImage] = useState<CaseStudyGalleryMedia | null>(null);

  useEffect(() => {
    if (!zoomImage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomImage(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [zoomImage]);

  return (
    <section className="space-y-5">
      <div>
        <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{block.title}</h3>
      </div>

      {block.type === "galleryGrid" ? (
        <div className="space-y-2 md:space-y-6">
          {groupedMedia.map((group) => (
            <div key={group.bucket} className="grid grid-cols-2 gap-2 md:gap-6 lg:grid-cols-4">
              {group.images.map((media, idx) =>
                media.type === "image" ? (
                  <button
                    key={`${group.bucket}-${media.src}-${idx}`}
                    type="button"
                    onClick={() => setZoomImage(media)}
                    className="text-left"
                  >
                    <MediaCard media={media} ratioBucket={group.bucket} className={shellClassName} />
                  </button>
                ) : (
                  <MediaCard
                    key={`${group.bucket}-${media.src}-${idx}`}
                    media={media}
                    ratioBucket={group.bucket}
                    className={shellClassName}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      ) : null}

      {block.type === "twoUp" ? (
        <div className="grid grid-cols-2 gap-2 md:gap-6 lg:grid-cols-4">
          {block.media.slice(0, 2).map((media, idx) =>
            media.type === "image" ? (
              <button
                key={`${media.src}-${idx}`}
                type="button"
                onClick={() => setZoomImage(media)}
                className="text-left"
              >
                <MediaCard
                  media={media}
                  ratioBucket={getRatioBucket(media)}
                  className={shellClassName}
                />
              </button>
            ) : (
              <MediaCard
                key={`${media.src}-${idx}`}
                media={media}
                ratioBucket={getRatioBucket(media)}
                className={shellClassName}
              />
            ),
          )}
        </div>
      ) : null}

      {block.type === "fullWidth" ? (
        <div className={shellClassName}>
          {block.media[0] ? (
            block.media[0].type === "image" ? (
              <button type="button" onClick={() => setZoomImage(block.media[0]!)} className="w-full text-left">
                <Image
                  src={block.media[0].src}
                  alt={block.media[0].alt}
                  width={block.media[0].width}
                  height={block.media[0].height}
                  sizes="100vw"
                  unoptimized
                  className="h-auto w-full object-contain"
                />
              </button>
            ) : (
              <MediaCard
                media={block.media[0]}
                ratioBucket={getRatioBucket(block.media[0])}
              />
            )
          ) : null}
        </div>
      ) : null}

      {zoomImage && zoomImage.type === "image" ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed image preview"
          onClick={() => setZoomImage(null)}
        >
          <button
            type="button"
            aria-label="Close zoom preview"
            onClick={() => setZoomImage(null)}
            className="absolute right-4 top-4 rounded-full border border-white/30 bg-black/45 px-3 py-1 text-sm font-semibold text-white/90"
          >
            Close
          </button>
          <div
            className="max-h-[92vh] max-w-[92vw] overflow-auto rounded-xl border border-white/20 bg-black/30"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={zoomImage.src}
              alt={zoomImage.alt}
              width={zoomImage.width}
              height={zoomImage.height}
              unoptimized
              sizes="92vw"
              className="h-auto max-h-[88vh] w-auto max-w-[92vw] object-contain"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

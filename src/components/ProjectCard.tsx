"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/siteContent";
import { cn } from "@/lib/cn";

const PREVIEW_CLIP_SECONDS = 6;

function normalizeSlug(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProjectCard({
  project,
  priority,
  className,
  tone = "dark",
  compact = false,
}: {
  project: Project;
  priority?: boolean;
  className?: string;
  tone?: "dark" | "light";
  compact?: boolean;
}) {
  const isLight = tone === "light";
  const safeSlug = normalizeSlug(project.slug || project.title);
  const safeCaseStudySlug = project.caseStudySlug ? normalizeSlug(project.caseStudySlug) : "";
  const safeClientSlug = project.clientSlug ? normalizeSlug(project.clientSlug) : "";
  const projectHref = safeCaseStudySlug
    ? `/case-studies/${safeCaseStudySlug}`
    : safeClientSlug
      ? `/case-studies/${safeClientSlug}`
      : `/work/${safeSlug}`;
  const outerRadius = compact ? "rounded-[12px] sm:rounded-[16px]" : "rounded-[26px] sm:rounded-[34px]";
  const mediaRadius = compact ? "rounded-[12px] sm:rounded-[16px]" : "rounded-[26px] sm:rounded-[34px]";
  const borderRadius = compact ? "rounded-[12px] sm:rounded-[16px]" : "rounded-[26px] sm:rounded-[34px]";
  const innerBorderRadius = compact ? "rounded-[9px] sm:rounded-[12px]" : "rounded-[22px] sm:rounded-[30px]";
  const captionRadius = compact ? "rounded-b-[12px] sm:rounded-b-[16px]" : "rounded-b-[26px] sm:rounded-b-[34px]";
  const mediaAspect = compact ? "" : "aspect-[4/5]";
  const isPlaceholderCover =
    !project.coverImage || project.coverImage.startsWith("/placeholders/");
  const useVideoPreview = Boolean(project.previewVideoUrl && isPlaceholderCover);
  const useEmbedPreview = Boolean(project.previewEmbedUrl);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewClipEndRef = useRef(PREVIEW_CLIP_SECONDS);
  const mediaViewportRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadEmbed, setShouldLoadEmbed] = useState(Boolean(priority));
  const [shouldLoadVideoPreview, setShouldLoadVideoPreview] = useState(
    () => Boolean(priority || !useVideoPreview),
  );
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const hasPreviewDimensions =
    typeof project.previewVideoWidth === "number" &&
    Number.isFinite(project.previewVideoWidth) &&
    project.previewVideoWidth > 0 &&
    typeof project.previewVideoHeight === "number" &&
    Number.isFinite(project.previewVideoHeight) &&
    project.previewVideoHeight > 0;
  const previewAspectStyle =
    hasPreviewDimensions && compact
      ? { aspectRatio: `${project.previewVideoWidth} / ${project.previewVideoHeight}` }
      : undefined;

  useEffect(() => {
    if (!useEmbedPreview) return;
    setEmbedLoaded(false);
    if (priority) {
      setShouldLoadEmbed(true);
      return;
    }

    const node = mediaViewportRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setShouldLoadEmbed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoadEmbed(true);
        observer.disconnect();
      },
      { root: null, threshold: 0.12, rootMargin: "220px 0px 220px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [useEmbedPreview, project.previewEmbedUrl, priority]);

  useEffect(() => {
    if (!useVideoPreview) {
      setShouldLoadVideoPreview(true);
      return;
    }
    if (priority) {
      setShouldLoadVideoPreview(true);
      return;
    }

    const node = mediaViewportRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setShouldLoadVideoPreview(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoadVideoPreview(true);
        observer.disconnect();
      },
      { root: null, threshold: 0.12, rootMargin: "220px 0px 220px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [useVideoPreview, project.previewVideoUrl, priority]);

  useEffect(() => {
    if (!useVideoPreview) return;
    const video = previewVideoRef.current;
    if (!video) return;

    const syncClipWindow = () => {
      const duration =
        Number.isFinite(video.duration) && video.duration > 0
          ? video.duration
          : PREVIEW_CLIP_SECONDS;
      previewClipEndRef.current = Math.max(
        1.4,
        Math.min(PREVIEW_CLIP_SECONDS, duration),
      );
      if (video.currentTime > previewClipEndRef.current) {
        video.currentTime = 0;
      }
    };

    const onTimeUpdate = () => {
      if (video.currentTime >= previewClipEndRef.current) {
        video.currentTime = 0;
        void video.play().catch(() => {
          // Ignore autoplay restrictions.
        });
      }
    };

    video.addEventListener("loadedmetadata", syncClipWindow);
    video.addEventListener("timeupdate", onTimeUpdate);

    if (video.readyState >= 1) {
      syncClipWindow();
    }

    return () => {
      video.removeEventListener("loadedmetadata", syncClipWindow);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [useVideoPreview, project.previewVideoUrl]);

  return (
    <Link
      href={projectHref}
      className={cn(
        isLight
          ? "group relative overflow-hidden border border-white/45 bg-white/18 shadow-[0_18px_32px_rgba(0,0,0,0.10),0_6px_12px_rgba(255,255,255,0.28)_inset,0_-10px_18px_rgba(0,0,0,0.08)_inset] backdrop-blur-xl transition duration-200 hover:-translate-y-[3px] hover:scale-[1.01] hover:border-white/70 hover:bg-white/24 hover:shadow-[0_28px_46px_rgba(0,0,0,0.16),0_8px_16px_rgba(255,255,255,0.36)_inset,0_-12px_20px_rgba(0,0,0,0.10)_inset] motion-reduce:transform-none motion-reduce:transition-none"
          : "group relative overflow-hidden bg-white/10 shadow-[0_20px_38px_rgba(0,0,0,0.34)] backdrop-blur-xl transition duration-200 hover:-translate-y-[3px] hover:scale-[1.01] hover:bg-white/14 hover:shadow-[0_30px_54px_rgba(0,0,0,0.46)] motion-reduce:transform-none motion-reduce:transition-none",
        outerRadius,
        "cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dixel-accent/65 focus-visible:ring-offset-2 focus-visible:ring-offset-dixel-bg",
        className,
      )}
      aria-label={`${project.title} case study`}
    >
      <div
        ref={useEmbedPreview || useVideoPreview ? mediaViewportRef : undefined}
        className={cn("relative overflow-hidden bg-black/10", mediaAspect, mediaRadius)}
        style={previewAspectStyle}
      >
        {compact || useVideoPreview || useEmbedPreview ? null : (
          <Image
            src={project.coverImage}
            alt=""
            fill
            aria-hidden="true"
            sizes={compact ? "(max-width: 1024px) 50vw, 33vw" : "(max-width: 1024px) 50vw, 33vw"}
            className="object-cover blur-md scale-105 opacity-30"
            priority={priority}
          />
        )}
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            isLight
              ? "bg-gradient-to-b from-white/45 via-white/18 to-white/40"
              : "bg-gradient-to-b from-dixel-bg/55 via-dixel-bg/18 to-dixel-bg/55",
          )}
        />
        <div
          className={cn(
            "case-study-pill pointer-events-none absolute right-3 top-3 z-[2] inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.06em]",
            isLight
              ? "border-black/12 bg-white/78 text-black/72"
              : "border-white/20 bg-black/35 text-white/85",
          )}
        >
          <span>See case study</span>
          <span aria-hidden="true" className="case-study-pill-arrow">
            &gt;
          </span>
        </div>
        {useVideoPreview ? (
          shouldLoadVideoPreview ? (
            <video
              ref={previewVideoRef}
              src={project.previewVideoUrl}
              muted
              autoPlay
              playsInline
              preload="none"
              className={cn(
                "relative z-[1] block transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none",
                compact ? "h-auto w-full object-contain bg-black" : "h-full w-full object-contain bg-black",
              )}
            />
          ) : project.coverImage ? (
            <Image
              src={project.coverImage}
              alt=""
              fill
              aria-hidden="true"
              sizes={compact ? "(max-width: 1024px) 50vw, 33vw" : "(max-width: 1024px) 50vw, 33vw"}
              className="object-cover opacity-65"
            />
          ) : (
            <div className="h-full w-full bg-black/25" />
          )
        ) : useEmbedPreview ? (
          <div
            className={cn(
              "pointer-events-none relative z-[1] w-full overflow-hidden bg-black",
              compact ? "" : "h-full",
            )}
            style={previewAspectStyle}
          >
            {project.coverImage ? (
              <Image
                src={project.coverImage}
                alt=""
                fill
                aria-hidden="true"
                sizes={compact ? "(max-width: 1024px) 50vw, 33vw" : "33vw"}
                className={cn(
                  "object-cover transition-opacity duration-300",
                  embedLoaded ? "opacity-0" : "opacity-100",
                )}
              />
            ) : null}
            {shouldLoadEmbed ? (
              <iframe
                src={project.previewEmbedUrl}
                title={`${project.title} video preview`}
                loading={priority ? "eager" : "lazy"}
                allow="autoplay; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                tabIndex={-1}
                onLoad={() => setEmbedLoaded(true)}
                className={cn(
                  "h-full w-full border-0 transition-opacity duration-300",
                  compact ? "min-h-[180px]" : "",
                  embedLoaded ? "opacity-100" : "opacity-0",
                )}
              />
            ) : null}
          </div>
        ) : compact ? (
          <img
            src={project.coverImage}
            alt={project.title}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="relative z-[1] block h-auto w-full transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
          />
        ) : (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes={compact ? "(max-width: 1024px) 50vw, 33vw" : "(max-width: 1024px) 50vw, 33vw"}
            className="object-cover opacity-100 transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
            priority={priority}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/18 to-transparent opacity-80" />

        <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent p-4 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100", captionRadius)}>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-base font-semibold tracking-tight text-white">
                {project.title}
              </h3>
              <span className="text-xs font-semibold text-white/75">{project.year}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
              {project.category}
            </p>
            <p className="text-sm leading-5 text-white/90">{project.tagline}</p>
          </div>
        </div>
      </div>
      <span className="sr-only">
        {project.title} - {project.category} - {project.year}
      </span>
    </Link>
  );
}

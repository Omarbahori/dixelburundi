"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/lib/siteContent";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";

type AspectBucket = "portrait" | "square" | "landscape" | "unknown";
type AspectReading = {
  bucket: AspectBucket;
  ratio: number | null;
  clusterKey: string;
  sortTier: number;
  sortRank: number;
};

function getProjectKey(project: Project, idx: number) {
  return `${project.slug || project.title}-${idx}`;
}

function detectAspectBucket(width: number, height: number): AspectBucket {
  if (!width || !height) return "unknown";
  const ratio = width / height;
  if (ratio > 1.12) return "landscape";
  if (ratio < 0.88) return "portrait";
  return "square";
}

function buildAspectReading(width: number, height: number): AspectReading {
  if (!width || !height) {
    return {
      bucket: "unknown",
      ratio: null,
      clusterKey: "unknown",
      sortTier: 99,
      sortRank: Number.POSITIVE_INFINITY,
    };
  }

  const ratio = width / height;
  // Tight ratio clustering so different portrait styles (e.g. 9:16 vs 4:5) do not share rows.
  const clusterStep = 0.06;
  const clusteredRatio = Math.round(ratio / clusterStep) * clusterStep;
  // Prioritize rows:
  // 0) Instagram portrait-ish (around 4:5)
  // 1) square-ish
  // 2) landscape
  // 4) tall reels (9:16-like) near the end
  let sortTier = 2;
  if (ratio < 0.72) {
    sortTier = 4;
  } else if (ratio <= 0.9) {
    sortTier = 0;
  } else if (ratio <= 1.12) {
    sortTier = 1;
  }

  return {
    bucket: detectAspectBucket(width, height),
    ratio,
    clusterKey: `ratio-${clusteredRatio.toFixed(2)}`,
    sortTier,
    sortRank: clusteredRatio,
  };
}

function shouldUseVideoPreview(project: Project) {
  return Boolean(project.previewVideoUrl || project.previewEmbedUrl);
}

export default function ProjectGrid({
  projects,
  tone = "dark",
  compact = false,
  gridClassName,
  priorityCount = 3,
}: {
  projects: Project[];
  tone?: "dark" | "light";
  compact?: boolean;
  gridClassName: string;
  priorityCount?: number;
}) {
  const [aspectByMedia, setAspectByMedia] = useState<Record<string, AspectReading>>({});

  useEffect(() => {
    let cancelled = false;

    const immediate: Record<string, AspectReading> = {};
    const pending: Array<Promise<{ key: string; reading: AspectReading }>> = [];

    for (let i = 0; i < projects.length; i += 1) {
      const project = projects[i];
      const key = getProjectKey(project, i);
      if (shouldUseVideoPreview(project)) {
        const width = project.previewVideoWidth;
        const height = project.previewVideoHeight;
        if (
          typeof width === "number" &&
          Number.isFinite(width) &&
          width > 0 &&
          typeof height === "number" &&
          Number.isFinite(height) &&
          height > 0
        ) {
          immediate[key] = buildAspectReading(width, height);
          continue;
        }

        if (project.previewVideoUrl) {
          pending.push(
            new Promise<{ key: string; reading: AspectReading }>((resolve) => {
              const video = document.createElement("video");
              video.preload = "metadata";
              video.muted = true;
              video.playsInline = true;
              video.onloadedmetadata = () =>
                resolve({
                  key,
                  reading: buildAspectReading(video.videoWidth || 0, video.videoHeight || 0),
                });
              video.onerror = () =>
                resolve({
                  key,
                  reading: buildAspectReading(0, 0),
                });
              video.src = project.previewVideoUrl as string;
            }),
          );
        } else if (project.coverImage) {
          pending.push(
            new Promise<{ key: string; reading: AspectReading }>((resolve) => {
              const img = new Image();
              img.decoding = "async";
              img.onload = () =>
                resolve({
                  key,
                  reading: buildAspectReading(img.naturalWidth, img.naturalHeight),
                });
              img.onerror = () =>
                resolve({
                  key,
                  reading: buildAspectReading(0, 0),
                });
              img.src = project.coverImage;
            }),
          );
        } else {
          immediate[key] = buildAspectReading(0, 0);
        }
        continue;
      }

      if (project.coverImage) {
        pending.push(
          new Promise<{ key: string; reading: AspectReading }>((resolve) => {
            const img = new Image();
            img.decoding = "async";
            img.onload = () =>
              resolve({
                key,
                reading: buildAspectReading(img.naturalWidth, img.naturalHeight),
              });
            img.onerror = () =>
              resolve({
                key,
                reading: buildAspectReading(0, 0),
              });
            img.src = project.coverImage;
          }),
        );
      } else {
        immediate[key] = buildAspectReading(0, 0);
      }
    }

    Promise.all(pending).then((results) => {
      if (cancelled) return;
      const next: Record<string, AspectReading> = { ...immediate };
      for (const entry of results) next[entry.key] = entry.reading;
      setAspectByMedia(next);
    });

    return () => {
      cancelled = true;
    };
  }, [projects]);

  const groups = useMemo(() => {
    const grouped = new Map<string, { sortTier: number; sortRank: number; projects: Project[] }>();

    for (let i = 0; i < projects.length; i += 1) {
      const project = projects[i];
      const key = getProjectKey(project, i);
      const reading = aspectByMedia[key] || buildAspectReading(0, 0);
      const clusterKey = reading.clusterKey;
      const existing = grouped.get(clusterKey);
      if (existing) {
        existing.projects.push(project);
      } else {
        grouped.set(clusterKey, {
          sortTier: reading.sortTier,
          sortRank: reading.sortRank,
          projects: [project],
        });
      }
    }

    return Array.from(grouped.values())
      .sort((a, b) => {
        if (a.sortTier !== b.sortTier) return a.sortTier - b.sortTier;
        return a.sortRank - b.sortRank;
      })
      .map((entry) => entry.projects);
  }, [projects, aspectByMedia]);

  return (
    <div className="space-y-2 md:space-y-6">
      {groups.map((group, groupIdx) => (
        <div key={`group-${groupIdx}`} className={gridClassName}>
          {group.map((project, idx) => (
            <Reveal
              key={getProjectKey(project, idx)}
              delay={Math.min(0.2, (idx % 3) * 0.05)}
              variant={idx % 3 === 0 ? "up" : idx % 3 === 1 ? "left" : "right"}
            >
              <ProjectCard
                project={project}
                priority={groupIdx === 0 && idx < priorityCount}
                tone={tone}
                compact={compact}
              />
            </Reveal>
          ))}
        </div>
      ))}
    </div>
  );
}

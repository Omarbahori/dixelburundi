"use client";

import { useEffect, useRef } from "react";

export default function SectionVideo({
  src,
  pausedAtMiddle = false,
}: {
  src: string;
  pausedAtMiddle?: boolean;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (!pausedAtMiddle) {
      const maybePlay = video.play();
      if (maybePlay && typeof maybePlay.catch === "function") {
        maybePlay.catch(() => {
          // Ignore autoplay issues.
        });
      }
      return;
    }

    const onLoaded = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const target = duration > 0 ? duration / 2 : 0;
      video.currentTime = target;
      video.pause();
    };

    if (video.readyState >= 1) {
      onLoaded();
    } else {
      video.addEventListener("loadedmetadata", onLoaded);
    }

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [src, pausedAtMiddle]);

  return (
    <video
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      src={src}
      controls={false}
      controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
      disablePictureInPicture
      disableRemotePlayback
      autoPlay={!pausedAtMiddle}
      muted
      loop={!pausedAtMiddle}
      playsInline
      preload="metadata"
      aria-hidden="true"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}

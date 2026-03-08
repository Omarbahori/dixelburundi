"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary";
type Size = "sm" | "md" | "lg";
type Theme = "dark" | "light";

function sizeVars(size: Size) {
  if (size === "sm") return { "--cta-h": "40px", "--cta-px": "18px" };
  if (size === "lg") return { "--cta-h": "52px", "--cta-px": "30px" };
  return { "--cta-h": "44px", "--cta-px": "24px" };
}

const FOLLOW_MAX_PX = 6;
const TYPE_START_DELAY_MS = 180;
const TYPE_STEP_MS = 24;

export default function CTAButton({
  href,
  target,
  rel,
  onClick,
  type = "button",
  children,
  variant = "primary",
  theme = "dark",
  size = "md",
  className,
  ariaLabel,
  frontBg,
}: {
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  variant?: Variant;
  theme?: Theme;
  size?: Size;
  className?: string;
  ariaLabel?: string;
  frontBg?: string;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const typeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mouseFollowEnabled, setMouseFollowEnabled] = useState(false);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const labelText =
    typeof children === "string" || typeof children === "number"
      ? String(children)
      : null;
  const [typedText, setTypedText] = useState(() => labelText ?? "");

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      setReduceMotionEnabled(false);
      setMouseFollowEnabled(false);
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    const update = () => {
      setReduceMotionEnabled(reduceMotion.matches);
      setMouseFollowEnabled(!reduceMotion.matches && finePointer.matches);
    };

    update();
    const subscribe = (media: MediaQueryList) => {
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
      }
      media.addListener(update);
      return () => media.removeListener(update);
    };

    const unsubscribeReduceMotion = subscribe(reduceMotion);
    const unsubscribeFinePointer = subscribe(finePointer);

    return () => {
      unsubscribeReduceMotion();
      unsubscribeFinePointer();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, []);

  function stopTypewriter(resetToFull = true) {
    if (typeTimeoutRef.current) {
      clearTimeout(typeTimeoutRef.current);
      typeTimeoutRef.current = null;
    }
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
    if (resetToFull && labelText !== null) {
      setTypedText(labelText);
    }
  }

  function startTypewriter() {
    if (labelText === null) return;
    stopTypewriter(false);

    if (reduceMotionEnabled) {
      setTypedText(labelText);
      return;
    }

    setTypedText("");

    typeTimeoutRef.current = setTimeout(() => {
      let i = 0;
      typeIntervalRef.current = setInterval(() => {
        i += 1;
        setTypedText(labelText.slice(0, i));
        if (i >= labelText.length && typeIntervalRef.current) {
          clearInterval(typeIntervalRef.current);
          typeIntervalRef.current = null;
        }
      }, TYPE_STEP_MS);
    }, TYPE_START_DELAY_MS);
  }

  function updateFollow(clientX: number, clientY: number) {
    if (!mouseFollowEnabled || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width - 0.5;
    const py = (clientY - rect.top) / rect.height - 0.5;
    wrapRef.current.style.setProperty("--cta-follow-x", `${px * FOLLOW_MAX_PX}px`);
    wrapRef.current.style.setProperty("--cta-follow-y", `${py * FOLLOW_MAX_PX}px`);
  }

  function resetFollow() {
    if (!wrapRef.current) return;
    wrapRef.current.style.setProperty("--cta-follow-x", "0px");
    wrapRef.current.style.setProperty("--cta-follow-y", "0px");
  }

  const wrapCls = cn(
    "cta-wrap",
    theme === "light" ? "cta-theme-light" : "cta-theme-dark",
    className,
  );
  const isCutout = (className || "").split(/\s+/).includes("cta-cutout");
  const frontCls = cn(
    "cta-front",
    isCutout && "cta-front--cutout",
    variant === "secondary" && "cta-front--secondary",
  );
  const style = {
    ...sizeVars(size),
    ...(frontBg ? { "--cta-front-bg": frontBg } : null),
  } as React.CSSProperties;
  const content =
    labelText === null ? (
      <span className="cta-label">{children}</span>
    ) : (
      <span className="cta-label cta-label--type">
        <span className="cta-label-ghost" aria-hidden="true">
          {labelText}
        </span>
        <span className="cta-label-live">{typedText}</span>
      </span>
    );
  const wrapProps = {
    ref: wrapRef,
    className: wrapCls,
    style,
    onMouseEnter: startTypewriter,
    onMouseMove: (e: React.MouseEvent<HTMLSpanElement>) =>
      updateFollow(e.clientX, e.clientY),
    onMouseLeave: () => {
      resetFollow();
      stopTypewriter(true);
    },
    onFocusCapture: startTypewriter,
    onBlurCapture: () => stopTypewriter(true),
  };

  if (href) {
    const isExternal =
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:");

    if (isExternal) {
      return (
        <span {...wrapProps}>
          {isCutout ? (
            <span className="cta-cutout-back" aria-hidden="true" />
          ) : (
            <span className="cta-back" aria-hidden="true" />
          )}
          <a
            href={href}
            className={frontCls}
            target={target}
            rel={rel}
            onClick={onClick}
            aria-label={ariaLabel}
          >
            {content}
          </a>
        </span>
      );
    }

    return (
      <span {...wrapProps}>
        {isCutout ? (
          <span className="cta-cutout-back" aria-hidden="true" />
        ) : (
          <span className="cta-back" aria-hidden="true" />
        )}
        <Link href={href} className={frontCls} onClick={onClick} aria-label={ariaLabel}>
          {content}
        </Link>
      </span>
    );
  }

  return (
    <span {...wrapProps}>
      {isCutout ? (
        <span className="cta-cutout-back" aria-hidden="true" />
      ) : (
        <span className="cta-back" aria-hidden="true" />
      )}
      <button
        type={type}
        onClick={onClick}
        className={frontCls}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    </span>
  );
}

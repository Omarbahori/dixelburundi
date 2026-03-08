"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export default function LoopTypewriter({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;

    let delay = deleting ? 34 : 64;

    if (!deleting && display === text) delay = 1200;
    if (deleting && display.length === 0) delay = 260;

    const timer = setTimeout(() => {
      if (!deleting && display === text) {
        setDeleting(true);
        return;
      }

      if (deleting && display.length === 0) {
        setDeleting(false);
        return;
      }

      const nextLen = deleting ? display.length - 1 : display.length + 1;
      setDisplay(text.slice(0, nextLen));
    }, delay);

    return () => clearTimeout(timer);
  }, [display, deleting, text, reduce]);

  const shownText = reduce ? text : display;

  return (
    <span className={cn("loop-type-wrap", className)}>
      <span className="loop-type-ghost" aria-hidden="true">
        {text}
      </span>
      <span className="loop-type-live" data-caret={!reduce ? "on" : "off"}>
        {shownText}
      </span>
    </span>
  );
}

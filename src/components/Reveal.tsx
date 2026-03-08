"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export default function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "fade" | "left" | "right" | "zoom";
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  const initial =
    variant === "fade"
      ? { opacity: 0 }
      : variant === "left"
        ? { opacity: 0, x: -18 }
        : variant === "right"
          ? { opacity: 0, x: 18 }
          : variant === "zoom"
            ? { opacity: 0, y: 12, scale: 0.96 }
            : { opacity: 0, y: 14 };

  const animate =
    variant === "zoom"
      ? { opacity: 1, y: 0, scale: 1 }
      : variant === "left" || variant === "right"
        ? { opacity: 1, x: 0 }
        : { opacity: 1, y: 0 };

  return (
    <motion.div
      className={cn(className)}
      initial={initial}
      whileInView={animate}
      viewport={{ once, margin: "-80px 0px -40px 0px", amount: 0.2 }}
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

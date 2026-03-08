"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { TeamMember } from "@/lib/siteContent";
import CurvedGallery from "@/components/CurvedGallery";

export default function TeamSpotlight({ members }: { members: TeamMember[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const len = members.length;
  const safe = len > 0 ? ((index % len) + len) % len : 0;

  useEffect(() => {
    if (reduce || len <= 1) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => i + 1);
    }, 3200);
    return () => clearInterval(id);
  }, [len, reduce]);

  if (!len) return null;
  const member = members[safe]!;
  const prev = members[(safe - 1 + len) % len]!;
  const next = members[(safe + 1) % len]!;

  function goNext() {
    setDirection(1);
    setIndex((i) => i + 1);
  }

  function goPrev() {
    setDirection(-1);
    setIndex((i) => i - 1);
  }

  const stripVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
  };

  return (
    <div className="space-y-6">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={`${member.id}-${safe}`}
          custom={direction}
          variants={stripVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
          drag={reduce ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) goNext();
            if (info.offset.x > 50) goPrev();
          }}
        >
          <CurvedGallery
            left={{
              src: prev.image || "/placeholders/work-01.svg",
              alt: prev.name,
            }}
            center={{
              src: member.image || "/placeholders/work-01.svg",
              alt: member.name,
            }}
            right={{
              src: next.image || "/placeholders/work-01.svg",
              alt: next.name,
            }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="mx-auto max-w-3xl text-center">
        <div className="text-xs font-semibold tracking-[0.20em] text-dixel-accent">
          {member.role}
        </div>
        <h3 className="mt-1 font-display text-3xl font-semibold tracking-tighter2 text-white sm:text-4xl">
          {member.name}
        </h3>
        <p className="mt-3 text-sm leading-7 text-white/75 sm:text-base">{member.bio}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-full border border-white/18 bg-black/35 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-white/85 transition-colors hover:border-white/35 hover:text-white"
        >
          PREV
        </button>
        <button
          type="button"
          onClick={goNext}
          className="rounded-full border border-white/18 bg-black/35 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-white/85 transition-colors hover:border-white/35 hover:text-white"
        >
          NEXT
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {members.map((m, i) => (
          <button
            key={`${m.id}-${i}`}
            type="button"
            onClick={() => {
              setDirection(i > safe ? 1 : -1);
              setIndex(i);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.12em] transition-colors ${
              i === safe
                ? "border-dixel-accent bg-dixel-accent text-white"
                : "border-white/12 bg-white/4 text-white/70 hover:border-white/20 hover:text-white"
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  );
}

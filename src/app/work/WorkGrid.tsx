"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/lib/siteContent";
import { cn } from "@/lib/cn";
import ProjectGrid from "@/components/ProjectGrid";

export default function WorkGrid({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const pageFiltersRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(() => {
    const categoryStats = new Map<
      string,
      { label: string; count: number }
    >();

    for (const project of projects) {
      const raw = project.category?.trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      const existing = categoryStats.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        categoryStats.set(key, { label: raw, count: 1 });
      }
    }

    const sorted = Array.from(categoryStats.values())
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.label.localeCompare(b.label);
      })
      .map((entry) => entry.label);

    return ["All", ...sorted];
  }, [projects]);

  const [active, setActive] = useState<string>("All");
  const selectedCategory = categories.includes(active) ? active : "All";

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, projects]);

  useEffect(() => {
    const check = () => {
      const sectionNode = sectionRef.current;
      const filtersNode = pageFiltersRef.current;
      if (!sectionNode || !filtersNode) return;

      const sectionRect = sectionNode.getBoundingClientRect();
      const filtersRect = filtersNode.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const headerOffset = 108;

      const sectionVisible =
        sectionRect.bottom > headerOffset + 120 && sectionRect.top < viewportHeight - 80;
      const filtersStillVisible =
        filtersRect.top >= headerOffset && filtersRect.bottom > headerOffset;

      window.dispatchEvent(
        new CustomEvent("dixel:work-filters-nav-active", {
          detail: { active: sectionVisible && !filtersStillVisible },
        }),
      );
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);

    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    const emitSync = () => {
      window.dispatchEvent(
        new CustomEvent("dixel:work-filters-sync", {
          detail: {
            categories,
            selectedCategory,
          },
        }),
      );
    };

    emitSync();
    window.addEventListener("dixel:request-work-filters-sync", emitSync as EventListener);
    return () => {
      window.removeEventListener("dixel:request-work-filters-sync", emitSync as EventListener);
    };
  }, [categories, selectedCategory]);

  useEffect(() => {
    const onExternalSet = (event: Event) => {
      const custom = event as CustomEvent<{ category?: string }>;
      const next = custom.detail?.category;
      if (typeof next === "string" && categories.includes(next)) {
        setActive(next);
      }
    };

    window.addEventListener("dixel:set-work-category", onExternalSet as EventListener);
    return () => {
      window.removeEventListener("dixel:set-work-category", onExternalSet as EventListener);
    };
  }, [categories]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent("dixel:work-filters-nav-active", {
          detail: { active: false },
        }),
      );
      window.dispatchEvent(
        new CustomEvent("dixel:work-filters-sync", {
          detail: { categories: [], selectedCategory: "All" },
        }),
      );
    };
  }, []);

  return (
    <div ref={sectionRef} className="space-y-8">
      <div ref={pageFiltersRef} className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold tracking-tight transition-colors",
              selectedCategory === c
                ? "border-white/18 bg-white/8 text-white"
                : "border-white/12 bg-white/2 text-white/75 hover:border-white/18 hover:bg-white/6 hover:text-white",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <ProjectGrid
        projects={filtered}
        compact
        gridClassName="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-6 lg:grid-cols-3"
      />
    </div>
  );
}

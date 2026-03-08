"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { Client } from "@/lib/siteContent";
import Image from "next/image";

export default function Marquee({
  items,
  className,
  sideTone = "dark",
}: {
  items: Client[];
  className?: string;
  sideTone?: "dark" | "red";
}) {
  const reduce = useReducedMotion();
  const source = items.length ? items : [{ name: "DIXEL", industry: "Creative" }];
  const uniqueSource = Array.from(
    new Map(
      source.map((client) => [
        (client.logo || `name:${client.name}`).trim().toLowerCase(),
        client,
      ]),
    ).values(),
  );
  const rowOneSeed = uniqueSource.filter((_, idx) => idx % 2 === 0);
  const rowTwoSeed =
    uniqueSource.length > 1
      ? uniqueSource.filter((_, idx) => idx % 2 === 1)
      : uniqueSource;
  const safeRowTwoSeed = rowTwoSeed.length ? rowTwoSeed : rowOneSeed;
  const minPerRow = Math.max(
    8,
    Math.max(rowOneSeed.length, safeRowTwoSeed.length) * 3,
  );

  const rowOneBase = Array.from(
    { length: minPerRow },
    (_, i) => rowOneSeed[i % rowOneSeed.length]!,
  );
  const rowTwoBase = Array.from(
    { length: minPerRow },
    (_, i) => safeRowTwoSeed[i % safeRowTwoSeed.length]!,
  );

  const rowOne = [...rowOneBase, ...rowOneBase];
  const rowTwo = [...rowTwoBase, ...rowTwoBase];

  return (
    <div
      className={cn(
        "marquee-shell relative overflow-hidden rounded-[24px] border border-white/10 bg-white/4 sm:rounded-3xl",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent opacity-95",
          sideTone === "red" ? "from-[#e22228]" : "from-[#22201E]",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l to-transparent opacity-95",
          sideTone === "red" ? "from-[#e22228]" : "from-[#22201E]",
        )}
      />

      <div className="space-y-1 px-6 py-4 sm:py-5">
        <div
          className={cn(
            "marquee-track group/row flex w-max gap-12 py-1.5",
            reduce && "marquee-track--static",
          )}
        >
          {rowOne.map((client, idx) => (
            <div
              key={`r1-${client.name}-${idx}`}
              className="flex h-11 shrink-0 items-center gap-3 px-2 text-sm font-semibold tracking-tight text-white/80"
            >
              {client.logo ? (
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={260}
                  height={64}
                  className="marquee-logo h-7 w-auto max-w-[170px] object-contain grayscale brightness-110 contrast-90 opacity-75 transition duration-200 ease-out group-hover/row:grayscale-0 group-hover/row:brightness-100 group-hover/row:contrast-100 group-hover/row:opacity-100 sm:h-9 sm:max-w-[230px]"
                  loading="lazy"
                />
              ) : (
                <span className="whitespace-nowrap">{client.name}</span>
              )}
            </div>
          ))}
        </div>
        <div
          className={cn(
            "marquee-track marquee-track--reverse group/row flex w-max gap-12 py-1.5",
            reduce && "marquee-track--static",
          )}
        >
          {rowTwo.map((client, idx) => (
            <div
              key={`r2-${client.name}-${idx}`}
              className="flex h-11 shrink-0 items-center gap-3 px-2 text-sm font-semibold tracking-tight text-white/80"
            >
              {client.logo ? (
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={260}
                  height={64}
                  className="marquee-logo h-7 w-auto max-w-[170px] object-contain grayscale brightness-110 contrast-90 opacity-75 transition duration-200 ease-out group-hover/row:grayscale-0 group-hover/row:brightness-100 group-hover/row:contrast-100 group-hover/row:opacity-100 sm:h-9 sm:max-w-[230px]"
                  loading="lazy"
                />
              ) : (
                <span className="whitespace-nowrap">{client.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

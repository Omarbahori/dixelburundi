import Image from "next/image";
import { cn } from "@/lib/cn";

export default function PinnedServiceCard({
  title,
  summary,
  inclusions,
  icon,
  tone = "light",
  pinTiltClassName,
  accent = "red",
  titleCardRed = false,
  titleCardWhite = false,
}: {
  title: string;
  summary: string;
  inclusions: string[];
  icon?: React.ReactNode;
  tone?: "light" | "dark";
  pinTiltClassName?: string;
  accent?: "red" | "ink";
  titleCardRed?: boolean;
  titleCardWhite?: boolean;
}) {
  const isLight = tone === "light";

  const outer =
    "group relative h-full rounded-[26px] border p-7 shadow-[0_18px_60px_rgba(0,0,0,0.12)] backdrop-blur transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_24px_66px_rgba(0,0,0,0.16)] motion-reduce:transform-none motion-reduce:transition-none sm:rounded-[34px]";
  const outerTone = isLight
    ? "border-black/10 bg-white/70"
    : "border-white/10 bg-white/5";

  const panel =
    "mt-16 rounded-[22px] border p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] sm:rounded-3xl";
  const panelTone = titleCardWhite
    ? "border-white/75 bg-white/92"
    : titleCardRed
    ? "border-[rgba(255,255,255,0.25)] bg-dixel-accent"
    : isLight
    ? accent === "red"
      ? "border-[rgba(226,34,40,0.20)] bg-[rgba(226,34,40,0.06)]"
      : "border-black/12 bg-black/3"
    : accent === "red"
      ? "border-[rgba(226,34,40,0.28)] bg-[rgba(226,34,40,0.10)]"
      : "border-white/12 bg-white/4";

  return (
    <div className={cn(outer, outerTone)}>
      <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-[radial-gradient(900px_500px_at_15%_20%,rgba(226,34,40,0.10),transparent_55%)] opacity-80 sm:rounded-[34px]" />

      <div className="absolute left-1/2 top-[38px] -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/images/pin.png"
          alt=""
          width={62}
          height={62}
          className={cn(
            "h-[62px] w-[62px] drop-shadow-[0_16px_26px_rgba(0,0,0,0.25)]",
            pinTiltClassName,
          )}
          priority={false}
        />
      </div>

      <div className="relative">
        <div className={cn(panel, panelTone)}>
          {icon ? (
            <div
              className={cn(
                "mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border",
                titleCardWhite
                  ? "border-black/14 bg-black/[0.03] text-dixel-bg"
                  : titleCardRed
                    ? "border-white/22 bg-white/10 text-white"
                    : isLight
                      ? "border-black/14 bg-black/[0.03] text-dixel-bg"
                      : "border-white/16 bg-white/[0.05] text-white",
              )}
            >
              {icon}
            </div>
          ) : null}
          <div
            className={cn(
              "font-display text-xl font-semibold tracking-tight",
              titleCardWhite
                ? "text-dixel-bg"
                : titleCardRed
                  ? "text-white"
                  : isLight
                    ? "text-dixel-bg"
                    : "text-white",
            )}
          >
            {title}
          </div>
          <p
            className={cn(
              "mt-3 text-sm leading-7",
              titleCardWhite
                ? "text-black/75"
                : titleCardRed
                  ? "text-white/90"
                  : isLight
                    ? "text-black/75"
                    : "text-white/75",
            )}
          >
            {summary}
          </p>
        </div>

        <div className={cn("mt-5 space-y-2 text-sm", isLight ? "text-black/80" : "text-white/75")}>
          {inclusions.slice(0, 4).map((i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className={cn(
                  "mt-2 h-1.5 w-1.5 rounded-full",
                  isLight ? "bg-dixel-accent/90" : "bg-dixel-accent/90",
                )}
              />
              <span>{i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

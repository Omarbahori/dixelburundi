"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import CTAButton from "@/components/CTAButton";
import type { PackageTier } from "@/lib/siteContent";

type BillingMode = "monthly" | "quarterly";
type PackagesSectionMode = "services" | "home";

const MONTHLY_FBU_BY_ID: Record<string, number | undefined> = {
  starter: 300_000,
  growth: 600_000,
  signature: undefined,
};

function formatFbu(amount: number) {
  return new Intl.NumberFormat("en-US").format(amount);
}

export default function PackagesSection({
  packages,
  mode = "services",
}: {
  packages: PackageTier[];
  mode?: PackagesSectionMode;
}) {
  const [billing, setBilling] = useState<BillingMode>("monthly");
  const [sectionInView, setSectionInView] = useState(false);
  const [pageToggleVisible, setPageToggleVisible] = useState(true);
  const isHomeMode = mode === "home";
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const pageToggleRef = useRef<HTMLDivElement | null>(null);

  const pricingById = useMemo(() => {
    return Object.fromEntries(
      packages.map((p) => {
        const monthly = p.monthlyPriceFbu ?? MONTHLY_FBU_BY_ID[p.id];
        if (!monthly) {
          return [
            p.id,
            {
              id: p.id,
              label: p.priceNote,
              helper: "Custom pricing based on your scope.",
              hasNumeric: false,
            },
          ];
        }

        if (billing === "monthly") {
          const regularQuarter = monthly * 3;
          const discountedQuarter = Math.round(regularQuarter * 0.9);
          const savedQuarter = regularQuarter - discountedQuarter;
          return [
            p.id,
            {
              id: p.id,
              label: `${formatFbu(monthly)} FBU / Month`,
              helper: `Switch to 3 months and save ${formatFbu(savedQuarter)} FBU.`,
              previousLabel: "",
              hasNumeric: true,
            },
          ];
        }

        const regularQuarter = monthly * 3;
        const discountedQuarter = Math.round(regularQuarter * 0.9);
        const savedQuarter = regularQuarter - discountedQuarter;
        return [
          p.id,
          {
            id: p.id,
            label: `${formatFbu(discountedQuarter)} FBU / 3 Months`,
            helper: `Save ${formatFbu(savedQuarter)} FBU`,
            previousLabel: `${formatFbu(regularQuarter)} FBU / 3 Months`,
            hasNumeric: true,
          },
        ];
      }),
    );
  }, [billing, packages]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("dixel:packages-billing", {
        detail: { billing },
      }),
    );
  }, [billing]);

  useEffect(() => {
    const onExternalSet = (event: Event) => {
      const custom = event as CustomEvent<{ billing?: BillingMode }>;
      const next = custom.detail?.billing;
      if (next === "monthly" || next === "quarterly") {
        setBilling(next);
      }
    };

    window.addEventListener("dixel:set-packages-billing", onExternalSet as EventListener);
    return () => {
      window.removeEventListener("dixel:set-packages-billing", onExternalSet as EventListener);
    };
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setSectionInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionInView(Boolean(entry?.isIntersecting));
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: "-88px 0px -42% 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [mode]);

  useEffect(() => {
    const node = pageToggleRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setPageToggleVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPageToggleVisible(Boolean(entry?.isIntersecting));
      },
      {
        root: null,
        threshold: 0.35,
        rootMargin: "-88px 0px -8% 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [mode]);

  useEffect(() => {
    const active = sectionInView && !pageToggleVisible;
    window.dispatchEvent(
      new CustomEvent("dixel:packages-nav-active", {
        detail: { active },
      }),
    );
  }, [sectionInView, pageToggleVisible]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent("dixel:packages-nav-active", {
          detail: { active: false },
        }),
      );
    };
  }, []);

  return (
    <div ref={sectionRef} className="mt-14">
      <div className="space-y-3 text-center">
        <div className="text-xs font-semibold tracking-[0.20em] text-white/60">PACKAGES</div>
        <h2 className="font-display text-4xl font-semibold tracking-tighter2 text-white sm:text-6xl">
          Ready to get started?
        </h2>
        <p className="text-base font-semibold text-white/75 sm:text-lg">
          Exclusive offer: <span className="text-white">Save more with 3 months billing.</span>
        </p>
      </div>

      <div ref={pageToggleRef} className="mt-6 flex justify-center">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/12 bg-black/45 px-3 py-1.5 shadow-[0_10px_32px_rgba(0,0,0,0.28)] backdrop-blur-md sm:gap-3 sm:px-4 sm:py-2">
          <span className={cn("whitespace-nowrap text-[11px] font-semibold sm:text-sm", billing === "monthly" ? "text-white" : "text-white/65")}>
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setBilling((v) => (v === "monthly" ? "quarterly" : "monthly"))}
            className={cn(
              "relative h-9 w-16 rounded-full transition sm:h-11 sm:w-20",
              billing === "quarterly"
                ? "bg-dixel-accent ring-1 ring-dixel-accent/60"
                : "bg-[#dddddf] ring-1 ring-black/8",
            )}
            aria-label="Toggle billing mode"
          >
            <span
              className={cn(
                "absolute left-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-transform sm:h-8 sm:w-8",
                billing === "quarterly" ? "translate-x-8 sm:translate-x-10" : "translate-x-0",
              )}
            />
          </button>
          <span className={cn("whitespace-nowrap text-[11px] font-semibold sm:text-sm", billing === "quarterly" ? "text-white" : "text-white/65")}>
            Quarterly
          </span>
          <span className="rounded-md border border-[#f4d07f]/35 bg-[#f4d07f] px-3 py-1 text-xs font-semibold text-[#2b2623] shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
            Save Money
          </span>
        </div>
      </div>

      <div className="relative mt-10 overflow-hidden rounded-[22px] border border-white/10 bg-[#F6F8F5] p-6 shadow-[0_18px_56px_rgba(0,0,0,0.14)] sm:rounded-[44px] sm:p-10 surface-light">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_15%_15%,rgba(226,34,40,0.10),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 via-white to-white" />

        <div className="relative grid gap-6 lg:grid-cols-3">
          {packages.map((p, idx) => {
            const tilt = p.id === "starter" ? "-rotate-6" : p.id === "growth" ? "rotate-3" : "-rotate-2";
            const isFeatured = p.id === "growth";
            const price = pricingById[p.id] as
              | {
                  id: string;
                  label: string;
                  helper: string;
                  previousLabel?: string;
                  hasNumeric: boolean;
                }
              | undefined;

            return (
              <div
                key={p.id}
                id={`package-${p.id}`}
                className={cn(
                  "relative h-full scroll-mt-28 rounded-[26px] border p-6 shadow-[0_18px_60px_rgba(0,0,0,0.12)] backdrop-blur sm:rounded-[34px]",
                  isFeatured
                    ? "border-[rgba(226,34,40,0.45)] bg-white/90 shadow-[0_24px_70px_rgba(226,34,40,0.24)]"
                    : "border-black/10 bg-white/65",
                )}
              >
                <div className="absolute left-1/2 top-[38px] -translate-x-1/2 -translate-y-1/2">
                  <Image
                    src="/images/pin.png"
                    alt=""
                    width={62}
                    height={62}
                    className={`h-[62px] w-[62px] drop-shadow-[0_16px_26px_rgba(0,0,0,0.25)] ${tilt}`}
                    priority={idx === 1}
                  />
                </div>

                {isFeatured && (
                  <div className="absolute right-5 top-5 rounded-md border border-[#f4d07f]/35 bg-[#f4d07f] px-3 py-1 text-xs font-semibold text-[#2b2623] shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
                    Best Value
                  </div>
                )}

                <div
                  className={cn(
                    "mt-16 rounded-[22px] border p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] sm:rounded-3xl",
                    isFeatured
                      ? "border-[rgba(255,255,255,0.22)] bg-dixel-accent text-white"
                      : "border-black/10 bg-[rgba(240,242,247,0.78)]",
                  )}
                >
                  <div className={cn("font-display text-2xl font-semibold tracking-tight", isFeatured ? "text-white" : "text-dixel-bg")}>
                    {p.name}
                  </div>
                  {price?.previousLabel ? (
                    <p
                      className={cn(
                        "mt-2 text-xs font-semibold line-through decoration-2",
                        isFeatured
                          ? "text-white/70 decoration-black"
                          : "text-black/55 decoration-dixel-accent",
                      )}
                    >
                      {price.previousLabel}
                    </p>
                  ) : null}
                  <div
                    className={cn(
                      "mt-2 font-semibold",
                      isFeatured || p.id === "starter"
                        ? isFeatured
                          ? "text-base sm:text-lg text-white/95"
                          : "text-base sm:text-lg text-black/80"
                        : "text-sm text-black/80",
                    )}
                  >
                    {price?.label}
                  </div>
                  <p className={cn("mt-1 text-xs font-semibold", isFeatured ? "text-white/85" : "text-black/55")}>
                    {price?.helper}
                  </p>
                  <p className={cn("mt-4 text-sm leading-7", isFeatured ? "text-white/92" : "text-black/75")}>
                    {p.bestFor}
                  </p>
                </div>

                {!isHomeMode ? (
                  <div className="mt-5 space-y-2 text-sm text-black/80">
                    {p.includes.map((i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-dixel-accent/90" />
                        <span>{i}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-8">
                  <CTAButton
                    href={isHomeMode ? `/services#package-${p.id}` : `/contact?package=${encodeURIComponent(p.id)}`}
                    className="w-full"
                    theme="light"
                  >
                    {isHomeMode ? "Learn more" : "Request quote"}
                  </CTAButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
